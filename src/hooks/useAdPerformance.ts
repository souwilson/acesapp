import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdPerformance {
  id: string;
  platform: 'meta' | 'google' | 'twitter' | 'tiktok' | 'other';
  date: string;
  investment: number;
  revenue: number;
  sales: number;
  roas: number;
  cpa: number | null;
  notes: string | null;
  manager: string | null;
  created_at: string;
  updated_at: string;
}

export type AdPerformanceInsert = Omit<AdPerformance, 'id' | 'roas' | 'created_at' | 'updated_at'>;
export type AdPerformanceUpdate = Partial<AdPerformanceInsert>;

export function useAdPerformance() {
  return useQuery({
    queryKey: ['ad_performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_performance')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as AdPerformance[];
    },
  });
}

export function useCreateAdPerformance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ad: AdPerformanceInsert) => {
      const { data, error } = await supabase
        .from('ad_performance')
        .insert(ad)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_performance'] });
      toast({ title: 'Registro de ads criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar registro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAdPerformance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: AdPerformanceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('ad_performance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_performance'] });
      toast({ title: 'Registro atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAdPerformance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_performance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_performance'] });
      toast({ title: 'Registro excluído!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
