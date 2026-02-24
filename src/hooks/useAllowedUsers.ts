import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'manager' | 'viewer';

export interface AllowedUser {
  id: string;
  email: string;
  role: AppRole;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

export function useAllowedUsers() {
  const queryClient = useQueryClient();

  const { data: allowedUsers = [], isLoading, error } = useQuery({
    queryKey: ['allowed-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AllowedUser[];
    },
  });

  const addUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('allowed_users')
        .insert({
          email: email.toLowerCase().trim(),
          role,
          active: true,
          created_by: user?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-users'] });
      toast({ title: 'Usuário adicionado à whitelist' });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast({ 
          title: 'E-mail já cadastrado', 
          description: 'Este e-mail já está na whitelist.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Erro ao adicionar usuário', 
          description: error.message,
          variant: 'destructive' 
        });
      }
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, role, active }: { id: string; role?: AppRole; active?: boolean }) => {
      const updateData: Partial<AllowedUser> = {};
      if (role !== undefined) updateData.role = role;
      if (active !== undefined) updateData.active = active;
      
      const { data, error } = await supabase
        .from('allowed_users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-users'] });
      toast({ title: 'Usuário atualizado' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao atualizar usuário', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowed_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-users'] });
      toast({ title: 'Usuário removido da whitelist' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao remover usuário', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    allowedUsers,
    isLoading,
    error,
    addUser,
    updateUser,
    deleteUser,
  };
}
