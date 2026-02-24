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
import { Tool, ToolInsert, useCreateTool, useUpdateTool } from '@/hooks/useTools';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  category: z.enum(['ads', 'infra', 'design', 'ai', 'crm', 'other']),
  monthly_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  currency: z.string().min(1, 'Moeda é obrigatória').max(10),
  due_date: z.date({ required_error: 'Data de vencimento é obrigatória' }),
  status: z.enum(['active', 'cancelled']),
  payment_method: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ToolFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: Tool | null;
}

const categoryOptions = [
  { value: 'ads', label: 'Ads' },
  { value: 'infra', label: 'Infra' },
  { value: 'design', label: 'Design' },
  { value: 'ai', label: 'IA' },
  { value: 'crm', label: 'CRM' },
  { value: 'other', label: 'Outros' },
];

const currencyOptions = ['USD', 'BRL', 'EUR'];

export function ToolFormDialog({ open, onOpenChange, tool }: ToolFormDialogProps) {
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!tool;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'other',
      monthly_value: 0,
      currency: 'USD',
      due_date: new Date(),
      status: 'active',
      payment_method: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (tool) {
      form.reset({
        name: tool.name,
        category: tool.category,
        monthly_value: tool.monthly_value,
        currency: tool.currency,
        due_date: new Date(tool.due_date),
        status: tool.status,
        payment_method: tool.payment_method || '',
        notes: tool.notes || '',
      });
    } else {
      form.reset({
        name: '',
        category: 'other',
        monthly_value: 0,
        currency: 'USD',
        due_date: new Date(),
        status: 'active',
        payment_method: '',
        notes: '',
      });
    }
  }, [tool, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        due_date: format(values.due_date, 'yyyy-MM-dd'),
        payment_method: values.payment_method || null,
        notes: values.notes || null,
      };

      if (isEditing && tool) {
        await updateTool.mutateAsync({ id: tool.id, ...payload });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'tools',
          entityId: tool.id,
          entityName: values.name,
          oldValues: tool as unknown as Json,
          newValues: { ...payload, id: tool.id } as unknown as Json,
        });
      } else {
        const result = await createTool.mutateAsync(payload as ToolInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'tools',
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

  const isLoading = createTool.isPending || updateTool.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Ferramenta' : 'Nova Ferramenta'}
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
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: AWS, Figma..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
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
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Valor Mensal</FormLabel>
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
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground">Data de Vencimento</FormLabel>
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
                          {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione uma data'}
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

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Forma de Pagamento</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Cartão, Boleto..." />
                  </FormControl>
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
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
