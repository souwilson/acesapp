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
import { Campaign, useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaignControl';

const formSchema = z.object({
  campaign_name: z.string().min(1, 'Nome da campanha é obrigatório'),
  product: z.string().optional(),
  country: z.string().optional(),
  spend: z.coerce.number().min(0).optional().or(z.literal('')),
  revenue: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.string().min(1, 'Status é obrigatório'),
  hook: z.string().optional(),
  cpm: z.coerce.number().min(0).optional().or(z.literal('')),
  ctr: z.string().optional(),
  cpa: z.coerce.number().min(0).optional().or(z.literal('')),
  budget: z.string().optional(),
  conv_body: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions = [
  { value: 'escalando', label: 'Escalando' },
  { value: 'testando', label: 'Testando' },
  { value: 'pausar', label: 'Pausar' },
  { value: 'morto', label: 'Morto' },
];

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
}

export function CampaignFormDialog({ open, onOpenChange, campaign }: CampaignFormDialogProps) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const isEditing = !!campaign;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaign_name: '',
      product: '',
      country: '',
      spend: '',
      revenue: '',
      status: 'testando',
      hook: '',
      cpm: '',
      ctr: '',
      cpa: '',
      budget: '',
      conv_body: '',
    },
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        campaign_name: campaign.campaign_name,
        product: campaign.product || '',
        country: campaign.country || '',
        spend: campaign.spend ?? '',
        revenue: campaign.revenue ?? '',
        status: campaign.status || 'testando',
        hook: campaign.hook || '',
        cpm: campaign.cpm ?? '',
        ctr: campaign.ctr || '',
        cpa: campaign.cpa ?? '',
        budget: campaign.budget || '',
        conv_body: campaign.conv_body || '',
      });
    } else {
      form.reset({
        campaign_name: '',
        product: '',
        country: '',
        spend: '',
        revenue: '',
        status: 'testando',
        hook: '',
        cpm: '',
        ctr: '',
        cpa: '',
        budget: '',
        conv_body: '',
      });
    }
  }, [campaign, form]);

  const spend = useWatch({ control: form.control, name: 'spend' });
  const revenue = useWatch({ control: form.control, name: 'revenue' });

  const spendNum = Number(spend) || 0;
  const revenueNum = Number(revenue) || 0;
  const roas = spendNum > 0 ? revenueNum / spendNum : 0;

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        campaign_name: values.campaign_name,
        product: values.product || null,
        country: values.country || null,
        spend: values.spend !== '' ? Number(values.spend) : null,
        revenue: values.revenue !== '' ? Number(values.revenue) : null,
        roas: spendNum > 0 && revenueNum >= 0 ? roas : null,
        status: values.status,
        hook: values.hook || null,
        cpm: values.cpm !== '' ? Number(values.cpm) : null,
        ctr: values.ctr || null,
        cpa: values.cpa !== '' ? Number(values.cpa) : null,
        budget: values.budget || null,
        conv_body: values.conv_body || null,
      };

      if (isEditing && campaign) {
        await updateCampaign.mutateAsync({ id: campaign.id, ...payload });
      } else {
        await createCampaign.mutateAsync(payload);
      }
      onOpenChange(false);
      form.reset();
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = createCampaign.isPending || updateCampaign.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="campaign_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome da Campanha</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: FB - Diabetes - US - Hook1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Spend (USD)</FormLabel>
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
                    <FormLabel className="text-foreground">Revenue (USD)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="bg-secondary border-border" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Live ROAS preview */}
            {spendNum > 0 && (
              <div className="rounded-lg bg-secondary/50 border border-border p-3 text-sm">
                <span className="text-muted-foreground">ROAS:</span>{' '}
                <span className={`font-semibold ${roas >= 2 ? 'text-green-400' : roas >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {roas.toFixed(2)}x
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Budget</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border" placeholder="Ex: $500/dia" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cpm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">CPM</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="bg-secondary border-border" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">CTR</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border" placeholder="Ex: 2.5%" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">CPA</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" className="bg-secondary border-border" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Hook do Criativo</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-secondary border-border" placeholder="Ex: Médico revela segredo..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conv_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Notas</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-secondary border-border resize-none" rows={2} placeholder="Observações sobre a campanha..." />
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
