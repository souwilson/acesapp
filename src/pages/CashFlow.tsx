import { useState, useMemo } from 'react';
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
import { CashFlowEntry, useCashFlow, useDeleteCashFlowEntry } from '@/hooks/useCashFlow';
import { CashFlowEntryDialog } from '@/components/forms/CashFlowEntryDialog';

const ALL_VALUE = '__all__';

type Preset = '7d' | '30d' | 'custom';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getPresetDates(preset: Preset): { startDate: string; endDate: string } {
  const today = new Date();
  const end = today.toISOString().split('T')[0];
  if (preset === '7d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { startDate: start.toISOString().split('T')[0], endDate: end };
  }
  if (preset === '30d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { startDate: start.toISOString().split('T')[0], endDate: end };
  }
  return { startDate: '', endDate: '' };
}

function RoasBadge({ roas }: { roas: number | null }) {
  if (roas === null || roas === 0) return <span className="text-muted-foreground">—</span>;
  const className = roas >= 2 ? 'text-green-400' : roas >= 1 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-semibold ${className}`}>{roas.toFixed(2)}x</span>;
}

function ProfitCell({ profit }: { profit: number }) {
  const className = profit >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold';
  return <span className={className}>{formatCurrency(profit)}</span>;
}

export default function CashFlow() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterProduct, setFilterProduct] = useState(ALL_VALUE);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CashFlowEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteEntry = useDeleteCashFlowEntry();

  const { startDate, endDate } = useMemo(() => {
    if (preset === 'custom') return { startDate: customStart, endDate: customEnd };
    return getPresetDates(preset);
  }, [preset, customStart, customEnd]);

  const { data: entries = [], isLoading } = useCashFlow({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    product: filterProduct !== ALL_VALUE ? filterProduct : undefined,
  });

  const products = useMemo(
    () => [...new Set(entries.map((e) => e.product).filter(Boolean) as string[])].sort(),
    [entries]
  );

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          investment: acc.investment + e.investment,
          revenue: acc.revenue + e.revenue,
          profit: acc.profit + e.profit,
          sales: acc.sales + e.sales,
        }),
        { investment: 0, revenue: 0, profit: 0, sales: 0 }
      ),
    [entries]
  );

  const roasGeral = totals.investment > 0 ? totals.revenue / totals.investment : 0;

  const handleEdit = (entry: CashFlowEntry) => {
    setSelectedEntry(entry);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedEntry(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEntry.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cash Flow</h1>
            <p className="text-sm text-muted-foreground">P&L diário por produto e plataforma</p>
          </div>
        </div>
        <Button onClick={handleNew} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totals.investment)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totals.revenue)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totals.profit)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              ROAS Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${roasGeral >= 2 ? 'text-green-400' : roasGeral >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {roasGeral.toFixed(2)}x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Period presets */}
            <div className="flex gap-1">
              {(['7d', '30d', 'custom'] as Preset[]).map((p) => (
                <Button
                  key={p}
                  variant={preset === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreset(p)}
                  className={preset === p ? 'gradient-primary text-primary-foreground' : ''}
                >
                  {p === '7d' ? 'Últimos 7d' : p === '30d' ? 'Últimos 30d' : 'Personalizado'}
                </Button>
              ))}
            </div>

            {/* Custom date range */}
            {preset === 'custom' && (
              <>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-36 bg-secondary border-border text-sm"
                />
                <span className="text-muted-foreground text-sm">até</span>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-36 bg-secondary border-border text-sm"
                />
              </>
            )}

            {/* Product filter */}
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

            {filterProduct !== ALL_VALUE && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterProduct(ALL_VALUE)}
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
            {entries.length} {entries.length === 1 ? 'registro' : 'registros'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando registros...</div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Nenhum registro encontrado no período. Clique em &quot;Novo Registro&quot; para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-3 pr-4 font-medium">Data</th>
                    <th className="text-left py-3 pr-4 font-medium">Produto</th>
                    <th className="text-left py-3 pr-4 font-medium">Plataforma</th>
                    <th className="text-right py-3 pr-4 font-medium">Investimento</th>
                    <th className="text-right py-3 pr-4 font-medium">Receita</th>
                    <th className="text-right py-3 pr-4 font-medium">Profit</th>
                    <th className="text-right py-3 pr-4 font-medium">ROAS</th>
                    <th className="text-right py-3 pr-4 font-medium">Vendas</th>
                    <th className="text-right py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.ad_performance_id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 pr-4 text-foreground">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{entry.product || '—'}</td>
                      <td className="py-3 pr-4 text-foreground">{entry.platform}</td>
                      <td className="py-3 pr-4 text-right text-foreground">{formatCurrency(entry.investment)}</td>
                      <td className="py-3 pr-4 text-right text-foreground">{formatCurrency(entry.revenue)}</td>
                      <td className="py-3 pr-4 text-right">
                        <ProfitCell profit={entry.profit} />
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <RoasBadge roas={entry.roas} />
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">{entry.sales}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(entry.ad_performance_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CashFlowEntryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={selectedEntry}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
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
