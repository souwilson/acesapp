import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, FileText, Check, Loader2, ExternalLink } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaxes, useDeleteTax, useUpdateTax, Tax } from '@/hooks/useTaxes';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { TaxFormDialog } from '@/components/forms/TaxFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

const Taxes = () => {
  const { data: taxes = [], isLoading } = useTaxes();
  const deleteTax = useDeleteTax();
  const updateTax = useUpdateTax();
  const createAuditLog = useCreateAuditLog();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

  const filteredTaxes = taxes.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && t.paid) ||
      (statusFilter === 'pending' && !t.paid);
    return matchesSearch && matchesStatus;
  });

  const totalPending = taxes.filter((t) => !t.paid).reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPaid = taxes.filter((t) => t.paid).reduce((sum, t) => sum + Number(t.amount), 0);

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setFormOpen(true);
  };

  const handleDelete = (tax: Tax) => {
    setTaxToDelete(tax);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taxToDelete) {
      await deleteTax.mutateAsync(taxToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'taxes',
        entityId: taxToDelete.id,
        entityName: taxToDelete.description,
        oldValues: taxToDelete as unknown as Json,
      });
      setDeleteDialogOpen(false);
      setTaxToDelete(null);
    }
  };

  const handleTogglePaid = async (tax: Tax) => {
    const newPaid = !tax.paid;
    await updateTax.mutateAsync({
      id: tax.id,
      paid: newPaid,
      paid_at: newPaid ? new Date().toISOString() : null,
    });
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTax(null);
  };

  const formatDateBR = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
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
          <h1 className="text-3xl font-bold text-foreground">Impostos</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de DARFs e tributos
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Imposto
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-warning/20 bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">Pendentes</p>
          <p className="text-2xl font-bold text-warning">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {taxes.filter((t) => !t.paid).length} impostos a pagar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">Pagos</p>
          <p className="text-2xl font-bold text-success">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {taxes.filter((t) => t.paid).length} impostos pagos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Impostos</p>
          <p className="text-2xl font-bold text-foreground">{taxes.length}</p>
          <p className="text-sm text-muted-foreground mt-1">cadastrados</p>
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
            placeholder="Buscar imposto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
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
        ) : filteredTaxes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {taxes.length === 0 ? 'Nenhum imposto cadastrado ainda.' : 'Nenhum imposto encontrado.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                <TableHead className="text-muted-foreground">Competência</TableHead>
                <TableHead className="text-muted-foreground">Vencimento</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">PDF</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaxes.map((tax) => (
                <TableRow key={tax.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{tax.description}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-foreground">
                    R$ {Number(tax.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateBR(tax.tax_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateBR(tax.due_date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'cursor-pointer',
                        tax.paid
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-warning/10 text-warning border-warning/30'
                      )}
                      onClick={() => handleTogglePaid(tax)}
                    >
                      {tax.paid ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Pago
                        </span>
                      ) : (
                        'Pendente'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      if (!tax.receipt_url) return <span className="text-muted-foreground text-sm">—</span>;
                      let urls: string[] = [];
                      try {
                        const parsed = JSON.parse(tax.receipt_url);
                        urls = Array.isArray(parsed) ? parsed : [tax.receipt_url];
                      } catch {
                        urls = [tax.receipt_url];
                      }
                      return (
                        <div className="flex items-center gap-1">
                          {urls.map((url, i) => (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>PDF {i + 1}</TooltipContent>
                            </Tooltip>
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{urls.length}</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tax)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tax)}
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

      <TaxFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        tax={editingTax}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir imposto"
        description={`Tem certeza que deseja excluir "${taxToDelete?.description}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteTax.isPending}
      />
    </DashboardLayout>
  );
};

export default Taxes;
