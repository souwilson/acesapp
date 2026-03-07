import { useState, useMemo } from 'react';
import { Gauge, TrendingUp, TrendingDown, Package, Palette, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssets } from '@/hooks/useAssets';
import { useCashFlow } from '@/hooks/useCashFlow';
import { useCampaignControl } from '@/hooks/useCampaignControl';
import { useCreatives } from '@/hooks/useCreatives';

type Period = '7d' | '30d';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getPeriodDates(period: Period) {
  const today = new Date();
  const end = today.toISOString().split('T')[0];
  const start = new Date(today);
  start.setDate(start.getDate() - (period === '7d' ? 6 : 29));
  return { startDate: start.toISOString().split('T')[0], endDate: end };
}

const campaignStatusConfig: Record<string, { label: string; className: string }> = {
  escalando: { label: 'Escalando', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  testando:  { label: 'Testando',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  pausar:    { label: 'Pausar',    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  morto:     { label: 'Morto',     className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export default function MissionControl() {
  const [period, setPeriod] = useState<Period>('30d');
  const { startDate, endDate } = getPeriodDates(period);

  const { data: assets = [] } = useAssets();
  const { data: entries = [] } = useCashFlow({ startDate, endDate });
  const { data: campaigns = [] } = useCampaignControl();
  const { data: creatives = [] } = useCreatives();

  // Cash flow KPIs
  const kpis = useMemo(() => {
    const totals = entries.reduce(
      (acc, e) => ({
        investment: acc.investment + e.investment,
        revenue: acc.revenue + e.revenue,
        profit: acc.profit + e.profit,
      }),
      { investment: 0, revenue: 0, profit: 0 }
    );
    return {
      ...totals,
      roas: totals.investment > 0 ? totals.revenue / totals.investment : 0,
    };
  }, [entries]);

  // Asset breakdown
  const assetBreakdown = useMemo(() => ({
    online:  assets.filter((a) => a.status === 'online').length,
    paused:  assets.filter((a) => a.status === 'paused').length,
    banned:  assets.filter((a) => a.status === 'banned').length,
    dead:    assets.filter((a) => a.status === 'dead').length,
  }), [assets]);

  // Creative breakdown
  const creativeBreakdown = useMemo(() => ({
    active:  creatives.filter((c) => c.status === 'active').length,
    testing: creatives.filter((c) => c.status === 'testing').length,
    paused:  creatives.filter((c) => c.status === 'paused').length,
    dead:    creatives.filter((c) => c.status === 'dead').length,
  }), [creatives]);

  // Top 5 campaigns by ROAS
  const topCampaigns = useMemo(
    () => [...campaigns].filter((c) => c.roas !== null).slice(0, 5),
    [campaigns]
  );

  // Last 5 cash flow entries
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mission Control</h1>
            <p className="text-sm text-muted-foreground">Visão consolidada da operação</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['7d', '30d'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? 'gradient-primary text-primary-foreground' : ''}
            >
              {p === '7d' ? 'Últimos 7d' : 'Últimos 30d'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">{formatCurrency(kpis.investment)}</p>
            <p className="text-xs text-muted-foreground mt-1">{entries.length} registros</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">{formatCurrency(kpis.revenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">período selecionado</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold ${kpis.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(kpis.profit)}
              </p>
              {kpis.profit >= 0
                ? <TrendingUp className="h-4 w-4 text-green-400" />
                : <TrendingDown className="h-4 w-4 text-red-400" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              ROAS Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${kpis.roas >= 2 ? 'text-green-400' : kpis.roas >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {kpis.roas.toFixed(2)}x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assets */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Ativos ({assets.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{assetBreakdown.online}</p>
                <p className="text-xs text-muted-foreground mt-1">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{assetBreakdown.paused}</p>
                <p className="text-xs text-muted-foreground mt-1">Pausado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{assetBreakdown.banned}</p>
                <p className="text-xs text-muted-foreground mt-1">Banido</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{assetBreakdown.dead}</p>
                <p className="text-xs text-muted-foreground mt-1">Morto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creatives */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Criativos ({creatives.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{creativeBreakdown.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Ativos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{creativeBreakdown.testing}</p>
                <p className="text-xs text-muted-foreground mt-1">Teste</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{creativeBreakdown.paused}</p>
                <p className="text-xs text-muted-foreground mt-1">Pausado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{creativeBreakdown.dead}</p>
                <p className="text-xs text-muted-foreground mt-1">Morto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns + Recent Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Campaigns */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Top Campanhas por ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma campanha com ROAS registrado.</p>
            ) : (
              <div className="space-y-2">
                {topCampaigns.map((c) => {
                  const statusCfg = campaignStatusConfig[c.status ?? ''] ?? campaignStatusConfig['testando'];
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm text-foreground truncate">{c.campaign_name}</p>
                        <p className="text-xs text-muted-foreground">{c.product || '—'} · {c.country || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-bold ${c.roas! >= 2 ? 'text-green-400' : c.roas! >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {c.roas!.toFixed(2)}x
                        </span>
                        <Badge variant="outline" className={`text-xs ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Cash Flow */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Cash Flow Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum registro no período selecionado.</p>
            ) : (
              <div className="space-y-2">
                {recentEntries.map((e) => (
                  <div key={e.ad_performance_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm text-foreground">{e.product || '—'} · {e.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${e.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(e.profit)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ROAS {e.investment > 0 ? (e.revenue / e.investment).toFixed(2) : '—'}x
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
