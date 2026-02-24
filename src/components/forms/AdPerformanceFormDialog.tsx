import { useEffect } from 'react';
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
import { DateInput } from '@/components/ui/DateInput';
import { AdPerformance, AdPerformanceInsert, useCreateAdPerformance, useUpdateAdPerformance } from '@/hooks/useAdPerformance';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import type { Json } from '@/integrations/supabase/types';

const formSchema = z.object({
  platform: z.enum(['meta', 'google', 'twitter', 'tiktok', 'other']),
  date: z.string().min(1, 'Data é obrigatória'),
  investment: z.coerce.number().min(0, 'Investimento deve ser positivo'),
  revenue: z.coerce.number().min(0, 'Receita deve ser positiva'),
  sales: z.coerce.number().int().min(0, 'Vendas deve ser positivo'),
  cpa: z.coerce.number().min(0).optional(),
  manager: z.string().min(1, 'Gestor é obrigatório'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdPerformanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adPerformance?: AdPerformance | null;
}

const platformOptions = [
  { value: 'meta', label: 'Meta Ads' },
  { value: 'google', label: 'Google Ads' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'other', label: 'Outros' },
];

export function AdPerformanceFormDialog({ open, onOpenChange, adPerformance }: AdPerformanceFormDialogProps) {
  const createAdPerformance = useCreateAdPerformance();
  const updateAdPerformance = useUpdateAdPerformance();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!adPerformance;

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'meta',
      date: getTodayDate(),
      investment: 0,
      revenue: 0,
      sales: 0,
      cpa: undefined,
      manager: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (adPerformance) {
      form.reset({
        platform: adPerformance.platform,
        date: adPerformance.date, // Already in YYYY-MM-DD format from DB
        investment: adPerformance.investment,
        revenue: adPerformance.revenue,
        sales: adPerformance.sales,
        cpa: adPerformance.cpa || undefined,
        manager: adPerformance.manager || '',
        notes: adPerformance.notes || '',
      });
    } else {
      form.reset({
        platform: 'meta',
        date: getTodayDate(),
        investment: 0,
        revenue: 0,
        sales: 0,
        cpa: undefined,
        manager: '',
        notes: '',
      });
    }
  }, [adPerformance, form]);

  const watchedValues = form.watch(['investment', 'revenue', 'sales']);
  const investment = watchedValues[0] || 0;
  const revenue = watchedValues[1] || 0;
  const sales = watchedValues[2] || 0;
  const calculatedRoas = investment > 0 ? (revenue / investment).toFixed(2) : '0.00';
  const calculatedCpa = sales > 0 ? (investment / sales).toFixed(2) : '0.00';

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        date: values.date, // Already in YYYY-MM-DD string format
        cpa: values.cpa || null,
        manager: values.manager,
        notes: values.notes || null,
      };

      if (isEditing && adPerformance) {
        await updateAdPerformance.mutateAsync({ id: adPerformance.id, ...payload });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'ad_performance',
          entityId: adPerformance.id,
          entityName: `${values.platform} - ${values.date}`,
          oldValues: adPerformance as unknown as Json,
          newValues: { ...payload, id: adPerformance.id } as unknown as Json,
        });
      } else {
        const result = await createAdPerformance.mutateAsync(payload as AdPerformanceInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'ad_performance',
          entityId: result.id,
          entityName: `${values.platform} - ${values.date}`,
          newValues: result as unknown as Json,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createAdPerformance.isPending || updateAdPerformance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Registro de Ads' : 'Novo Registro de Ads'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Plataforma</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformOptions.map((opt) => (
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Data</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione a data"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="investment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Investimento (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-secondary border-border" />
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
                    <FormLabel className="text-foreground">Receita (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Vendas</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Gestor de Tráfego</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do gestor" className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Calculated Metrics Display */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="text-xs text-muted-foreground">ROAS (calculado)</p>
                <p className="text-lg font-bold text-primary">{calculatedRoas}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPA (calculado)</p>
                <p className="text-lg font-bold text-foreground">R$ {calculatedCpa}</p>
              </div>
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
