import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAdPerformance } from '@/hooks/useAdPerformance';
import { useBulkInsertAdCampaigns } from '@/hooks/useAdCampaigns';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { toast } from '@/hooks/use-toast';
import { DateInput } from '@/components/ui/DateInput';
import { validateCSVFile, sanitizeCSVCell, checkDangerousContent } from '@/lib/sanitization';

function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, '').trim();
}

function parseBRNumber(value: string): number {
  if (!value || value === 'N/A') return 0;
  const cleaned = stripQuotes(value).replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseBRPercent(value: string): string {
  if (!value || value === 'N/A') return value || '';
  return stripQuotes(value).trim();
}

function parseBRInt(value: string): number {
  if (!value || value === 'N/A') return 0;
  const cleaned = stripQuotes(value).replace(/\./g, '').replace(',', '.').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

interface ParsedCampaign {
  campaign_name: string;
  status: string;
  budget: string;
  sales: number;
  cpa: number;
  spend: number;
  revenue: number;
  profit: number;
  roas: number;
  margin: string;
  impressions: number;
  clicks: number;
  ctr: string;
  cpc: number;
  cpm: number;
  hook: string;
  frequency: string;
  conv_checkout: string;
  conv_body: string;
  rejected_sales: number;
  ic: number;
  cpi: number;
}

function parseCSV(text: string): { summary: ParsedCampaign | null; campaigns: ParsedCampaign[] } {
  // Remove BOM
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) return { summary: null, campaigns: [] };

  // Header is first line
  // Data rows start from line index 1
  // Line 1 = summary row (has "N/A" in Status and "X Campanhas" in Campanha)
  // Lines 2+ = campaign rows

  const campaigns: ParsedCampaign[] = [];
  let summary: ParsedCampaign | null = null;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    // CSV columns: Status;Campanha;Última Atualização;Orçamento;Vendas;CPA;Gastos;Faturamento;Lucro;ROAS;Margem;IC;CPI;CPC;CTR;CPM;Impressões;Cliques;Conv. Check.;Conversão do Body;Hook;Frequência;Vendas Recusadas

    const campaignName = (cols[1] || '').trim();
    if (!campaignName) continue;

    // STORY-SYS-009: Sanitize campaign name for XSS/SQL injection
    const sanitizedName = String(sanitizeCSVCell(campaignName, 'string'));

    // Check for dangerous content
    const dangerCheck = checkDangerousContent(campaignName);
    if (!dangerCheck.safe) {
      console.warn(`Linha ${i}: Conteúdo perigoso detectado em "${campaignName}"`, dangerCheck.reason);
    }

    const parsed: ParsedCampaign = {
      campaign_name: sanitizedName,
      status: String(sanitizeCSVCell(cols[0] || '', 'string')),
      budget: String(sanitizeCSVCell(cols[3] || '', 'string')),
      sales: parseBRInt(cols[4] || ''),
      cpa: parseBRNumber(cols[5] || ''),
      spend: parseBRNumber(cols[6] || ''),
      revenue: parseBRNumber(cols[7] || ''),
      profit: parseBRNumber(cols[8] || ''),
      roas: parseBRNumber(cols[9] || ''),
      margin: String(sanitizeCSVCell(cols[10] || '', 'string')),
      ic: parseBRInt(cols[11] || ''),
      cpi: parseBRNumber(cols[12] || ''),
      cpc: parseBRNumber(cols[13] || ''),
      ctr: String(sanitizeCSVCell(cols[14] || '', 'string')),
      cpm: parseBRNumber(cols[15] || ''),
      impressions: parseBRInt(cols[16] || ''),
      clicks: parseBRInt(cols[17] || ''),
      conv_checkout: String(sanitizeCSVCell(cols[18] || '', 'string')),
      conv_body: String(sanitizeCSVCell(cols[19] || '', 'string')),
      hook: String(sanitizeCSVCell(cols[20] || '', 'string')),
      frequency: String(sanitizeCSVCell(cols[21] || '', 'string')),
      rejected_sales: parseBRInt(cols[22] || ''),
    };

    // Check if it's the summary row (contains "Campanhas" in name)
    if (sanitizedName.includes('Campanhas') || sanitizedName.includes('campanhas')) {
      summary = parsed;
    } else {
      campaigns.push(parsed);
    }
  }

  return { summary, campaigns };
}

