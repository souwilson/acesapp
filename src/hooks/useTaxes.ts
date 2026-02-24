import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Tax {
  id: string;
  description: string;
  amount: number;
  tax_date: string;
  due_date: string;
  paid: boolean;
  paid_at: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TaxInsert = Omit<Tax, 'id' | 'created_at' | 'updated_at'>;
export type TaxUpdate = Partial<TaxInsert>;

export function useTaxes() {
  return useQuery({
    queryKey: ['taxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taxes')
        .select('*')
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as Tax[];
    },
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tax: TaxInsert) => {
      const { data, error } = await supabase
        .from('taxes')
        .insert(tax)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({ title: 'Imposto cadastrado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao cadastrar imposto', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaxUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('taxes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({ title: 'Imposto atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('taxes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast({ title: 'Imposto excluído!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
