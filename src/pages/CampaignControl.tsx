import { useState, useMemo } from 'react';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Campaign,
  useCampaignControl,
  useDeleteCampaign,
  useUpdateCampaign,
} from '@/hooks/useCampaignControl';
import { CampaignFormDialog } from '@/components/forms/CampaignFormDialog';

const ALL_VALUE = '__all__';

const statusConfig: Record<string, { label: string; className: string }> = {
  escalando: { label: 'Escalando', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  testando:  { label: 'Testando',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  pausar:    { label: 'Pausar',    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  morto:     { label: 'Morto',     className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const STATUS_CYCLE: string[] = ['escalando', 'testando', 'pausar', 'morto'];

function getStatusConfig(status: string | null) {
  if (!status) return { label: '—', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return statusConfig[status] ?? { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
}

function formatCurrency(value: number | null) {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function RoasCell({ roas }: { roas: number | null }) {
  if (roas === null || roas === 0) return <span className="text-muted-foreground">—</span>;
  const className = roas >= 2 ? 'text-green-400 font-semibold' : roas >= 1 ? 'text-yellow-400 font-semibold' : 'text-red-400 font-semibold';
  return <span className={className}>{roas.toFixed(2)}x</span>;
}

export default function CampaignControl() {
  const [filterProduct, setFilterProduct] = useState(ALL_VALUE);
  const [filterCountry, setFilterCountry] = useState(ALL_VALUE);
  const [filterStatus, setFilterStatus] = useState(ALL_VALUE);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  const { data: campaigns = [], isLoading } = useCampaignControl({
    product: filterProduct !== ALL_VALUE ? filterProduct : undefined,
    country: filterCountry !== ALL_VALUE ? filterCountry : undefined,
    status: filterStatus !== ALL_VALUE ? filterStatus : undefined,
  });

  // All campaigns (no filter) to build filter option lists
  const { data: allCampaigns = [] } = useCampaignControl();

  const products = useMemo(
    () => [...new Set(allCampaigns.map((c) => c.product).filter(Boolean) as string[])].sort(),
    [allCampaigns]
  );

  const countries = useMemo(
    () => [...new Set(allCampaigns.map((c) => c.country).filter(Boolean) as string[])].sort(),
    [allCampaigns]
  );

  const hasFilters = filterProduct !== ALL_VALUE || filterCountry !== ALL_VALUE || filterStatus !== ALL_VALUE;

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedCampaign(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCampaign.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleQuickStatus = async (campaign: Campaign) => {
    const currentIdx = STATUS_CYCLE.indexOf(campaign.status ?? '');
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await updateCampaign.mutateAsync({ id: campaign.id, status: nextStatus });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Control</h1>
            <p className="text-sm text-muted-foreground">Visão centralizada de campanhas por produto</p>
          </div>
        </div>
        <Button onClick={handleNew} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os produtos</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os países</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os status</SelectItem>
                {Object.entries(statusConfig).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterProduct(ALL_VALUE);
                  setFilterCountry(ALL_VALUE);
                  setFilterStatus(ALL_VALUE);
                }}
                className="text-muted-foreground"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">
            {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'}
            {hasFilters && allCampaigns.length !== campaigns.length && ` (de ${allCampaigns.length} total)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando campanhas...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Target className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {allCampaigns.length === 0
                  ? 'Nenhuma campanha cadastrada. Clique em "Nova Campanha" para começar.'
                  : 'Nenhuma campanha encontrada com os filtros selecionados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 pr-4 font-medium">Produto</th>
                    <th className="text-left py-3 pr-4 font-medium">País</th>
                    <th className="text-left py-3 pr-4 font-medium">Campanha</th>
                    <th className="text-right py-3 pr-4 font-medium">Spend</th>
                    <th className="text-right py-3 pr-4 font-medium">Revenue</th>
                    <th className="text-right py-3 pr-4 font-medium">ROAS</th>
                    <th className="text-right py-3 pr-4 font-medium">CPA</th>
                    <th className="text-left py-3 pr-4 font-medium">Status</th>
                    <th className="text-left py-3 pr-4 font-medium">Hook</th>
                    <th className="text-right py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => {
                    const status = getStatusConfig(campaign.status);
                    return (
                      <tr
                        key={campaign.id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-foreground font-medium">{campaign.product || '—'}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{campaign.country || '—'}</td>
                        <td className="py-3 pr-4 text-foreground max-w-[200px] truncate">{campaign.campaign_name}</td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{formatCurrency(campaign.spend)}</td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{formatCurrency(campaign.revenue)}</td>
                        <td className="py-3 pr-4 text-right">
                          <RoasCell roas={campaign.roas} />
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{formatCurrency(campaign.cpa)}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleQuickStatus(campaign)}
                            title="Clique para avançar status"
                            className="cursor-pointer"
                          >
                            <Badge variant="outline" className={status.className}>
                              {status.label}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-[160px] truncate">
                          {campaign.hook || '—'}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEdit(campaign)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={selectedCampaign}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover campanha?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. A campanha será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

