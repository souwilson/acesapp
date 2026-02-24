import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollaborators, useDeleteCollaborator, Collaborator } from '@/hooks/useCollaborators';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { CollaboratorFormDialog } from '@/components/forms/CollaboratorFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

const collaboratorTypeLabels: Record<string, string> = {
  freelancer: 'Freelancer',
  pj: 'PJ',
  fixed: 'Fixo',
};

const typeColors: Record<string, string> = {
  freelancer: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  pj: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
  fixed: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
};

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/30',
  paused: 'bg-warning/10 text-warning border-warning/30',
  ended: 'bg-destructive/10 text-destructive border-destructive/30',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  ended: 'Encerrado',
};

const Team = () => {
  const { data: collaborators = [], isLoading } = useCollaborators();
  const deleteCollaborator = useDeleteCollaborator();
  const createAuditLog = useCreateAuditLog();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<Collaborator | null>(null);

  const filteredCollaborators = collaborators.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalMonthlyCost = collaborators
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_value), 0);

  const activeCount = collaborators.filter((c) => c.status === 'active').length;

  const types = Object.keys(collaboratorTypeLabels);

  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormOpen(true);
  };

  const handleDelete = (collaborator: Collaborator) => {
    setCollaboratorToDelete(collaborator);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (collaboratorToDelete) {
      await deleteCollaborator.mutateAsync(collaboratorToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'collaborators',
        entityId: collaboratorToDelete.id,
        entityName: collaboratorToDelete.name,
        oldValues: collaboratorToDelete as unknown as import('@/integrations/supabase/types').Json,
      });
      setDeleteDialogOpen(false);
      setCollaboratorToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCollaborator(null);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground mt-1">
            Controle de equipe e custos com pessoal
          </p>
        </div>
        <Button 
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Custo Mensal Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalMonthlyCost.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-4">Colaboradores Ativos</p>
          <p className="text-2xl font-bold text-success">{activeCount}</p>
          <p className="text-sm text-muted-foreground mt-1">
            de {collaborators.length} total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-4">Por Tipo</p>
          <div className="flex gap-4">
            {types.map((type) => {
              const count = collaborators.filter((c) => c.type === type && c.status === 'active').length;
              return (
                <div key={type} className="text-center">
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{collaboratorTypeLabels[type]}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou função..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filtrar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {collaboratorTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCollaborators.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {collaborators.length === 0 ? 'Nenhum colaborador cadastrado ainda.' : 'Nenhum colaborador encontrado.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Colaborador</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Função</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor Mensal</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollaborators.map((collaborator) => (
                <TableRow key={collaborator.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {collaborator.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{collaborator.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', typeColors[collaborator.type])}>
                      {collaboratorTypeLabels[collaborator.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{collaborator.role}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-foreground">
                    R$ {Number(collaborator.monthly_value).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn('border', statusColors[collaborator.status])}>
                      {statusLabels[collaborator.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(collaborator)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(collaborator)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <CollaboratorFormDialog 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        collaborator={editingCollaborator} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir colaborador"
        description={`Tem certeza que deseja excluir "${collaboratorToDelete?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteCollaborator.isPending}
      />
    </DashboardLayout>
  );
};

export default Team;
