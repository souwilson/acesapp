import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { AdCampaign } from '@/hooks/useAdCampaigns';
import { cn } from '@/lib/utils';

interface CampaignExpandedRowProps {
  campaigns: AdCampaign[];
  isLoading: boolean;
  colSpan: number;
}

type SortKey = keyof AdCampaign;
type SortDir = 'asc' | 'desc';

const columns: { key: SortKey; label: string; type: 'text' | 'number' | 'currency' | 'percent' }[] = [
  { key: 'campaign_name', label: 'Campanha', type: 'text' },
  { key: 'sales', label: 'Vendas', type: 'number' },
  { key: 'cpa', label: 'CPA', type: 'currency' },
  { key: 'spend', label: 'Gastos', type: 'currency' },
  { key: 'revenue', label: 'Faturamento', type: 'currency' },
  { key: 'profit', label: 'Lucro', type: 'currency' },
  { key: 'roas', label: 'ROAS', type: 'number' },
  { key: 'margin', label: 'Margem', type: 'percent' },
  { key: 'impressions', label: 'Impressões', type: 'number' },
  { key: 'clicks', label: 'Cliques', type: 'number' },
  { key: 'ctr', label: 'CTR', type: 'percent' },
  { key: 'cpc', label: 'CPC', type: 'currency' },
  { key: 'cpm', label: 'CPM', type: 'currency' },
  { key: 'hook', label: 'Hook', type: 'percent' },
  { key: 'conv_checkout', label: 'Conv. Check.', type: 'percent' },
  { key: 'conv_body', label: 'Conv. Body', type: 'percent' },
  { key: 'frequency', label: 'Freq.', type: 'percent' },
  { key: 'rejected_sales', label: 'Recusadas', type: 'number' },
];

function getNumericValue(val: unknown): number {
  if (val == null || val === '' || val === '-') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[R$%\s]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

export function CampaignExpandedRow({ campaigns, isLoading, colSpan }: CampaignExpandedRowProps) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...campaigns].sort((a, b) => {
    const col = columns.find(c => c.key === sortKey);
    if (!col) return 0;
    if (col.type === 'text') {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    }
    const av = getNumericValue(a[sortKey]);
    const bv = getNumericValue(b[sortKey]);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  if (isLoading) {
    return (
      <TableRow className="border-border bg-muted/30">
        <TableCell colSpan={colSpan} className="py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Carregando campanhas...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (campaigns.length === 0) {
    return (
      <TableRow className="border-border bg-muted/30">
        <TableCell colSpan={colSpan} className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma campanha vinculada a este registro.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <TableRow className="border-border bg-muted/20 hover:bg-muted/30">
        <TableCell colSpan={colSpan} className="py-0 px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={cn(
                        "py-2 px-3 text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground transition-colors",
                        col.key === 'campaign_name' ? 'text-left' : 'text-right'
                      )}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className={cn("flex items-center gap-1", col.key !== 'campaign_name' && 'justify-end')}>
                        <span>{col.label}</span>
                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-muted/40">
                    <td className="py-2 px-3 text-foreground font-medium max-w-[250px] truncate" title={c.campaign_name}>
                      {c.campaign_name}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-foreground">{c.sales}</td>
                    <td className="text-right py-2 px-3 font-mono text-foreground">
                      R$ {c.cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-destructive">
                      R$ {c.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-success">
                      R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={cn(
                      "text-right py-2 px-3 font-mono",
                      c.profit >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      R$ {c.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={cn(
                      "text-right py-2 px-3 font-mono font-medium",
                      Number(c.roas) >= 3 ? 'text-success' : Number(c.roas) >= 2 ? 'text-warning' : 'text-destructive'
                    )}>
                      {Number(c.roas).toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-foreground">{c.margin || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.impressions.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.clicks.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.ctr || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">
                      R$ {c.cpc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">
                      R$ {c.cpm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.hook || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.conv_checkout || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.conv_body || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.frequency || '-'}</td>
                    <td className="text-right py-2 px-3 font-mono text-muted-foreground">{c.rejected_sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
