import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DismissedAlert {
  id: string;
  alert_key: string;
  dismissed_at: string;
  dismissed_by: string | null;
  created_at: string;
}

export function useDismissedAlerts() {
  return useQuery({
    queryKey: ['dismissed_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dismissed_alerts')
        .select('*');
      
      if (error) throw error;
      return data as DismissedAlert[];
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ alertKey, dismissedBy }: { alertKey: string; dismissedBy?: string }) => {
      const { data, error } = await supabase
        .from('dismissed_alerts')
        .insert({ alert_key: alertKey, dismissed_by: dismissedBy })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dismissed_alerts'] });
      toast({ title: 'Alerta marcado como pago!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao marcar alerta', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRestoreAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertKey: string) => {
      const { error } = await supabase
        .from('dismissed_alerts')
        .delete()
        .eq('alert_key', alertKey);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dismissed_alerts'] });
      toast({ title: 'Alerta restaurado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao restaurar alerta', description: error.message, variant: 'destructive' });
    },
  });
}
