import { useEffect } from 'react';
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
import { Withdrawal, WithdrawalInsert, useCreateWithdrawal, useUpdateWithdrawal } from '@/hooks/useWithdrawals';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.date({ required_error: 'Data é obrigatória' }),
  reason: z.string().min(1, 'Motivo é obrigatório').max(200),
  destination: z.string().min(1, 'Destino é obrigatório'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WithdrawalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal?: Withdrawal | null;
}

const reasonOptions = [
  'Pró-labore',
  'Distribuição de lucros',
  'Reembolso de despesas',
  'Adiantamento',
  'Outros',
];

const destinationOptions = [
  'Lukas - PF',
  'Moacir - PF',
  'Outro',
];

export function WithdrawalFormDialog({ open, onOpenChange, withdrawal }: WithdrawalFormDialogProps) {
  const createWithdrawal = useCreateWithdrawal();
  const updateWithdrawal = useUpdateWithdrawal();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!withdrawal;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      reason: '',
      destination: 'Lukas - PF',
      notes: '',
    },
  });

  useEffect(() => {
    if (withdrawal) {
      form.reset({
        amount: withdrawal.amount,
        date: new Date(withdrawal.date),
        reason: withdrawal.reason,
        destination: withdrawal.destination,
        notes: withdrawal.notes || '',
      });
    } else {
      form.reset({
        amount: 0,
        date: new Date(),
        reason: '',
        destination: 'Lukas - PF',
        notes: '',
      });
    }
  }, [withdrawal, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        date: format(values.date, 'yyyy-MM-dd'),
        notes: values.notes || null,
      };

      if (isEditing && withdrawal) {
        await updateWithdrawal.mutateAsync({ id: withdrawal.id, ...payload });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'withdrawals',
          entityId: withdrawal.id,
          entityName: `R$ ${values.amount} - ${values.reason}`,
          oldValues: withdrawal as unknown as Json,
          newValues: { ...payload, id: withdrawal.id } as unknown as Json,
        });
      } else {
        const result = await createWithdrawal.mutateAsync(payload as WithdrawalInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'withdrawals',
          entityId: result.id,
          entityName: `R$ ${values.amount} - ${values.reason}`,
          newValues: result as unknown as Json,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createWithdrawal.isPending || updateWithdrawal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Retirada' : 'Nova Retirada'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Valor (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground">Data</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Data'}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Motivo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonOptions.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
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
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Destino (Pessoa Física)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione o destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinationOptions.map((dest) => (
                        <SelectItem key={dest} value={dest}>
                          {dest}
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
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
