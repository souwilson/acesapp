import { useState, useMemo } from 'react';
import { Palette, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
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
import { Creative, useCreatives, useDeleteCreative } from '@/hooks/useCreatives';
import { CreativeFormDialog } from '@/components/forms/CreativeFormDialog';

const ALL_VALUE = '__all__';

const statusConfig: Record<Creative['status'], { label: string; className: string }> = {
  active:  { label: 'Ativo',     className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  testing: { label: 'Em Teste',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  paused:  { label: 'Pausado',   className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  dead:    { label: 'Morto',     className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const typeLabels: Record<Creative['creative_type'], string> = {
  video:    'Vídeo',
  image:    'Imagem',
  copy:     'Copy',
  carousel: 'Carrossel',
  other:    'Outro',
};

export default function Creatives() {
  const { data: creatives = [], isLoading } = useCreatives();
  const deleteCreative = useDeleteCreative();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filterProduct, setFilterProduct] = useState(ALL_VALUE);
  const [filterType, setFilterType] = useState(ALL_VALUE);
  const [filterStatus, setFilterStatus] = useState(ALL_VALUE);

  const products = useMemo(
    () => [...new Set(creatives.map((c) => c.product))].sort(),
    [creatives]
  );

  const filtered = useMemo(() => {
    return creatives.filter((c) => {
      if (filterProduct !== ALL_VALUE && c.product !== filterProduct) return false;
      if (filterType !== ALL_VALUE && c.creative_type !== filterType) return false;
      if (filterStatus !== ALL_VALUE && c.status !== filterStatus) return false;
      return true;
    });
  }, [creatives, filterProduct, filterType, filterStatus]);

  const hasFilters = filterProduct !== ALL_VALUE || filterType !== ALL_VALUE || filterStatus !== ALL_VALUE;

  const handleEdit = (creative: Creative) => {
    setSelectedCreative(creative);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedCreative(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCreative.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Creative Registry</h1>
            <p className="text-sm text-muted-foreground">Banco de criativos por produto e plataforma</p>
          </div>
        </div>
        <Button onClick={handleNew} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Criativo
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
                {Object.entries(typeLabels).map(([value, label]) => (
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

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterProduct(ALL_VALUE);
                  setFilterType(ALL_VALUE);
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
            {filtered.length} {filtered.length === 1 ? 'criativo' : 'criativos'}
            {hasFilters && filtered.length !== creatives.length && ` (de ${creatives.length} total)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando criativos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Palette className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {creatives.length === 0
                  ? 'Nenhum criativo cadastrado. Clique em "Novo Criativo" para começar.'
                  : 'Nenhum criativo encontrado com os filtros selecionados.'}
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
                    <th className="text-left py-3 pr-4 font-medium">Hook</th>
                    <th className="text-left py-3 pr-4 font-medium">Plataforma</th>
                    <th className="text-left py-3 pr-4 font-medium">Status</th>
                    <th className="text-left py-3 pr-4 font-medium">Link</th>
                    <th className="text-right py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((creative) => {
                    const status = statusConfig[creative.status];
                    return (
                      <tr
                        key={creative.id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-foreground font-medium">{creative.product}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{typeLabels[creative.creative_type]}</td>
                        <td className="py-3 pr-4 text-foreground max-w-[180px] truncate">{creative.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-[200px] truncate">
                          {creative.hook || '—'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{creative.platform || '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {creative.link ? (
                            <a
                              href={creative.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEdit(creative)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(creative.id)}
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

      <CreativeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        creative={selectedCreative}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover criativo?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. O criativo será removido permanentemente.
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
