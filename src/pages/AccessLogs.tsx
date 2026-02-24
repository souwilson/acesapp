import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoginAudit } from '@/hooks/useLoginAudit';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const reasonLabels: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  success: { label: 'Login OK', variant: 'default' },
  not_whitelisted: { label: 'Não autorizado', variant: 'destructive' },
  not_whitelisted_post_auth: { label: 'Não autorizado (pós-auth)', variant: 'destructive' },
  auth_failed: { label: 'Credenciais inválidas', variant: 'secondary' },
  rate_limited: { label: 'Rate limit', variant: 'destructive' },
  inactive: { label: 'Usuário inativo', variant: 'secondary' },
};

export default function AccessLogs() {
  const { auditLogs, isLoading } = useLoginAudit();
  const [searchEmail, setSearchEmail] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesEmail = log.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesSuccess = filterSuccess === 'all' 
      || (filterSuccess === 'success' && log.success) 
      || (filterSuccess === 'failed' && !log.success);
    return matchesEmail && matchesSuccess;
  });

  const successCount = auditLogs.filter(l => l.success).length;
  const failedCount = auditLogs.filter(l => !l.success).length;
  const rateLimitedCount = auditLogs.filter(l => l.reason === 'rate_limited').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs de Acesso</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de tentativas de login no sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{successCount}</p>
                  <p className="text-sm text-muted-foreground">Logins bem-sucedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{failedCount}</p>
                  <p className="text-sm text-muted-foreground">Tentativas bloqueadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rateLimitedCount}</p>
                  <p className="text-sm text-muted-foreground">Bloqueios por rate limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por e-mail..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSuccess} onValueChange={setFilterSuccess}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Acessos</CardTitle>
            <CardDescription>
              Últimos 500 registros de tentativas de login
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum registro encontrado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const reasonInfo = reasonLabels[log.reason || ''] || { 
                        label: log.reason || 'Desconhecido', 
                        variant: 'outline' as const 
                      };
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{log.email}</TableCell>
                          <TableCell>
                            {log.success ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Sucesso
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Bloqueado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={reasonInfo.variant}>
                              {reasonInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground text-xs">
                            {log.user_agent || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
