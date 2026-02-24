import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Filter, Clock, FileEdit, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogs } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';

const actionLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  create: { label: 'Criação', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Plus },
  update: { label: 'Atualização', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileEdit },
  delete: { label: 'Exclusão', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Trash2 },
};

const entityLabels: Record<string, string> = {
  platforms: 'Plataformas',
  tools: 'Despesas Fixas',
  collaborators: 'Colaboradores',
  ad_performance: 'Ads & Performance',
  withdrawals: 'Retiradas',
};

export default function History() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      (log.entity_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const formatChanges = (oldValues: Json | null, newValues: Json | null) => {
    if (!oldValues && !newValues) return null;
    
    const oldObj = (typeof oldValues === 'object' && oldValues !== null && !Array.isArray(oldValues)) 
      ? oldValues as Record<string, Json> 
      : {};
    const newObj = (typeof newValues === 'object' && newValues !== null && !Array.isArray(newValues)) 
      ? newValues as Record<string, Json> 
      : {};

    const changes: { field: string; from: string; to: string }[] = [];
    const allKeys = new Set([
      ...Object.keys(oldObj),
      ...Object.keys(newObj),
    ]);

    allKeys.forEach((key) => {
      if (['id', 'created_at', 'updated_at'].includes(key)) return;
      
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          from: oldVal !== undefined ? String(oldVal) : '-',
          to: newVal !== undefined ? String(newVal) : '-',
        });
      }
    });

    return changes;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
              <p className="text-sm text-muted-foreground">
                Registro de todas as alterações do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário ou item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas entidades</SelectItem>
                    <SelectItem value="platforms">Plataformas</SelectItem>
                    <SelectItem value="tools">Despesas Fixas</SelectItem>
                    <SelectItem value="collaborators">Colaboradores</SelectItem>
                    <SelectItem value="ad_performance">Ads & Performance</SelectItem>
                    <SelectItem value="withdrawals">Retiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log, index) => {
                    const actionInfo = actionLabels[log.action];
                    const ActionIcon = actionInfo.icon;
                    const changes = formatChanges(log.old_values, log.new_values);

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex gap-4 pb-4 border-b border-border/50 last:border-0"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${actionInfo.color}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">
                                  {log.user_name}
                                </span>
                                <Badge variant="outline" className={actionInfo.color}>
                                  {actionInfo.label}
                                </Badge>
                                <Badge variant="secondary">
                                  {entityLabels[log.entity_type] || log.entity_type}
                                </Badge>
                              </div>
                              {log.entity_name && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Item: <span className="text-foreground">{log.entity_name}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {format(new Date(log.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                            </div>
                          </div>

                          {/* Changes details */}
                          {changes && changes.length > 0 && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                              <p className="text-xs text-muted-foreground mb-2 font-medium">Alterações:</p>
                              <div className="space-y-1">
                                {changes.slice(0, 5).map((change, i) => (
                                  <div key={i} className="flex gap-2 text-xs">
                                    <span className="text-muted-foreground font-mono">{change.field}:</span>
                                    {log.action === 'create' ? (
                                      <span className="text-green-400">{change.to}</span>
                                    ) : log.action === 'delete' ? (
                                      <span className="text-red-400 line-through">{change.from}</span>
                                    ) : (
                                      <>
                                        <span className="text-red-400 line-through">{change.from}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="text-green-400">{change.to}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                                {changes.length > 5 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{changes.length - 5} outras alterações
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