interface CsvUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvUploadDialog({ open, onOpenChange }: CsvUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{ summary: ParsedCampaign | null; campaigns: ParsedCampaign[] } | null>(null);
  const [platform, setPlatform] = useState('meta');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [manager, setManager] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const createAdPerformance = useCreateAdPerformance();
  const bulkInsertCampaigns = useBulkInsertAdCampaigns();
  const createAuditLog = useCreateAuditLog();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file size and format
    const validation = validateCSVFile(f);
    if (!validation.valid) {
      toast({
        title: 'Arquivo inválido',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }

    setFile(f);
    const text = await f.text();
    const result = parseCSV(text);
    setParsedData(result);
  };

  const handleSubmit = async () => {
    if (!parsedData || parsedData.campaigns.length === 0) return;
    setIsSubmitting(true);

    try {
      const summary = parsedData.summary;
      const totalInvestment = summary?.spend ?? parsedData.campaigns.reduce((s, c) => s + c.spend, 0);
      const totalRevenue = summary?.revenue ?? parsedData.campaigns.reduce((s, c) => s + c.revenue, 0);
      const totalSales = summary?.sales ?? parsedData.campaigns.reduce((s, c) => s + c.sales, 0);

      // Create ad_performance record
      const adRecord = await createAdPerformance.mutateAsync({
        platform: platform as 'meta' | 'google' | 'twitter' | 'tiktok' | 'other',
        date,
        investment: totalInvestment,
        revenue: totalRevenue,
        sales: totalSales,
        cpa: totalSales > 0 ? totalInvestment / totalSales : null,
        manager: manager || null,
        notes: `Importado via planilha (${parsedData.campaigns.length} campanhas)`,
      });

      // Insert campaigns
      await bulkInsertCampaigns.mutateAsync(
        parsedData.campaigns.map(c => ({
          ad_performance_id: adRecord.id,
          campaign_name: c.campaign_name,
          status: c.status || null,
          budget: c.budget || null,
          sales: c.sales,
          cpa: c.cpa,
          spend: c.spend,
          revenue: c.revenue,
          profit: c.profit,
          roas: c.roas,
          margin: c.margin || null,
          impressions: c.impressions,
          clicks: c.clicks,
          ctr: c.ctr || null,
          cpc: c.cpc,
          cpm: c.cpm,
          hook: c.hook || null,
          frequency: c.frequency || null,
          conv_checkout: c.conv_checkout || null,
          conv_body: c.conv_body || null,
          rejected_sales: c.rejected_sales,
          ic: c.ic,
          cpi: c.cpi,
        }))
      );

      await createAuditLog.mutateAsync({
        action: 'create',
        entityType: 'ad_performance',
        entityId: adRecord.id,
        entityName: `CSV Import - ${platform} - ${date}`,
      });

      toast({ title: `${parsedData.campaigns.length} campanhas importadas com sucesso!` });
      handleClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao importar', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setPlatform('meta');
    setDate(new Date().toISOString().split('T')[0]);
    setManager('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Planilha
          </DialogTitle>
          <DialogDescription>
            Faça upload de um CSV exportado do UTMify ou similar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div>
            <Label>Arquivo CSV</Label>
            <div
              className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setParsedData(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Clique para selecionar o arquivo CSV</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>

          {parsedData && parsedData.campaigns.length > 0 && (
            <>
              <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm">
                <p className="font-medium text-foreground">
                  {parsedData.campaigns.length} campanhas encontradas
                </p>
                {parsedData.summary && (
                  <p className="text-muted-foreground mt-1">
                    Total: R$ {parsedData.summary.spend.toLocaleString('pt-BR')} investidos · 
                    R$ {parsedData.summary.revenue.toLocaleString('pt-BR')} faturamento · 
                    {parsedData.summary.sales} vendas
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meta">Meta Ads</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="tiktok">TikTok Ads</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data</Label>
                  <DateInput value={date} onChange={setDate} className="mt-1" />
                </div>
              </div>

              <div>
                <Label>Gestor de Tráfego</Label>
                <Input
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Nome do gestor"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!parsedData || parsedData.campaigns.length === 0 || isSubmitting}
            className="gradient-primary text-primary-foreground"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Importar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
