import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CampaignStatus = 'escalando' | 'testando' | 'pausar' | 'morto';

export interface Campaign {
  id: string;
  ad_performance_id: string | null;
  campaign_name: string;
  product: string | null;
  country: string | null;
  spend: number | null;
  revenue: number | null;
  roas: number | null;
  cpa: number | null;
  cpc: number | null;
  cpm: number | null;
  ctr: string | null;
  clicks: number | null;
  impressions: number | null;
  hook: string | null;
  status: string | null;
  conv_body: string | null;
  budget: string | null;
  sales: number | null;
  created_at: string;
}

export interface CampaignFilters {
  product?: string;
  country?: string;
  status?: string;
}

export type CampaignInsert = {
  campaign_name: string;
  product?: string | null;
  country?: string | null;
  spend?: number | null;
  revenue?: number | null;
  roas?: number | null;
  cpa?: number | null;
  cpm?: number | null;
  ctr?: string | null;
  hook?: string | null;
  status?: string | null;
  conv_body?: string | null;
  budget?: string | null;
  sales?: number | null;
};

export type CampaignUpdate = Partial<CampaignInsert> & { id: string };

export const useCampaignControl = (filters: CampaignFilters = {}) => {
  const { product, country, status } = filters;
  return useQuery({
    queryKey: ['campaign-control', { product, country, status }],
    queryFn: async () => {
      let query = supabase
        .from('ad_campaigns')
        .select('*')
        .order('roas', { ascending: false, nullsFirst: false });

      if (product) query = query.eq('product', product);
      if (country) query = query.eq('country', country);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data as Campaign[];
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: CampaignInsert) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-control'] });
      toast.success('Campanha criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar campanha: ${error.message}`);
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: CampaignUpdate) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-control'] });
      toast.success('Campanha atualizada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar campanha: ${error.message}`);
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-control'] });
      toast.success('Campanha removida');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover campanha: ${error.message}`);
    },
  });
};
