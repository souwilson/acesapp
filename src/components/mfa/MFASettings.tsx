import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMFA, type MFAFactor } from '@/hooks/useMFA';
import { MFAEnrollDialog } from './MFAEnrollDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MFASettings() {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [isLoadingFactors, setIsLoadingFactors] = useState(true);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [deleteFactorId, setDeleteFactorId] = useState<string | null>(null);
  const { listFactors, unenrollMFA, isLoading } = useMFA();

  const loadFactors = async () => {
    setIsLoadingFactors(true);
    const data = await listFactors();
    setFactors(data.filter(f => f.status === 'verified'));
    setIsLoadingFactors(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleDelete = async () => {
    if (!deleteFactorId) return;
    const success = await unenrollMFA(deleteFactorId);
    if (success) {
      await loadFactors();
    }
    setDeleteFactorId(null);
  };

  const hasMFA = factors.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Autenticação Multifator (MFA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            {hasMFA ? (
              <>
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-primary">
                    MFA Ativado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sua conta está protegida com autenticação multifator
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldOff className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">
                    MFA Desativado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos ativar para maior segurança
                  </p>
                </div>
              </>
            )}
          </div>

          {isLoadingFactors ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {factors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Dispositivos configurados:</p>
                  {factors.map((factor) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {factor.friendly_name || 'Autenticador TOTP'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Configurado em{' '}
                            {format(new Date(factor.created_at), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-primary border-primary">
                          Ativo
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteFactorId(factor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {factors.length === 0 && (
                <Button onClick={() => setEnrollOpen(true)} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Configurar MFA
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MFAEnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        onSuccess={loadFactors}
      />

      <DeleteConfirmDialog
        open={!!deleteFactorId}
        onOpenChange={(open) => !open && setDeleteFactorId(null)}
        onConfirm={handleDelete}
        title="Remover MFA"
        description="Tem certeza que deseja remover a autenticação multifator? Isso diminuirá a segurança da sua conta."
        isLoading={isLoading}
      />
    </>
  );
}
