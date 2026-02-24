import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Collaborator {
  id: string;
  name: string;
  type: 'freelancer' | 'pj' | 'fixed';
  role: string;
  monthly_value: number;
  payment_date: string;
  status: 'active' | 'paused' | 'ended';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CollaboratorInsert = Omit<Collaborator, 'id' | 'created_at' | 'updated_at'>;
export type CollaboratorUpdate = Partial<CollaboratorInsert>;

export function useCollaborators() {
  return useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Collaborator[];
    },
  });
}

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (collaborator: CollaboratorInsert) => {
      const { data, error } = await supabase
        .from('collaborators')
        .insert(collaborator)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({ title: 'Colaborador criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar colaborador', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CollaboratorUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('collaborators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({ title: 'Colaborador atualizado!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCollaborator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({ title: 'Colaborador excluído!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}
