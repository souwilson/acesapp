import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  reason: string;
  destination: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type WithdrawalInsert = Omit<Withdrawal, 'id' | 'created_at' | 'updated_at'>;
export type WithdrawalUpdate = Partial<WithdrawalInsert>;

export function useWithdrawals() {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Withdrawal[];
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawal: WithdrawalInsert) => {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert(withdrawal)
        .select()
        .single();
      
      if (error) throw error;
      return data as Withdrawal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast({ title: 'Retirada registrada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao registrar retirada', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWithdrawal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: WithdrawalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('withdrawals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Withdrawal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast({ title: 'Retirada atualizada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWithdrawal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast({ title: 'Retirada excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
