import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AdCampaign {
  id: string;
  ad_performance_id: string;
  campaign_name: string;
  status: string | null;
  budget: string | null;
  sales: number;
  cpa: number;
  spend: number;
  revenue: number;
  profit: number;
  roas: number;
  margin: string | null;
  impressions: number;
  clicks: number;
  ctr: string | null;
  cpc: number;
  cpm: number;
  hook: string | null;
  frequency: string | null;
  conv_checkout: string | null;
  conv_body: string | null;
  rejected_sales: number;
  ic: number;
  cpi: number;
  created_at: string;
}

export function useAdCampaigns(adPerformanceId?: string) {
  return useQuery({
    queryKey: ['ad_campaigns', adPerformanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('ad_performance_id', adPerformanceId!)
        .order('spend', { ascending: false });
      if (error) throw error;
      return data as AdCampaign[];
    },
    enabled: !!adPerformanceId,
  });
}

export function useAdCampaignsByIds(adPerformanceIds: string[]) {
  return useQuery({
    queryKey: ['ad_campaigns_bulk', adPerformanceIds],
    queryFn: async () => {
      if (adPerformanceIds.length === 0) return [];
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .in('ad_performance_id', adPerformanceIds)
        .order('spend', { ascending: false });
      if (error) throw error;
      return data as AdCampaign[];
    },
    enabled: adPerformanceIds.length > 0,
  });
}

export function useBulkInsertAdCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaigns: Omit<AdCampaign, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaigns)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['ad_campaigns_bulk'] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao salvar campanhas', description: error.message, variant: 'destructive' });
    },
  });
}
