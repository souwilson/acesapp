import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ArrowDownLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { useWithdrawals, useDeleteWithdrawal, Withdrawal } from '@/hooks/useWithdrawals';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { WithdrawalFormDialog } from '@/components/forms/WithdrawalFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

const reasonColors: Record<string, string> = {
  'Pró-labore': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Distribuição de lucros': 'bg-green-500/10 text-green-400 border-green-500/30',
  'Reembolso de despesas': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'Adiantamento': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Outros': 'bg-muted text-muted-foreground border-border',
};

const Withdrawals = () => {
  const { data: withdrawals = [], isLoading } = useWithdrawals();
  const deleteWithdrawal = useDeleteWithdrawal();
  const createAuditLog = useCreateAuditLog();
  
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Withdrawal | null>(null);

  const filteredWithdrawals = withdrawals.filter((w) => {
    return destinationFilter === 'all' || w.destination === destinationFilter;
  });

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  
  const destinations = [...new Set(withdrawals.map((w) => w.destination))];

  const totalByDestination = destinations.map((dest) => ({
    destination: dest,
    total: withdrawals
      .filter((w) => w.destination === dest)
      .reduce((sum, w) => sum + Number(w.amount), 0),
  }));

  const handleEdit = (withdrawal: Withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setFormOpen(true);
  };

  const handleDelete = (withdrawal: Withdrawal) => {
    setWithdrawalToDelete(withdrawal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (withdrawalToDelete) {
      await deleteWithdrawal.mutateAsync(withdrawalToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'withdrawals',
        entityId: withdrawalToDelete.id,
        entityName: `R$ ${withdrawalToDelete.amount} - ${withdrawalToDelete.reason}`,
        oldValues: withdrawalToDelete as unknown as Json,
      });
      setDeleteDialogOpen(false);
      setWithdrawalToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingWithdrawal(null);
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
          <h1 className="text-3xl font-bold text-foreground">Retiradas PJ → PF</h1>
          <p className="text-muted-foreground mt-1">
            Controle de saques da pessoa jurídica para física
          </p>
        </div>
        <Button 
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Retirada
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
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Retirado</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        {totalByDestination.slice(0, 2).map((item, index) => (
          <motion.div
            key={item.destination}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="text-sm font-medium text-muted-foreground mb-4">{item.destination}</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {withdrawals.filter((w) => w.destination === item.destination).length} retiradas
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex gap-4 mb-6"
      >
        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Filtrar destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os destinos</SelectItem>
            {destinations.map((dest) => (
              <SelectItem key={dest} value={dest}>
                {dest}
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
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {withdrawals.length === 0 ? 'Nenhuma retirada registrada ainda.' : 'Nenhuma retirada encontrada.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Motivo</TableHead>
                <TableHead className="text-muted-foreground">Destino</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id} className="border-border">
                  <TableCell className="text-muted-foreground">
                    {new Date(withdrawal.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn('border', reasonColors[withdrawal.reason] || reasonColors['Outros'])}
                    >
                      {withdrawal.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {withdrawal.destination}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-destructive">
                    R$ {Number(withdrawal.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(withdrawal)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(withdrawal)}
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

      <WithdrawalFormDialog 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        withdrawal={editingWithdrawal} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir retirada"
        description={`Tem certeza que deseja excluir a retirada de R$ ${withdrawalToDelete?.amount}? Esta ação não pode ser desfeita.`}
        isLoading={deleteWithdrawal.isPending}
      />
    </DashboardLayout>
  );
};

export default Withdrawals;
