import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoginAuditEntry {
  id: string;
  email: string;
  success: boolean;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export function useLoginAudit() {
  const { data: auditLogs = [], isLoading, error } = useQuery({
    queryKey: ['login-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data as LoginAuditEntry[];
    },
  });

  return {
    auditLogs,
    isLoading,
    error,
  };
}

export async function logLoginAttempt(
  email: string,
  success: boolean,
  reason?: string
): Promise<void> {
  try {
    await supabase.rpc('log_login_attempt', {
      _email: email,
      _success: success,
      _reason: reason || null,
      _ip_address: null,
      _user_agent: navigator.userAgent || null,
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

export async function checkRateLimited(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_rate_limited', {
      _email: email,
    });
    
    if (error) {
      console.error('Failed to check rate limit:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return false;
  }
}

export async function checkIsAllowed(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_allowed_user', {
      _email: email,
    });
    
    if (error) {
      console.error('Failed to check whitelist:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Failed to check whitelist:', error);
    return false;
  }
}

export async function checkIsAdmin(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      _email: email,
    });
    
    if (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

export async function getUserRole(email: string): Promise<'admin' | 'manager' | 'viewer' | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_role', {
      _email: email,
    });
    
    if (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
    
    return data as 'admin' | 'manager' | 'viewer' | null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}
