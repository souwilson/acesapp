import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface ProductPLData {
  product: string;
  investment: number;
  revenue: number;
  profit: number;
}

interface ProductPLChartProps {
  data: ProductPLData[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: ${entry.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

export function ProductPLChart({ data }: ProductPLChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
        Nenhum dado com produto definido no período.
      </div>
    );
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis
            dataKey="product"
            stroke="hsl(215, 15%, 55%)"
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(215, 15%, 55%)"
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'hsl(215, 15%, 55%)' }}
          />
          <Bar dataKey="investment" name="Spend"   fill="hsl(215, 60%, 55%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue"    name="Revenue" fill="hsl(190, 95%, 50%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit"     name="Profit"  fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
