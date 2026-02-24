import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
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
import { useMFA, type MFAFactor } from '@/hooks/useMFA';

interface MFAChallengeDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAChallengeDialog({ open, onSuccess, onCancel }: MFAChallengeDialogProps) {
  const [code, setCode] = useState('');
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const { isLoading, challengeAndVerify, getVerifiedFactors } = useMFA();

  useEffect(() => {
    if (open) {
      getVerifiedFactors().then(setFactors);
    }
  }, [open]);

  const handleVerify = async () => {
    if (factors.length === 0) return;
    
    const success = await challengeAndVerify(code, factors[0].id);
    if (success) {
      setCode('');
      onSuccess();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verificação MFA
          </DialogTitle>
          <DialogDescription>
            Digite o código do seu aplicativo autenticador para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-challenge-code">Código de verificação</Label>
            <Input
              id="mfa-challenge-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Abra seu aplicativo autenticador e insira o código de 6 dígitos
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
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
      </DialogContent>
    </Dialog>
  );
}
