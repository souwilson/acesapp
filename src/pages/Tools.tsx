import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
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
import { useTools, useDeleteTool, Tool } from '@/hooks/useTools';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { ToolFormDialog } from '@/components/forms/ToolFormDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

const toolCategoryLabels: Record<string, string> = {
  ads: 'Ads',
  infra: 'Infra',
  design: 'Design',
  ai: 'IA',
  crm: 'CRM',
  other: 'Outros',
};

const categoryColors: Record<string, string> = {
  ads: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
  infra: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  design: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  ai: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
  crm: 'bg-chart-5/10 text-chart-5 border-chart-5/30',
  other: 'bg-muted text-muted-foreground border-border',
};

const Tools = () => {
  const { data: tools = [], isLoading } = useTools();
  const deleteTool = useDeleteTool();
  const createAuditLog = useCreateAuditLog();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  const filteredTools = tools.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalMonthlyCost = tools
    .filter((t) => t.status === 'active')
    .reduce((sum, t) => sum + Number(t.monthly_value) * (t.currency === 'BRL' ? 1 : 5.5), 0);

  const upcomingDue = tools.filter((t) => {
    const dueDate = new Date(t.due_date);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0 && t.status === 'active';
  });

  const categories = Object.keys(toolCategoryLabels);

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormOpen(true);
  };

  const handleDelete = (tool: Tool) => {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (toolToDelete) {
      await deleteTool.mutateAsync(toolToDelete.id);
      await createAuditLog.mutateAsync({
        action: 'delete',
        entityType: 'tools',
        entityId: toolToDelete.id,
        entityName: toolToDelete.name,
        oldValues: toolToDelete as unknown as import('@/integrations/supabase/types').Json,
      });
      setDeleteDialogOpen(false);
      setToolToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTool(null);
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
          <h1 className="text-3xl font-bold text-foreground">Gestão de Ferramentas</h1>
          <p className="text-muted-foreground mt-1">
            Controle de subscriptions e custos fixos
          </p>
        </div>
        <Button 
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Ferramenta
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
          <p className="text-sm font-medium text-muted-foreground mb-2">Custo Mensal Total</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {totalMonthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {tools.filter((t) => t.status === 'active').length} ferramentas ativas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-warning/20 bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm font-medium text-muted-foreground">Vencimentos Próximos</p>
          </div>
          <p className="text-2xl font-bold text-warning">{upcomingDue.length}</p>
          <p className="text-sm text-muted-foreground mt-1">nos próximos 7 dias</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Ferramentas</p>
          <p className="text-2xl font-bold text-foreground">{tools.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {tools.filter((t) => t.status === 'cancelled').length} canceladas
          </p>
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
            placeholder="Buscar ferramenta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Filtrar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {toolCategoryLabels[cat]}
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
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {tools.length === 0 ? 'Nenhuma ferramenta cadastrada ainda.' : 'Nenhuma ferramenta encontrada.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Ferramenta</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor Mensal</TableHead>
                <TableHead className="text-muted-foreground">Vencimento</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id} className="border-border">
                  <TableCell className="font-medium text-foreground">{tool.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', categoryColors[tool.category])}>
                      {toolCategoryLabels[tool.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-foreground">
                    {tool.currency === 'BRL' ? 'R$ ' : '$ '}
                    {Number(tool.monthly_value).toLocaleString(tool.currency === 'BRL' ? 'pt-BR' : 'en-US')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'flex items-center gap-2',
                        isDueSoon(tool.due_date) && 'text-warning'
                      )}
                    >
                      {isDueSoon(tool.due_date) && <AlertCircle className="w-4 h-4" />}
                      {new Date(tool.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        tool.status === 'active'
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                      )}
                    >
                      {tool.status === 'active' ? 'Ativa' : 'Cancelada'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(tool)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(tool)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <ToolFormDialog 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        tool={editingTool} 
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir ferramenta"
        description={`Tem certeza que deseja excluir "${toolToDelete?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteTool.isPending}
      />
    </DashboardLayout>
  );
};

export default Tools;
