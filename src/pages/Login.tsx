import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ShieldAlert, Shield } from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255, 'E-mail muito longo'),
  password: z.string().min(1, 'Senha obrigatória').max(128, 'Senha muito longa'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, completeMFAChallenge, user, requiresMFA } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and MFA is not required
  useEffect(() => {
    if (user && !requiresMFA) {
      navigate('/');
    }
  }, [user, requiresMFA, navigate]);

  // Show MFA screen if required
  useEffect(() => {
    if (requiresMFA) {
      setShowMFA(true);
    }
  }, [requiresMFA]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const { error, requiresMFA: needsMFA } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Acesso negado',
        description: error.message,
        variant: 'destructive',
      });
    } else if (needsMFA) {
      setShowMFA(true);
      toast({ title: 'Verificação MFA necessária' });
    } else {
      toast({ title: 'Login realizado com sucesso!' });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mfaCode.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'O código deve ter 6 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await completeMFAChallenge(mfaCode);
    
    if (error) {
      toast({
        title: 'Verificação falhou',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Login realizado com sucesso!' });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleCancelMFA = async () => {
    // Sign out and reset state
    setShowMFA(false);
    setMfaCode('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-2 sm:px-0"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logoImage} alt="AcesofScale" className="w-12 h-12 rounded-xl object-contain" />
          <h1 className="text-2xl font-bold text-foreground">AcesofScale</h1>
        </div>

        <Card className="border-border/50 shadow-xl">
          {showMFA ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Verificação MFA
                </CardTitle>
                <CardDescription>
                  Digite o código do seu aplicativo autenticador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMFAVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfa-code">Código de 6 dígitos</Label>
                    <Input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest font-mono"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || mfaCode.length !== 6}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Verificar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCancelMFA}
                  >
                    Voltar
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) 
                    e insira o código de 6 dígitos.
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Acesso Restrito
                </CardTitle>
                <CardDescription>
                  Sistema exclusivo para usuários autorizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    Entrar
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    Este sistema é restrito a usuários previamente autorizados. 
                    Para solicitar acesso, entre em contato com o administrador.
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
