import { motion } from 'framer-motion';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthOption {
  value: string;
  label: string;
}

interface PerformanceChartProps {
  data: Array<{
    date: string;
    revenue: number;
    adSpend: number;
    sales: number;
    roas?: number;
    profit?: number;
  }>;
  className?: string;
  monthOptions?: MonthOption[];
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

const ProfitLabel = (props: Record<string, unknown>) => {
  const { x, y, width, value, payload } = props;
  const profit = payload?.revenue - payload?.adSpend;
  const isProfit = profit >= 0;
  
  if (profit === undefined || isNaN(profit)) return null;
  
  const formattedValue = profit >= 1000 || profit <= -1000
    ? `${(profit / 1000).toFixed(1)}k`
    : profit.toFixed(0);
  
  return (
    <g>
      {/* Background pill */}
      <rect
        x={x + width / 2 - 28}
        y={y - 28}
        width={56}
        height={22}
        rx={4}
        fill={isProfit ? 'hsl(142, 70%, 45%)' : 'hsl(0, 84%, 60%)'}
      />
      {/* Text */}
      <text
        x={x + width / 2}
        y={y - 13}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight={600}
      >
        {isProfit ? '+' : ''}{formattedValue}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    const roas = data?.adSpend > 0 ? (data.revenue / data.adSpend).toFixed(2) : '0.00';
    
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[180px]">
        <p className="text-sm font-medium text-foreground mb-3 border-b border-border pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center justify-between gap-4 mb-1">
            <span className="flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name === 'Vendas' 
                ? entry.value.toLocaleString('pt-BR')
                : `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }
            </span>
          </p>
        ))}
        <div className="border-t border-border mt-2 pt-2">
          <p className="text-sm flex items-center justify-between gap-4">
            <span className="text-muted-foreground">ROAS:</span>
            <span className="font-bold text-primary">{roas}x</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PerformanceChart({ 
  data, 
  className, 
  monthOptions = [], 
  selectedMonth, 
  onMonthChange 
}: PerformanceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance de Vendas</h3>
          <p className="text-sm text-muted-foreground">Faturamento, Gastos Ads e Quantidade de Vendas</p>
        </div>
        {monthOptions.length > 0 && onMonthChange && (
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="colorAdSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="date"
              stroke="hsl(215, 15%, 55%)"
              tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(215, 15%, 55%)"
              tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(142, 70%, 45%)"
              tick={{ fill: 'hsl(142, 70%, 45%)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Faturamento"
              fill="url(#colorRevenue)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            >
              <LabelList content={<ProfitLabel />} />
            </Bar>
            <Bar
              yAxisId="left"
              dataKey="adSpend"
              name="Gastos Ads"
              fill="url(#colorAdSpend)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sales"
              name="Vendas"
              stroke="hsl(142, 70%, 45%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(142, 70%, 45%)', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
