import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface RevenueExpensesChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueExpensesChart({ data, className }: RevenueExpensesChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Receita vs Gastos</h3>
          <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="month"
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              name="Receita"
              fill="hsl(190, 95%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Gastos"
              fill="hsl(0, 72%, 51%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
