import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string;
  action: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  old_values: Json | null;
  new_values: Json | null;
  created_at: string;
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
    }: {
      action: 'create' | 'update' | 'delete';
      entityType: string;
      entityId: string;
      entityName?: string;
      oldValues?: Json;
      newValues?: Json;
    }) => {
      const { error } = await supabase.from('audit_logs').insert([{
        user_id: user?.id || null,
        user_name: profile?.name || user?.email || 'Sistema',
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName || null,
        old_values: oldValues || null,
        new_values: newValues || null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

// Helper hook to create audited mutations
export function useAuditedMutation<T extends { id?: string; name?: string }>({
  entityType,
  action,
  mutationFn,
  getEntityName,
  onSuccess,
}: {
  entityType: string;
  action: 'create' | 'update' | 'delete';
  mutationFn: (data: T) => Promise<T>;
  getEntityName?: (data: T) => string;
  onSuccess?: () => void;
}) {
  const createAuditLog = useCreateAuditLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const result = await mutationFn(data);
      
      await createAuditLog.mutateAsync({
        action,
        entityType,
        entityId: result.id || (data as { id?: string }).id || 'unknown',
        entityName: getEntityName ? getEntityName(data) : (data as { name?: string }).name,
        newValues: action !== 'delete' ? (result as unknown as Json) : undefined,
        oldValues: action === 'delete' ? (data as unknown as Json) : undefined,
      });

      return result;
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
}
