import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Asset {
  id: string;
  product: string;
  asset_type: 'domain' | 'page' | 'pixel' | 'ad_account' | 'gateway' | 'checkout' | 'email' | 'other';
  name: string;
  country: string | null;
  status: 'online' | 'paused' | 'banned' | 'dead';
  link_or_id: string | null;
  notes: string | null;
  last_checked: string | null;
  created_at: string;
  updated_at: string;
}

export type AssetInsert = Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
export type AssetUpdate = Partial<AssetInsert> & { id: string };

export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Asset[];
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: AssetInsert) => {
      const { data, error } = await supabase.from('assets').insert(asset).select().single();
      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar ativo: ${error.message}`);
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: AssetUpdate) => {
      const { data, error } = await supabase
        .from('assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar ativo: ${error.message}`);
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo removido');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover ativo: ${error.message}`);
    },
  });
};
