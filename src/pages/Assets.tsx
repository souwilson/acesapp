import { useState, useMemo } from 'react';
import { Package, Plus, ExternalLink, Pencil, Trash2 } from 'lucide-react';
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
import { Asset, useAssets, useDeleteAsset } from '@/hooks/useAssets';
import { AssetFormDialog } from '@/components/forms/AssetFormDialog';

const statusConfig: Record<Asset['status'], { label: string; className: string }> = {
  online: { label: 'Online', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  paused: { label: 'Pausado', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  banned: { label: 'Banido', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  dead: { label: 'Morto', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const assetTypeLabels: Record<Asset['asset_type'], string> = {
  domain: 'Domínio',
  page: 'Página',
  pixel: 'Pixel',
  ad_account: 'Conta Ads',
  gateway: 'Gateway',
  checkout: 'Checkout',
  email: 'Email',
  other: 'Outro',
};

const ALL_VALUE = '__all__';

export default function Assets() {
  const { data: assets = [], isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filterProduct, setFilterProduct] = useState(ALL_VALUE);
  const [filterType, setFilterType] = useState(ALL_VALUE);
  const [filterStatus, setFilterStatus] = useState(ALL_VALUE);

  const products = useMemo(() => [...new Set(assets.map((a) => a.product))].sort(), [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (filterProduct !== ALL_VALUE && a.product !== filterProduct) return false;
      if (filterType !== ALL_VALUE && a.asset_type !== filterType) return false;
      if (filterStatus !== ALL_VALUE && a.status !== filterStatus) return false;
      return true;
    });
  }, [assets, filterProduct, filterType, filterStatus]);

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormOpen(true);
  };

  const handleNewAsset = () => {
    setSelectedAsset(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAsset.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Asset Registry</h1>
            <p className="text-sm text-muted-foreground">Inventário de ativos digitais da operação</p>
          </div>
        </div>
        <Button onClick={handleNewAsset} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Ativo
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

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos os tipos</SelectItem>
                {Object.entries(assetTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
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

            {(filterProduct !== ALL_VALUE || filterType !== ALL_VALUE || filterStatus !== ALL_VALUE) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilterProduct(ALL_VALUE); setFilterType(ALL_VALUE); setFilterStatus(ALL_VALUE); }}
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
            {filtered.length} {filtered.length === 1 ? 'ativo' : 'ativos'}
            {filtered.length !== assets.length && ` (de ${assets.length} total)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando ativos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Package className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {assets.length === 0
                  ? 'Nenhum ativo cadastrado. Clique em "Novo Ativo" para começar.'
                  : 'Nenhum ativo encontrado com os filtros selecionados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 pr-4 font-medium">Produto</th>
                    <th className="text-left py-3 pr-4 font-medium">Tipo</th>
                    <th className="text-left py-3 pr-4 font-medium">Nome</th>
                    <th className="text-left py-3 pr-4 font-medium">País</th>
                    <th className="text-left py-3 pr-4 font-medium">Status</th>
                    <th className="text-left py-3 pr-4 font-medium">Link / ID</th>
                    <th className="text-left py-3 pr-4 font-medium">Verificado</th>
                    <th className="text-right py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const status = statusConfig[asset.status];
                    return (
                      <tr key={asset.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 pr-4 text-foreground font-medium">{asset.product}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{assetTypeLabels[asset.asset_type]}</td>
                        <td className="py-3 pr-4 text-foreground">{asset.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{asset.country || '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-[180px] truncate">
                          {asset.link_or_id ? (
                            asset.link_or_id.startsWith('http') ? (
                              <a
                                href={asset.link_or_id}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Link
                              </a>
                            ) : (
                              <span className="font-mono text-xs">{asset.link_or_id}</span>
                            )
                          ) : '—'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {asset.last_checked
                            ? new Date(asset.last_checked).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEdit(asset)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(asset.id)}
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
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={selectedAsset}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover ativo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. O ativo será removido permanentemente do inventário.
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
