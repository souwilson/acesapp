import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, FileText, X } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Tax, TaxInsert, useCreateTax, useUpdateTax } from '@/hooks/useTaxes';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: z.coerce.number().min(0, 'Valor deve ser positivo'),
  tax_date: z.date({ required_error: 'Data do imposto é obrigatória' }),
  due_date: z.date({ required_error: 'Data de vencimento é obrigatória' }),
  paid: z.boolean(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaxFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tax?: Tax | null;
}

export function TaxFormDialog({ open, onOpenChange, tax }: TaxFormDialogProps) {
  const createTax = useCreateTax();
  const updateTax = useUpdateTax();
  const createAuditLog = useCreateAuditLog();
  const isEditing = !!tax;

  const [receiptUrls, setReceiptUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      tax_date: new Date(),
      due_date: new Date(),
      paid: false,
      notes: '',
    },
  });

  useEffect(() => {
    if (tax) {
      form.reset({
        description: tax.description,
        amount: tax.amount,
        tax_date: new Date(tax.tax_date + 'T12:00:00'),
        due_date: new Date(tax.due_date + 'T12:00:00'),
        paid: tax.paid,
        notes: tax.notes || '',
      });
      // Parse receipt_url: could be JSON array or single URL
      if (tax.receipt_url) {
        try {
          const parsed = JSON.parse(tax.receipt_url);
          setReceiptUrls(Array.isArray(parsed) ? parsed : [tax.receipt_url]);
        } catch {
          setReceiptUrls([tax.receipt_url]);
        }
      } else {
        setReceiptUrls([]);
      }
    } else {
      form.reset({
        description: '',
        amount: 0,
        tax_date: new Date(),
        due_date: new Date(),
        paid: false,
        notes: '',
      });
      setReceiptUrls([]);
    }
  }, [tax, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          toast({ title: `"${file.name}" não é PDF — ignorado`, variant: 'destructive' });
          continue;
        }

        const filePath = `taxes/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
        setReceiptUrls((prev) => [...prev, data.publicUrl]);
      }
      toast({ title: 'PDF(s) anexado(s) com sucesso!' });
    } catch (error: any) {
      toast({ title: 'Erro ao enviar arquivo', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setReceiptUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        description: values.description,
        amount: values.amount,
        tax_date: format(values.tax_date, 'yyyy-MM-dd'),
        due_date: format(values.due_date, 'yyyy-MM-dd'),
        paid: values.paid,
        paid_at: values.paid ? new Date().toISOString() : null,
        receipt_url: receiptUrls.length > 0 ? JSON.stringify(receiptUrls) : null,
        notes: values.notes || null,
      };

      if (isEditing && tax) {
        await updateTax.mutateAsync({ id: tax.id, ...payload });
        await createAuditLog.mutateAsync({
          action: 'update',
          entityType: 'taxes',
          entityId: tax.id,
          entityName: values.description,
          oldValues: tax as unknown as Json,
          newValues: { ...payload, id: tax.id } as unknown as Json,
        });
      } else {
        const result = await createTax.mutateAsync(payload as TaxInsert);
        await createAuditLog.mutateAsync({
          action: 'create',
          entityType: 'taxes',
          entityId: result.id,
          entityName: values.description,
          newValues: result as unknown as Json,
        });
      }
      onOpenChange(false);
      form.reset();
      setReceiptUrls([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createTax.isPending || updateTax.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Imposto' : 'Novo Imposto'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: DARF IRPJ, DAS MEI..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tax_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground">Competência</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione'}
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
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground">Vencimento</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione'}
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
              name="paid"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="text-foreground cursor-pointer">Marcar como pago</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* PDF Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Anexar DARFs (PDF)</label>
              {receiptUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-secondary">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate flex-1"
                  >
                    PDF {index + 1}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <label className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-secondary cursor-pointer hover:bg-accent transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Enviando...' : 'Clique para anexar PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
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
