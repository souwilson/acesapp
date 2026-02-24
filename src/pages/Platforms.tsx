import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Wallet, Building2, CreditCard, Bitcoin, Smartphone, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
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
import { usePlatforms, useDeletePlatform, Platform } from '@/hooks/usePlatforms';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { PlatformFormDialog } from '@/components/forms/PlatformFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

const platformTypeLabels: Record<string, string> = {
  bank: 'Banco',
  gateway: 'Gateway',
  exchange: 'Exchange',
  digital: 'Plataforma Digital',
};

const typeIcons = {
  bank: Building2,
  gateway: CreditCard,
  exchange: Bitcoin,
  digital: Smartphone,
};

const Platforms = () => {
  const { data: platforms = [], isLoading } = usePlatforms();
  const deletePlatform = useDeletePlatform();
  const createAuditLog = useCreateAuditLog();
  
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null);

  const filteredPlatforms = platforms.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCurrency = currencyFilter === 'all' || p.currency === currencyFilter;
    return matchesSearch && matchesCurrency;
  });

  const totalByBRL = platforms
    .filter((p) => p.currency === 'BRL')
    .reduce((sum, p) => sum + Number(p.balance), 0);

  const totalByUSD = platforms
    .filter((p) => p.currency === 'USD' || p.currency === 'USDT')
    .reduce((sum, p) => sum + Number(p.balance), 0);

  const currencies = [...new Set(platforms.map((p) => p.currency))];

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormOpen(true);
  };

  const handleDelete = (platform: Platform) => {
    setPlatformToDelete(platform);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (platformToDelete) {
      await deletePlatform.mutateAsync(platformToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'platforms',
        entityId: platformToDelete.id,
        entityName: platformToDelete.name,
        oldValues: platformToDelete as unknown as import('@/integrations/supabase/types').Json,
      });
      setDeleteDialogOpen(false);
      setPlatformToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingPlatform(null);
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
          <h1 className="text-3xl font-bold text-foreground">Gestão de Caixa</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas plataformas financeiras
          </p>
        </div>
        <Button 
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Plataforma
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total em BRL</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalByBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total em USD/USDT</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            $ {totalByUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Plataformas Ativas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{platforms.length}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plataforma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filtrar moeda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as moedas</SelectItem>
            {currencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPlatforms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {platforms.length === 0 ? 'Nenhuma plataforma cadastrada ainda.' : 'Nenhuma plataforma encontrada.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Plataforma</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
                <TableHead className="text-muted-foreground">Moeda</TableHead>
                <TableHead className="text-muted-foreground">Atualizado</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlatforms.map((platform) => {
                const Icon = typeIcons[platform.type as keyof typeof typeIcons] || Building2;
                return (
                  <TableRow key={platform.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">{platform.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                        {platformTypeLabels[platform.type] || platform.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-foreground">
                      {platform.currency === 'BRL' ? 'R$ ' : '$ '}
                      {Number(platform.balance).toLocaleString(platform.currency === 'BRL' ? 'pt-BR' : 'en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-border',
                          platform.currency === 'BRL' && 'border-success/30 text-success',
                          platform.currency === 'USD' && 'border-primary/30 text-primary',
                          platform.currency === 'USDT' && 'border-warning/30 text-warning'
                        )}
                      >
                        {platform.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(platform.updated_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(platform)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(platform)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <PlatformFormDialog 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        platform={editingPlatform} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir plataforma"
        description={`Tem certeza que deseja excluir "${platformToDelete?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deletePlatform.isPending}
      />
    </DashboardLayout>
  );
};

export default Platforms;
