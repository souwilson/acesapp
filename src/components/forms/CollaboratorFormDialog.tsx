import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collaborator, CollaboratorInsert, useCreateCollaborator, useUpdateCollaborator } from '@/hooks/useCollaborators';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['freelancer', 'pj', 'fixed']),
  role: z.string().min(1, 'Função é obrigatória').max(100),
  monthly_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  payment_date: z.date({ required_error: 'Data de pagamento é obrigatória' }),
  status: z.enum(['active', 'paused', 'ended']),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CollaboratorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator?: Collaborator | null;
}

const typeOptions = [
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'pj', label: 'PJ' },
  { value: 'fixed', label: 'Fixo' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'ended', label: 'Encerrado' },
];

export function CollaboratorFormDialog({ open, onOpenChange, collaborator }: CollaboratorFormDialogProps) {
  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!collaborator;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'freelancer',
      role: '',
      monthly_value: 0,
      payment_date: new Date(),
      status: 'active',
      notes: '',
    },
  });

  useEffect(() => {
    if (collaborator) {
      form.reset({
        name: collaborator.name,
        type: collaborator.type,
        role: collaborator.role,
        monthly_value: collaborator.monthly_value,
        payment_date: new Date(collaborator.payment_date),
        status: collaborator.status,
        notes: collaborator.notes || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'freelancer',
        role: '',
        monthly_value: 0,
        payment_date: new Date(),
        status: 'active',
        notes: '',
      });
    }
  }, [collaborator, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        payment_date: format(values.payment_date, 'yyyy-MM-dd'),
        notes: values.notes || null,
      };

      if (isEditing && collaborator) {
        await updateCollaborator.mutateAsync({ id: collaborator.id, ...payload });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'collaborators',
          entityId: collaborator.id,
          entityName: values.name,
          oldValues: collaborator as unknown as Json,
          newValues: { ...payload, id: collaborator.id } as unknown as Json,
        });
      } else {
        const result = await createCollaborator.mutateAsync(payload as CollaboratorInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'collaborators',
          entityId: result.id,
          entityName: values.name,
          newValues: result as unknown as Json,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createCollaborator.isPending || updateCollaborator.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Função</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Designer, Desenvolvedor..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Valor Mensal (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground">Data Pagamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'bg-secondary border-border justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'dd/MM') : 'Dia'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 gradient-primary text-primary-foreground">
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
