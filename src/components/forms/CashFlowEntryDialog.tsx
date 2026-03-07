import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import {
  CashFlowEntry,
  useCreateCashFlowEntry,
  useUpdateCashFlowEntry,
} from '@/hooks/useCashFlow';
import { PLATFORM_OPTIONS } from '@/lib/utils';

const formSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  product: z.string().optional(),
  platform: z.string().min(1, 'Plataforma é obrigatória'),
  investment: z.coerce.number().min(0, 'Investimento deve ser positivo'),
  revenue: z.coerce.number().min(0, 'Receita deve ser positiva'),
  sales: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CashFlowEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: CashFlowEntry | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function CashFlowEntryDialog({ open, onOpenChange, entry }: CashFlowEntryDialogProps) {
  const createEntry = useCreateCashFlowEntry();
  const updateEntry = useUpdateCashFlowEntry();
  const isEditing = !!entry;

  const today = new Date().toISOString().split('T')[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: today,
      product: '',
      platform: '',
      investment: 0,
      revenue: 0,
      sales: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        date: entry.date,
        product: entry.product || '',
        platform: entry.platform,
        investment: entry.investment,
        revenue: entry.revenue,
        sales: entry.sales ?? 0,
        notes: entry.notes || '',
      });
    } else {
      form.reset({
        date: today,
        product: '',
        platform: '',
        investment: 0,
        revenue: 0,
        sales: 0,
        notes: '',
      });
    }
  }, [entry, form, today]);

  const investment = useWatch({ control: form.control, name: 'investment' }) ?? 0;
  const revenue = useWatch({ control: form.control, name: 'revenue' }) ?? 0;

  const profit = revenue - investment;
  const roas = investment > 0 ? revenue / investment : 0;

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        date: values.date,
        product: values.product || null,
        platform: values.platform,
        investment: values.investment,
        revenue: values.revenue,
        sales: values.sales ?? 0,
        notes: values.notes || null,
      };

      if (isEditing && entry) {
        await updateEntry.mutateAsync({ ad_performance_id: entry.ad_performance_id, ...payload });
      } else {
        await createEntry.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Registro' : 'Novo Registro'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Data</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Produto</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border" placeholder="Ex: Diabetes, Skin..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Plataforma</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
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
                name="investment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Investimento (USD)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="bg-secondary border-border" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Receita (USD)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="bg-secondary border-border" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Live preview */}
            <div className="rounded-lg bg-secondary/50 border border-border p-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Profit:</span>{' '}
                <span className={profit >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">ROAS:</span>{' '}
                <span className={roas >= 2 ? 'text-green-400 font-semibold' : roas >= 1 ? 'text-yellow-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {roas.toFixed(2)}x
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="sales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Vendas (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" className="bg-secondary border-border" placeholder="0" />
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
                  <FormLabel className="text-foreground">Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={2} placeholder="Informações adicionais..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
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
