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
import { Asset, useCreateAsset, useUpdateAsset } from '@/hooks/useAssets';

const formSchema = z.object({
  product: z.string().min(1, 'Produto é obrigatório'),
  asset_type: z.enum(['domain', 'page', 'pixel', 'ad_account', 'gateway', 'checkout', 'email', 'other']),
  name: z.string().min(1, 'Nome é obrigatório'),
  country: z.string().optional(),
  status: z.enum(['online', 'paused', 'banned', 'dead']),
  link_or_id: z.string().optional(),
  notes: z.string().optional(),
  last_checked: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const assetTypeOptions = [
  { value: 'domain', label: 'Domínio' },
  { value: 'page', label: 'Página' },
  { value: 'pixel', label: 'Pixel' },
  { value: 'ad_account', label: 'Conta Ads' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Outro' },
];

const statusOptions = [
  { value: 'online', label: 'Online' },
  { value: 'paused', label: 'Pausado' },
  { value: 'banned', label: 'Banido' },
  { value: 'dead', label: 'Morto' },
];

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const isEditing = !!asset;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      asset_type: 'domain',
      name: '',
      country: '',
      status: 'online',
      link_or_id: '',
      notes: '',
      last_checked: '',
    },
  });

  useEffect(() => {
    if (asset) {
      form.reset({
        product: asset.product,
        asset_type: asset.asset_type,
        name: asset.name,
        country: asset.country || '',
        status: asset.status,
        link_or_id: asset.link_or_id || '',
        notes: asset.notes || '',
        last_checked: asset.last_checked || '',
      });
    } else {
      form.reset({
        product: '',
        asset_type: 'domain',
        name: '',
        country: '',
        status: 'online',
        link_or_id: '',
        notes: '',
        last_checked: '',
      });
    }
  }, [asset, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        country: values.country || null,
        link_or_id: values.link_or_id || null,
        notes: values.notes || null,
        last_checked: values.last_checked || null,
      };

      if (isEditing && asset) {
        await updateAsset.mutateAsync({ id: asset.id, ...payload });
      } else {
        await createAsset.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = createAsset.isPending || updateAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Ativo' : 'Novo Ativo'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Tipo de ativo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypeOptions.map((opt) => (
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: diabetesfix.com, BM22, FB Pixel 03..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">País</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border" placeholder="Ex: US, BR, ES" />
                    </FormControl>
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
              name="link_or_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Link / ID</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="URL, ID da conta, ID do pixel..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_checked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Última verificação</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="bg-secondary border-border" />
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
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={3} placeholder="Informações adicionais..." />
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
