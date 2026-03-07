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
import { Creative, useCreateCreative, useUpdateCreative } from '@/hooks/useCreatives';

const formSchema = z.object({
  product: z.string().min(1, 'Produto é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  creative_type: z.enum(['video', 'image', 'copy', 'carousel', 'other']),
  hook: z.string().optional(),
  platform: z.string().optional(),
  status: z.enum(['active', 'testing', 'paused', 'dead']),
  link: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const typeOptions = [
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem' },
  { value: 'copy', label: 'Copy' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'other', label: 'Outro' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'testing', label: 'Em Teste' },
  { value: 'paused', label: 'Pausado' },
  { value: 'dead', label: 'Morto' },
];

interface CreativeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creative?: Creative | null;
}

export function CreativeFormDialog({ open, onOpenChange, creative }: CreativeFormDialogProps) {
  const createCreative = useCreateCreative();
  const updateCreative = useUpdateCreative();
  const isEditing = !!creative;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      name: '',
      creative_type: 'video',
      hook: '',
      platform: '',
      status: 'testing',
      link: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (creative) {
      form.reset({
        product: creative.product,
        name: creative.name,
        creative_type: creative.creative_type,
        hook: creative.hook || '',
        platform: creative.platform || '',
        status: creative.status,
        link: creative.link || '',
        notes: creative.notes || '',
      });
    } else {
      form.reset({
        product: '',
        name: '',
        creative_type: 'video',
        hook: '',
        platform: '',
        status: 'testing',
        link: '',
        notes: '',
      });
    }
  }, [creative, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        product: values.product,
        name: values.name,
        creative_type: values.creative_type,
        hook: values.hook || null,
        platform: values.platform || null,
        status: values.status,
        link: values.link || null,
        notes: values.notes || null,
      };

      if (isEditing && creative) {
        await updateCreative.mutateAsync({ id: creative.id, ...payload });
      } else {
        await createCreative.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = createCreative.isPending || updateCreative.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Criativo' : 'Novo Criativo'}
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
                name="creative_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
                  <FormLabel className="text-foreground">Nome / Título</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Diabetes - Hook Médico v3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Hook</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Médico revela segredo..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Plataforma</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border" placeholder="Ex: Facebook, TikTok..." />
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
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Link (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="URL do Drive, Ads Library..." />
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
                  <FormLabel className="text-foreground">Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={2} placeholder="Observações sobre performance, variações..." />
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
