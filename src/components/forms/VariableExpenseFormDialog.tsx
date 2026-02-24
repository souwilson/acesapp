import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateInput } from '@/components/ui/DateInput';
import { VariableExpense } from '@/hooks/useVariableExpenses';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Máximo 200 caracteres'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  payment_method: z.string().optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  is_reimbursement: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface VariableExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: VariableExpense | null;
  onSubmit: (data: FormValues & { receipt_url?: string | null; reimbursement_status?: string | null }) => void;
  isLoading?: boolean;
}

const categories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'other', label: 'Outros' },
];

const paymentMethods = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
];

export function VariableExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
  isLoading,
}: VariableExpenseFormDialogProps) {
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      payment_method: '',
      notes: '',
      is_reimbursement: false,
    },
  });

  const isReimbursement = form.watch('is_reimbursement');

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        payment_method: expense.payment_method || '',
        notes: expense.notes || '',
        is_reimbursement: expense.is_reimbursement || false,
      });
      setReceiptUrl(expense.receipt_url || null);
    } else {
      form.reset({
        description: '',
        amount: 0,
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        payment_method: '',
        notes: '',
        is_reimbursement: false,
      });
      setReceiptUrl(null);
    }
  }, [expense, form, open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
      setReceiptUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      receipt_url: isReimbursement ? receiptUrl : null,
      reimbursement_status: isReimbursement ? 'pending' : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Editar Despesa Variável' : 'Nova Despesa Variável'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Almoço com cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
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
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
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
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_reimbursement" className="text-base font-medium">
                  Reembolso
                </Label>
                <p className="text-sm text-muted-foreground">
                  Marque se esta despesa será reembolsada
                </p>
              </div>
              <FormField
                control={form.control}
                name="is_reimbursement"
                render={({ field }) => (
                  <FormControl>
                    <Switch
                      id="is_reimbursement"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                )}
              />
            </div>

            {isReimbursement && (
              <div className="space-y-3 rounded-lg border border-dashed border-border p-4 bg-muted/30">
                <Label className="text-sm font-medium">Comprovante</Label>
                {receiptUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-background border border-border">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm flex-1 truncate">Comprovante anexado</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReceiptUrl(null)}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        {uploadingReceipt ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Clique para enviar o comprovante
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingReceipt}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {expense ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
