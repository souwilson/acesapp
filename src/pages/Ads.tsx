import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Target, Loader2, Users, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ManagerPerformance {
  manager: string;
  investment: number;
  revenue: number;
  sales: number;
  roas: number;
  cpa: number;
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdPerformance, useDeleteAdPerformance, AdPerformance } from '@/hooks/useAdPerformance';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { AdPerformanceFormDialog } from '@/components/forms/AdPerformanceFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { CsvUploadDialog } from '@/components/forms/CsvUploadDialog';
import { CampaignExpandedRow } from '@/components/ads/CampaignExpandedRow';
import { useAdCampaignsByIds, AdCampaign } from '@/hooks/useAdCampaigns';
import { cn } from '@/lib/utils';

// Format YYYY-MM-DD to DD/MM/YYYY without timezone issues
function formatDateBR(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Format YYYY-MM-DD to DD/MM for charts
function formatDateShort(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

const adPlatformLabels: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  twitter: 'Twitter/X',
  tiktok: 'TikTok Ads',
  other: 'Outros',
};

const platformColors: Record<string, string> = {
  meta: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  google: 'bg-red-500/10 text-red-400 border-red-500/30',
  twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  tiktok: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  other: 'bg-muted text-muted-foreground border-border',
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'ROAS' ? Number(entry.value).toFixed(2) : `R$ ${Number(entry.value).toLocaleString('pt-BR')}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Ads = () => {
  const { data: ads = [], isLoading } = useAdPerformance();
  const deleteAdPerformance = useDeleteAdPerformance();
  const createAuditLog = useCreateAuditLog();
  
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdPerformance | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<AdPerformance | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique managers from ads
  const managers = useMemo(() => {
    const managerSet = new Set<string>();
    ads.forEach(ad => {
      if (ad.manager) managerSet.add(ad.manager);
    });
    return Array.from(managerSet).sort();
  }, [ads]);

  const filteredAds = ads.filter((ad) => {
    const platformMatch = platformFilter === 'all' || ad.platform === platformFilter;
    const managerMatch = managerFilter === 'all' || ad.manager === managerFilter;
    return platformMatch && managerMatch;
  });

  // Fetch campaigns for all visible ads
  const adIds = useMemo(() => filteredAds.map(a => a.id), [filteredAds]);
  const { data: allCampaigns = [], isLoading: campaignsLoading } = useAdCampaignsByIds(adIds);
  const campaignsByAdId = useMemo(() => {
    const map: Record<string, AdCampaign[]> = {};
    allCampaigns.forEach(c => {
      if (!map[c.ad_performance_id]) map[c.ad_performance_id] = [];
      map[c.ad_performance_id].push(c);
    });
    return map;
  }, [allCampaigns]);

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalInvestment = filteredAds.reduce((sum, ad) => sum + Number(ad.investment), 0);
  const totalRevenue = filteredAds.reduce((sum, ad) => sum + Number(ad.revenue), 0);
  const totalSales = filteredAds.reduce((sum, ad) => sum + ad.sales, 0);
  const avgRoas = totalInvestment > 0 ? totalRevenue / totalInvestment : 0;

  const platforms = Object.keys(adPlatformLabels);

  // Manager performance data for chart
  const managerPerformance = useMemo(() => {
    return managers
      .map((manager) => {
        const managerAds = ads.filter((ad) => ad.manager === manager);
        if (managerAds.length === 0) return null;
        const investment = managerAds.reduce((sum, ad) => sum + Number(ad.investment), 0);
        const revenue = managerAds.reduce((sum, ad) => sum + Number(ad.revenue), 0);
        const sales = managerAds.reduce((sum, ad) => sum + ad.sales, 0);
        return {
          manager,
          investment,
          revenue,
          sales,
          roas: investment > 0 ? revenue / investment : 0,
          cpa: sales > 0 ? investment / sales : 0,
        };
      })
      .filter(Boolean);
  }, [ads, managers]);

  // Prepare chart data
  const roasChartData = useMemo(() => {
    const adsToUse = managerFilter === 'all' ? ads : ads.filter(ad => ad.manager === managerFilter);
    const grouped = adsToUse.reduce((acc, ad) => {
      const date = formatDateShort(ad.date);
      if (!acc[date]) {
        acc[date] = { date, roas: 0, count: 0, investment: 0, revenue: 0 };
      }
      acc[date].roas += Number(ad.roas);
      acc[date].count += 1;
      acc[date].investment += Number(ad.investment);
      acc[date].revenue += Number(ad.revenue);
      return acc;
    }, {} as Record<string, { date: string; roas: number; count: number; investment: number; revenue: number }>);

    return Object.values(grouped)
      .map((d) => ({
        date: d.date,
        roas: d.roas / d.count,
        investment: d.investment,
        revenue: d.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [ads, managerFilter]);

  const platformPerformance = useMemo(() => {
    return platforms
      .map((platform) => {
        const platformAds = ads.filter((ad) => ad.platform === platform);
        if (platformAds.length === 0) return null;
        const investment = platformAds.reduce((sum, ad) => sum + Number(ad.investment), 0);
        const revenue = platformAds.reduce((sum, ad) => sum + Number(ad.revenue), 0);
        return {
          platform: adPlatformLabels[platform],
          investment,
          revenue,
          roas: investment > 0 ? revenue / investment : 0,
        };
      })
      .filter(Boolean);
  }, [ads]);

  const handleEdit = (ad: AdPerformance) => {
    setEditingAd(ad);
    setFormOpen(true);
  };

  const handleDelete = (ad: AdPerformance) => {
    setAdToDelete(ad);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (adToDelete) {
      await deleteAdPerformance.mutateAsync(adToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'ad_performance',
        entityId: adToDelete.id,
        entityName: `${adToDelete.platform} - ${adToDelete.date}`,
        oldValues: adToDelete as unknown as import('@/integrations/supabase/types').Json,
      });
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingAd(null);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Ads</h1>
          <p className="text-muted-foreground mt-1">
            Performance e métricas de mídia paga por gestor
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setCsvOpen(true)}
            className="border-border"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Button 
            onClick={() => setFormOpen(true)}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <p className="text-sm font-medium text-muted-foreground">Investimento Total</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalInvestment.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
          </div>
          <p className="text-2xl font-bold text-success">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-primary/20 bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">ROAS Médio</p>
          </div>
          <p className="text-2xl font-bold text-primary">{avgRoas.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">Total de Vendas</p>
          <p className="text-2xl font-bold text-foreground">{totalSales}</p>
          <p className="text-sm text-muted-foreground mt-1">
            CPA médio: R$ {totalSales > 0 ? (totalInvestment / totalSales).toFixed(2) : '0.00'}
          </p>
        </motion.div>
      </div>

      {/* Manager Performance Section */}
      {managers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Performance por Gestor de Tráfego
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managerPerformance.map((manager: ManagerPerformance) => (
              <motion.div
                key={manager.manager}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{manager.manager}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'border',
                      manager.roas >= 3 ? 'bg-success/10 text-success border-success/30' : 
                      manager.roas >= 2 ? 'bg-warning/10 text-warning border-warning/30' : 
                      'bg-destructive/10 text-destructive border-destructive/30'
                    )}
                  >
                    ROAS {manager.roas.toFixed(2)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Investimento</p>
                    <p className="font-mono font-medium text-destructive">
                      R$ {manager.investment.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Receita</p>
                    <p className="font-mono font-medium text-success">
                      R$ {manager.revenue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendas</p>
                    <p className="font-mono font-medium text-foreground">{manager.sales}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPA</p>
                    <p className="font-mono font-medium text-foreground">
                      R$ {manager.cpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      {ads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">ROAS por Dia</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roasChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(215, 15%, 55%)"
                    tick={{ fill: 'hsl(215, 15%, 55%)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 15%, 55%)"
                    tick={{ fill: 'hsl(215, 15%, 55%)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="roas"
                    name="ROAS"
                    stroke="hsl(190, 95%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(190, 95%, 50%)', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Investimento vs Receita por Plataforma</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformPerformance} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis
                    dataKey="platform"
                    stroke="hsl(215, 15%, 55%)"
                    tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 15%, 55%)"
                    tick={{ fill: 'hsl(215, 15%, 55%)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="investment" name="Investimento" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Receita" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Filtrar plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as plataformas</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {adPlatformLabels[platform]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={managerFilter} onValueChange={setManagerFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border">
            <SelectValue placeholder="Filtrar gestor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os gestores</SelectItem>
            {managers.map((manager) => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {ads.length === 0 ? 'Nenhum registro de ads cadastrado ainda.' : 'Nenhum registro encontrado.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground w-8"></TableHead>
                <TableHead className="text-muted-foreground">Gestor</TableHead>
                <TableHead className="text-muted-foreground">Plataforma</TableHead>
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground text-right">Investimento</TableHead>
                <TableHead className="text-muted-foreground text-right">Receita</TableHead>
                <TableHead className="text-muted-foreground text-right">Vendas</TableHead>
                <TableHead className="text-muted-foreground text-right">ROAS</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map((ad) => {
                const hasCampaigns = (campaignsByAdId[ad.id]?.length ?? 0) > 0;
                const isExpanded = expandedRows.has(ad.id);
                return (
                  <>
                    <TableRow 
                      key={ad.id} 
                      className={cn("border-border", hasCampaigns && "cursor-pointer hover:bg-muted/50")}
                      onClick={() => hasCampaigns && toggleExpand(ad.id)}
                    >
                      <TableCell className="w-8 px-2">
                        {hasCampaigns && (
                          isExpanded 
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> 
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {ad.manager || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border', platformColors[ad.platform])}>
                          {adPlatformLabels[ad.platform]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateBR(ad.date)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        R$ {Number(ad.investment).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-success">
                        R$ {Number(ad.revenue).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">{ad.sales}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-mono font-medium',
                            Number(ad.roas) >= 3 ? 'text-success' : Number(ad.roas) >= 2 ? 'text-warning' : 'text-destructive'
                          )}
                        >
                          {Number(ad.roas).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(ad)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(ad)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <CampaignExpandedRow
                        campaigns={campaignsByAdId[ad.id] || []}
                        isLoading={campaignsLoading}
                        colSpan={9}
                      />
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <AdPerformanceFormDialog 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        adPerformance={editingAd} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir registro de ads"
        description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        isLoading={deleteAdPerformance.isPending}
      />

      <CsvUploadDialog open={csvOpen} onOpenChange={setCsvOpen} />
    </DashboardLayout>
  );
};

export default Ads;