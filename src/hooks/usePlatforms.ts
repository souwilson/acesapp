import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Platform {
  id: string;
  name: string;
  type: 'bank' | 'gateway' | 'exchange' | 'digital';
  balance: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PlatformInsert = Omit<Platform, 'id' | 'created_at' | 'updated_at'>;
export type PlatformUpdate = Partial<PlatformInsert>;

export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Platform[];
    },
  });
}

export function useCreatePlatform() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (platform: PlatformInsert) => {
      const { data, error } = await supabase
        .from('platforms')
        .insert(platform)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast({ title: 'Plataforma criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar plataforma', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdatePlatform() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: PlatformUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast({ title: 'Plataforma atualizada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeletePlatform() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast({ title: 'Plataforma excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
