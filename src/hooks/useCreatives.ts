import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Creative {
  id: string;
  product: string;
  name: string;
  creative_type: 'video' | 'image' | 'copy' | 'carousel' | 'other';
  hook: string | null;
  platform: string | null;
  status: 'active' | 'testing' | 'paused' | 'dead';
  link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreativeInsert = Omit<Creative, 'id' | 'created_at' | 'updated_at'>;
export type CreativeUpdate = Partial<CreativeInsert> & { id: string };

export const useCreatives = () => {
  return useQuery({
    queryKey: ['creatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creatives')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Creative[];
    },
  });
};

export const useCreateCreative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (creative: CreativeInsert) => {
      const { data, error } = await supabase.from('creatives').insert(creative).select().single();
      if (error) throw error;
      return data as Creative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
      toast.success('Criativo cadastrado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar criativo: ${error.message}`);
    },
  });
};

export const useUpdateCreative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: CreativeUpdate) => {
      const { data, error } = await supabase
        .from('creatives')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Creative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
      toast.success('Criativo atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar criativo: ${error.message}`);
    },
  });
};

export const useDeleteCreative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('creatives').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives'] });
      toast.success('Criativo removido');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover criativo: ${error.message}`);
    },
  });
};
