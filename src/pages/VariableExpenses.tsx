import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Receipt, Check, Clock, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { VariableExpenseFormDialog } from '@/components/forms/VariableExpenseFormDialog';
import { useVariableExpenses, VariableExpense } from '@/hooks/useVariableExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const categoryLabels: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  marketing: 'Marketing',
  escritorio: 'Escritório',
  tecnologia: 'Tecnologia',
  viagem: 'Viagem',
  servicos: 'Serviços',
  impostos: 'Impostos',
  other: 'Outros',
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  transferencia: 'Transferência',
};

function formatDateBR(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

const VariableExpenses = () => {
  const { data: expenses = [], isLoading, create, update, delete: deleteExpense, isCreating, isUpdating, isDeleting } = useVariableExpenses();
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<VariableExpense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<VariableExpense | null>(null);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const handleEdit = (expense: VariableExpense) => {
    setSelectedExpense(expense);
    setFormOpen(true);
  };

  const handleMarkAsPaid = (expense: VariableExpense) => {
    update({ id: expense.id, reimbursement_status: 'paid' });
  };

  const handleDelete = (expense: VariableExpense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleFormSubmit = (data: Partial<VariableExpense>) => {
    if (selectedExpense) {
      update({ id: selectedExpense.id, ...data });
    } else {
      create(data);
    }
    setSelectedExpense(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Despesas Variáveis</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gastos do dia a dia • Total: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => { setSelectedExpense(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="w-12 h-12 mb-4 opacity-50" />
            <p>Nenhuma despesa variável cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Reembolso</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {(canEdit || canDelete) && <TableHead className="w-[100px]">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {formatDateBR(expense.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[expense.category] || expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.payment_method
                        ? paymentMethodLabels[expense.payment_method] || expense.payment_method
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {expense.is_reimbursement ? (
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            {expense.reimbursement_status === 'paid' ? (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Pago
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </Badge>
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleMarkAsPaid(expense)}
                                  >
                                    Marcar pago
                                  </Button>
                                )}
                              </div>
                            )}
                            {expense.receipt_url && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={expense.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>Ver comprovante</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <VariableExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={selectedExpense}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir Despesa"
        description={`Tem certeza que deseja excluir a despesa "${expenseToDelete?.description}"?`}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
};

export default VariableExpenses;
