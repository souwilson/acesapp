import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useAllowedUsers, AppRole } from '@/hooks/useAllowedUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Shield, ShieldCheck, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

const emailSchema = z.string().email('E-mail inválido').max(255, 'E-mail muito longo');

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  viewer: 'Visualizador',
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <ShieldCheck className="w-4 h-4" />,
  manager: <Shield className="w-4 h-4" />,
  viewer: <Eye className="w-4 h-4" />,
};

const roleBadgeVariants: Record<AppRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  viewer: 'outline',
};

export default function AllowedUsers() {
  const { allowedUsers, isLoading, addUser, updateUser, deleteUser } = useAllowedUsers();
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('viewer');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const validation = emailSchema.safeParse(newEmail);
    if (!validation.success) {
      setEmailError(validation.error.errors[0].message);
      return;
    }

    await addUser.mutateAsync({ email: newEmail, role: newRole });
    setNewEmail('');
    setNewRole('viewer');
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateUser.mutateAsync({ id, active: !currentActive });
  };

  const handleRoleChange = async (id: string, role: AppRole) => {
    await updateUser.mutateAsync({ id, role });
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUser.mutateAsync(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const currentUserEmail = user?.email?.toLowerCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários Permitidos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie quem pode acessar o sistema (whitelist)
          </p>
        </div>

        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Usuário</CardTitle>
            <CardDescription>
              Adicione um e-mail à whitelist para permitir acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={emailError ? 'border-destructive' : ''}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={addUser.isPending}>
                  {addUser.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <CardDescription>
              {allowedUsers.length} usuário(s) na whitelist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allowedUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário na whitelist
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allowedUsers.map((allowedUser) => {
                    const isCurrentUser = allowedUser.email === currentUserEmail;
                    
                    return (
                      <TableRow key={allowedUser.id}>
                        <TableCell className="font-medium">
                          {allowedUser.email}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">Você</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={allowedUser.role}
                            onValueChange={(v) => handleRoleChange(allowedUser.id, v as AppRole)}
                            disabled={isCurrentUser}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  {roleIcons[allowedUser.role]}
                                  {roleLabels[allowedUser.role]}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  {roleIcons.viewer} Visualizador
                                </div>
                              </SelectItem>
                              <SelectItem value="manager">
                                <div className="flex items-center gap-2">
                                  {roleIcons.manager} Gerente
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  {roleIcons.admin} Administrador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={allowedUser.active}
                              onCheckedChange={() => handleToggleActive(allowedUser.id, allowedUser.active)}
                              disabled={isCurrentUser}
                            />
                            <Badge variant={allowedUser.active ? 'default' : 'secondary'}>
                              {allowedUser.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(allowedUser.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(allowedUser.id)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? 'Você não pode remover a si mesmo' : 'Remover usuário'}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permissões por Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Administrador</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Acesso total ao sistema</li>
                  <li>• Gerenciar whitelist</li>
                  <li>• Ver logs de acesso</li>
                  <li>• Criar, editar e excluir dados</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                  <h3 className="font-semibold">Gerente</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visualizar todos os dados</li>
                  <li>• Criar e editar dados</li>
                  <li>• Não pode excluir dados</li>
                  <li>• Não pode gerenciar usuários</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Visualizador</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Somente leitura</li>
                  <li>• Visualizar dashboards</li>
                  <li>• Visualizar relatórios</li>
                  <li>• Não pode modificar dados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Remover usuário"
        description="Tem certeza que deseja remover este usuário da whitelist? Ele perderá acesso ao sistema imediatamente."
        isLoading={deleteUser.isPending}
      />
    </DashboardLayout>
  );
}
