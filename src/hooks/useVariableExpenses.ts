import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface VariableExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  payment_method: string | null;
  notes: string | null;
  is_reimbursement: boolean;
  receipt_url: string | null;
  reimbursement_status: string | null;
  created_at: string;
  updated_at: string;
}

export type VariableExpenseInsert = Omit<VariableExpense, 'id' | 'created_at' | 'updated_at'>;
export type VariableExpenseUpdate = Partial<VariableExpenseInsert>;

export function useVariableExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const query = useQuery({
    queryKey: ['variable_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variable_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as VariableExpense[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (expense: VariableExpenseInsert) => {
      const { data, error } = await supabase
        .from('variable_expenses')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_name: profile?.name || user?.email || 'Sistema',
        action: 'create',
        entity_type: 'variable_expense',
        entity_id: data.id,
        entity_name: data.description,
        new_values: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable_expenses'] });
      toast({ title: 'Despesa adicionada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar despesa', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...expense }: VariableExpenseUpdate & { id: string }) => {
      const { data: oldData } = await supabase
        .from('variable_expenses')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('variable_expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_name: profile?.name || user?.email || 'Sistema',
        action: 'update',
        entity_type: 'variable_expense',
        entity_id: data.id,
        entity_name: data.description,
        old_values: oldData,
        new_values: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable_expenses'] });
      toast({ title: 'Despesa atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar despesa', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: oldData } = await supabase
        .from('variable_expenses')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('variable_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_name: profile?.name || user?.email || 'Sistema',
        action: 'delete',
        entity_type: 'variable_expense',
        entity_id: id,
        entity_name: oldData?.description,
        old_values: oldData,
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable_expenses'] });
      toast({ title: 'Despesa excluída com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir despesa', description: error.message, variant: 'destructive' });
    },
  });

  return {
    ...query,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
