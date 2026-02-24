import { useState } from 'react';
import { Shield, Copy, Check, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMFA } from '@/hooks/useMFA';
import { toast } from '@/hooks/use-toast';

interface MFAEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MFAEnrollDialog({ open, onOpenChange, onSuccess }: MFAEnrollDialogProps) {
  const [step, setStep] = useState<'start' | 'qr' | 'verify'>('start');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { isLoading, qrCode, secret, enrollMFA, verifyMFA, cancelEnrollment } = useMFA();

  const handleStart = async () => {
    const result = await enrollMFA();
    if (result) {
      setStep('qr');
    }
  };

  const handleVerify = async () => {
    const success = await verifyMFA(code);
    if (success) {
      setCode('');
      setStep('start');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast({ title: 'Chave copiada!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    cancelEnrollment();
    setStep('start');
    setCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Configurar Autenticação Multifator
          </DialogTitle>
          <DialogDescription>
            Adicione uma camada extra de segurança à sua conta
          </DialogDescription>
        </DialogHeader>

        {step === 'start' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A autenticação multifator (MFA) protege sua conta exigindo um código 
              de um aplicativo autenticador além da sua senha.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium">Aplicativos recomendados:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleStart} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 'qr' && qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR code abaixo com seu aplicativo autenticador:
            </p>
            <div className="flex justify-center p-4 bg-card rounded-lg border">
              <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Ou insira manualmente esta chave:
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={secret || ''} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopySecret}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStep('verify')}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Digite o código de 6 dígitos do seu aplicativo autenticador:
            </p>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Código de verificação</Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('qr')}>
                Voltar
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={isLoading || code.length !== 6}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verificar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
