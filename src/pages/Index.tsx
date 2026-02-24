import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, Target, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useTools } from '@/hooks/useTools';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useAdPerformance } from '@/hooks/useAdPerformance';
import { useDismissedAlerts, useDismissAlert } from '@/hooks/useDismissedAlerts';
import { useMemo, useState } from 'react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Index = () => {
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const { data: tools = [], isLoading: toolsLoading } = useTools();
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useCollaborators();
  const { data: ads = [], isLoading: adsLoading } = useAdPerformance();
  const { data: dismissedAlerts = [] } = useDismissedAlerts();
  const dismissAlert = useDismissAlert();

  const isLoading = platformsLoading || toolsLoading || collaboratorsLoading || adsLoading;

  // Set of dismissed alert keys for quick lookup
  const dismissedAlertKeys = useMemo(() => {
    return new Set(dismissedAlerts.map(d => d.alert_key));
  }, [dismissedAlerts]);

  // Get current month key for default selection
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Generate available month options from ads data
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    ads.forEach(ad => {
      const [year, month] = ad.date.split('-');
      months.add(`${year}-${month}`);
    });
    
    return Array.from(months)
      .sort((a, b) => b.localeCompare(a)) // Most recent first
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        return {
          value: monthKey,
          label: `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
        };
      });
  }, [ads]);

  // Calculate metrics
  const totalBalance = useMemo(() => {
    return platforms.reduce((sum, p) => {
      const rate = p.currency === 'BRL' ? 1 : 5.5;
      return sum + Number(p.balance) * (p.currency === 'BRL' ? 1 : rate);
    }, 0);
  }, [platforms]);

  const monthlyToolsCost = useMemo(() => {
    const toolsCost = tools
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + Number(t.monthly_value) * (t.currency === 'BRL' ? 1 : 5.5), 0);
    const collaboratorsCost = collaborators
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.monthly_value), 0);
    return toolsCost + collaboratorsCost;
  }, [tools, collaborators]);

  // Filter ads for current month only (for KPI cards)
  const currentMonthAds = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    
    return ads.filter(ad => {
      const [year, month] = ad.date.split('-').map(Number);
      return year === currentYear && month === currentMonth;
    });
  }, [ads]);

  // Filter ads for selected month (for chart)
  const selectedMonthAds = useMemo(() => {
    if (!selectedMonth) return [];
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    
    return ads.filter(ad => {
      const [year, month] = ad.date.split('-').map(Number);
      return year === selectedYear && month === selectedMonthNum;
    });
  }, [ads, selectedMonth]);

  const monthlyRevenue = useMemo(() => {
    return currentMonthAds.reduce((sum, ad) => sum + Number(ad.revenue), 0);
  }, [currentMonthAds]);

  const avgRoas = useMemo(() => {
    if (currentMonthAds.length === 0) return 0;
    return currentMonthAds.reduce((sum, ad) => sum + Number(ad.roas), 0) / currentMonthAds.length;
  }, [currentMonthAds]);

  // Generate alerts (filtering out dismissed ones)
  const alerts = useMemo(() => {
    const alertList: Array<{ id: string; type: 'warning' | 'critical' | 'info'; title: string; description: string; canDismiss: boolean }> = [];

    // Check for tools due soon
    tools.forEach((tool) => {
      if (tool.status !== 'active') return;
      const alertKey = `tool-${tool.id}`;
      
      // Skip if already dismissed
      if (dismissedAlertKeys.has(alertKey)) return;
      
      const dueDate = new Date(tool.due_date);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        alertList.push({
          id: alertKey,
          type: 'warning',
          title: `${tool.name} vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
          description: `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}`,
          canDismiss: true,
        });
      }
    });

    // Check for low balance platforms (informational - no dismiss button)
    platforms.forEach((platform) => {
      const threshold = platform.currency === 'BRL' ? 10000 : 2000;
      if (Number(platform.balance) < threshold) {
        alertList.push({
          id: `platform-${platform.id}`,
          type: 'critical',
          title: `Saldo baixo em ${platform.name}`,
          description: `Saldo atual: ${platform.currency === 'BRL' ? 'R$' : '$'} ${Number(platform.balance).toLocaleString(platform.currency === 'BRL' ? 'pt-BR' : 'en-US')}`,
          canDismiss: false,
        });
      }
    });

    // Check for low ROAS ads (current month only) - this one cannot be dismissed
    const lowRoasAds = currentMonthAds.filter((ad) => Number(ad.roas) < 2);
    if (lowRoasAds.length > 0) {
      const platforms = [...new Set(lowRoasAds.map((ad) => ad.platform))];
      alertList.push({
        id: 'low-roas',
        type: 'info',
        title: 'ROAS abaixo da média',
        description: `${lowRoasAds.length} registro(s) com ROAS < 2.0 em ${platforms.join(', ')}`,
        canDismiss: false,
      });
    }

    return alertList.slice(0, 5);
  }, [tools, platforms, currentMonthAds, dismissedAlertKeys]);

  // Handler for dismissing alerts
  const handleDismissAlert = (alertId: string) => {
    dismissAlert.mutate({ alertKey: alertId });
  };

  // Prepare chart data - sorted chronologically by date (selected month)
  const performanceData = useMemo(() => {
    if (selectedMonthAds.length === 0) {
      return [{ date: 'Sem dados', revenue: 0, adSpend: 0, sales: 0 }];
    }

    const grouped = selectedMonthAds.reduce((acc, ad) => {
      const dateKey = ad.date; // Keep original YYYY-MM-DD for sorting
      if (!acc[dateKey]) {
        acc[dateKey] = { dateKey, revenue: 0, adSpend: 0, sales: 0 };
      }
      acc[dateKey].revenue += Number(ad.revenue);
      acc[dateKey].adSpend += Number(ad.investment);
      acc[dateKey].sales += Number(ad.sales);
      return acc;
    }, {} as Record<string, { dateKey: string; revenue: number; adSpend: number; sales: number }>);

    // Sort by date chronologically (ascending) and format for display
    return Object.values(grouped)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(item => {
        const [year, month, day] = item.dateKey.split('-');
        return {
          date: `${day}/${month}`,
          revenue: item.revenue,
          adSpend: item.adSpend,
          sales: item.sales,
        };
      });
  }, [selectedMonthAds]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 lg:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Visão geral do seu negócio • Atualizado agora
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <MetricCard
          title="Saldo Total Consolidado"
          value={`R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: 12.5, isPositive: true }}
          subtitle="vs mês anterior"
          variant="primary"
          delay={0}
        />
        <MetricCard
          title="Custos Fixos Mensais"
          value={`R$ ${monthlyToolsCost.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={<TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: 3.2, isPositive: false }}
          subtitle="vs mês anterior"
          variant="destructive"
          delay={0.05}
        />
        <MetricCard
          title="Receita do Mês"
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR')}`}
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: 18.7, isPositive: true }}
          subtitle="vs mês anterior"
          variant="success"
          delay={0.1}
        />
        <MetricCard
          title="ROAS Médio"
          value={avgRoas.toFixed(2)}
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: 5.3, isPositive: true }}
          subtitle="vs mês anterior"
          variant="primary"
          delay={0.15}
        />
      </div>

      {/* Performance Chart */}
      <div className="mb-6 lg:mb-8">
        <PerformanceChart 
          data={performanceData}
          monthOptions={monthOptions}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* Alerts */}
      <AlertCard 
        alerts={alerts} 
        onDismiss={handleDismissAlert}
        isDismissing={dismissAlert.isPending}
      />
    </DashboardLayout>
  );
};

export default Index;
