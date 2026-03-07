import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CashFlowEntry {
  ad_performance_id: string;
  date: string;
  product: string | null;
  platform: string;
  investment: number;
  revenue: number;
  profit: number;
  roas: number | null;
  sales: number;
  cpa: number | null;
  manager: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashFlowFilters {
  startDate?: string;
  endDate?: string;
  product?: string;
}

export type CashFlowInsert = {
  date: string;
  product?: string | null;
  platform: string;
  investment: number;
  revenue: number;
  sales?: number;
  notes?: string | null;
};

export type CashFlowUpdate = Partial<CashFlowInsert> & { ad_performance_id: string };

export const useCashFlow = (filters: CashFlowFilters = {}) => {
  const { startDate, endDate, product } = filters;
  return useQuery({
    queryKey: ['cash-flow', { startDate, endDate, product }],
    queryFn: async () => {
      let query = supabase
        .from('ad_performance')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (product) query = query.eq('product', product);

      const { data, error } = await query;
      if (error) throw error;
      return data as CashFlowEntry[];
    },
  });
};

export const useCreateCashFlowEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: CashFlowInsert) => {
      const { data, error } = await supabase
        .from('ad_performance')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data as CashFlowEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
      toast.success('Registro criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar registro: ${error.message}`);
    },
  });
};

export const useUpdateCashFlowEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ad_performance_id, ...updates }: CashFlowUpdate) => {
      const { data, error } = await supabase
        .from('ad_performance')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('ad_performance_id', ad_performance_id)
        .select()
        .single();
      if (error) throw error;
      return data as CashFlowEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
      toast.success('Registro atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar registro: ${error.message}`);
    },
  });
};

export const useDeleteCashFlowEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_performance')
        .delete()
        .eq('ad_performance_id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
      toast.success('Registro removido');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover registro: ${error.message}`);
    },
  });
};
