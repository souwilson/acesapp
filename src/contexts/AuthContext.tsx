import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthenticatorAssuranceLevels } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  logLoginAttempt, 
  checkRateLimited, 
  checkIsAllowed, 
  checkIsAdmin,
  getUserRole 
} from '@/hooks/useLoginAudit';

export type AppRole = 'admin' | 'manager' | 'viewer';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  isManager: boolean;
  canEdit: boolean;
  requiresMFA: boolean;
  mfaFactorId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; requiresMFA?: boolean }>;
  signOut: () => Promise<void>;
  completeMFAChallenge: (code: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const canEdit = role === 'admin' || role === 'manager';

  const verifyAndSetRole = async (email: string) => {
    const userRole = await getUserRole(email);
    setRole(userRole);
  };

  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    
    // If user has MFA factors but hasn't verified yet in this session
    if (data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
      // Get the factor ID for challenge
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      if (factorsData?.totp && factorsData.totp.length > 0) {
        const verifiedFactor = factorsData.totp.find(f => f.status === 'verified');
        if (verifiedFactor) {
          setMfaFactorId(verifiedFactor.id);
          setRequiresMFA(true);
          return true;
        }
      }
    }
    
    setRequiresMFA(false);
    setMfaFactorId(null);
    return false;
  };

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile and role using setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            setProfile(data);
            
            if (session.user.email) {
              await verifyAndSetRole(session.user.email);
            }
            
            // Check MFA status
            await checkMFAStatus();
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setRequiresMFA(false);
          setMfaFactorId(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data));
        
        if (session.user.email) {
          verifyAndSetRole(session.user.email);
        }
        
        // Check MFA status
        checkMFAStatus();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; requiresMFA?: boolean }> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check rate limiting first
    const isRateLimited = await checkRateLimited(normalizedEmail);
    if (isRateLimited) {
      await logLoginAttempt(normalizedEmail, false, 'rate_limited');
      return { 
        error: new Error('Muitas tentativas de login. Aguarde 10 minutos antes de tentar novamente.') 
      };
    }

    // Check if user is in whitelist BEFORE attempting auth
    const isAllowed = await checkIsAllowed(normalizedEmail);
    if (!isAllowed) {
      await logLoginAttempt(normalizedEmail, false, 'not_whitelisted');
      return { 
        error: new Error('Acesso restrito. Solicite liberação ao administrador.') 
      };
    }

    // Attempt authentication
    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email: normalizedEmail, 
      password 
    });
    
    if (authError) {
      await logLoginAttempt(normalizedEmail, false, 'auth_failed');
      // Generic error message to avoid exposing user existence
      return { error: new Error('Credenciais inválidas.') };
    }

    // Double-check whitelist after successful auth (defense in depth)
    const stillAllowed = await checkIsAllowed(normalizedEmail);
    if (!stillAllowed) {
      await supabase.auth.signOut();
      await logLoginAttempt(normalizedEmail, false, 'not_whitelisted_post_auth');
      return { 
        error: new Error('Acesso restrito. Solicite liberação ao administrador.') 
      };
    }

    // Check if MFA is required
    const mfaRequired = await checkMFAStatus();
    if (mfaRequired) {
      return { error: null, requiresMFA: true };
    }

    // Log successful login
    await logLoginAttempt(normalizedEmail, true, 'success');
    
    // Get and set role
    await verifyAndSetRole(normalizedEmail);
    
    return { error: null };
  };

  const completeMFAChallenge = async (code: string): Promise<{ error: Error | null }> => {
    if (!mfaFactorId) {
      return { error: new Error('Nenhum fator MFA encontrado.') };
    }

    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });

      if (challengeError) {
        return { error: new Error('Erro ao criar desafio MFA.') };
      }

      // Verify challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        return { error: new Error('Código MFA inválido.') };
      }

      // MFA verified successfully
      setRequiresMFA(false);
      setMfaFactorId(null);

      // Log successful login with MFA
      if (user?.email) {
        await logLoginAttempt(user.email, true, 'success_mfa');
        await verifyAndSetRole(user.email);
      }

      return { error: null };
    } catch (error) {
      return { error: new Error('Erro ao verificar MFA.') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
    setRequiresMFA(false);
    setMfaFactorId(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      role,
      isAdmin,
      isManager,
      canEdit,
      requiresMFA,
      mfaFactorId,
      signIn, 
      signOut,
      completeMFAChallenge,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
