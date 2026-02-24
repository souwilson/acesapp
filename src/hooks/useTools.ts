import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Tool {
  id: string;
  name: string;
  category: 'ads' | 'infra' | 'design' | 'ai' | 'crm' | 'other';
  monthly_value: number;
  currency: string;
  due_date: string;
  status: 'active' | 'cancelled';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ToolInsert = Omit<Tool, 'id' | 'created_at' | 'updated_at'>;
export type ToolUpdate = Partial<ToolInsert>;

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Tool[];
    },
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tool: ToolInsert) => {
      const { data, error } = await supabase
        .from('tools')
        .insert(tool)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast({ title: 'Ferramenta criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar ferramenta', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ToolUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast({ title: 'Ferramenta atualizada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast({ title: 'Ferramenta excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
