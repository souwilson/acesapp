import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Platform, PlatformInsert, useCreatePlatform, useUpdatePlatform } from '@/hooks/usePlatforms';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['bank', 'gateway', 'exchange', 'digital']),
  balance: z.coerce.number().min(0, 'Saldo deve ser positivo'),
  currency: z.string().min(1, 'Moeda é obrigatória').max(10),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlatformFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: Platform | null;
}

const typeOptions = [
  { value: 'bank', label: 'Banco' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'digital', label: 'Plataforma Digital' },
];

const currencyOptions = ['BRL', 'USD', 'EUR', 'USDT', 'BTC'];

export function PlatformFormDialog({ open, onOpenChange, platform }: PlatformFormDialogProps) {
  const createPlatform = useCreatePlatform();
  const updatePlatform = useUpdatePlatform();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!platform;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      balance: 0,
      currency: 'BRL',
      notes: '',
    },
  });

  useEffect(() => {
    if (platform) {
      form.reset({
        name: platform.name,
        type: platform.type,
        balance: platform.balance,
        currency: platform.currency,
        notes: platform.notes || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'bank',
        balance: 0,
        currency: 'BRL',
        notes: '',
      });
    }
  }, [platform, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && platform) {
        const result = await updatePlatform.mutateAsync({
          id: platform.id,
          ...values,
          notes: values.notes || null,
        });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'platforms',
          entityId: platform.id,
          entityName: values.name,
          oldValues: platform as unknown as Json,
          newValues: { ...values, id: platform.id } as unknown as Json,
        });
      } else {
        const result = await createPlatform.mutateAsync({
          ...values,
          notes: values.notes || null,
        } as PlatformInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'platforms',
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

  const isLoading = createPlatform.isPending || updatePlatform.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Plataforma' : 'Nova Plataforma'}
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
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Stripe, Nubank..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione o tipo" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Saldo</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Moeda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
