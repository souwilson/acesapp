import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Wrench,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  History,
  LogOut,
  ArrowDownLeft,
  ShieldCheck,
  FileText,
  Settings,
  Menu,
  X,
  Receipt,
  Landmark,
} from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/platforms', icon: Wallet, label: 'Plataformas' },
  { to: '/tools', icon: Wrench, label: 'Despesas Fixas' },
  { to: '/variable-expenses', icon: Receipt, label: 'Despesas Variáveis' },
  { to: '/team', icon: Users, label: 'Colaboradores' },
  { to: '/ads', icon: BarChart3, label: 'Ads & Performance' },
  { to: '/withdrawals', icon: ArrowDownLeft, label: 'Retiradas' },
  { to: '/taxes', icon: Landmark, label: 'Impostos' },
  { to: '/history', icon: History, label: 'Histórico' },
];

const adminNavItems = [
  { to: '/allowed-users', icon: ShieldCheck, label: 'Usuários Permitidos' },
  { to: '/access-logs', icon: FileText, label: 'Logs de Acesso' },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Gerente',
  viewer: 'Viewer',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, isAdmin, signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="AcesofScale" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-bold text-lg text-foreground">AcesofScale</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop only, or mobile when open */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
          // Mobile: hidden by default, shown when mobileOpen
          "max-lg:w-[280px]",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          // Desktop: always visible, width based on collapsed state
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        )}
      >
        {/* Logo - Hidden on mobile (shown in mobile header) */}
        <div className="h-16 hidden lg:flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="AcesofScale" className="w-10 h-10 rounded-xl object-contain" />
            {!collapsed && (
              <span className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden">
                AcesofScale
              </span>
            )}
          </div>
        </div>

        {/* Spacer for mobile header */}
        <div className="h-16 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 py-4 lg:py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-sidebar-accent text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
              )}
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
              {(!collapsed || mobileOpen) && (
                <span className="font-medium whitespace-nowrap overflow-hidden lg:block">
                  {item.label}
                </span>
              )}
              {collapsed && !mobileOpen && (
                <span className="hidden">{item.label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            {(!collapsed || mobileOpen) && (
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administração
                </span>
              </div>
            )}
            
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                  )}
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                  {(!collapsed || mobileOpen) && (
                    <span className="font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* User & Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* User Info */}
        {(!collapsed || mobileOpen) && profile && (
          <div className="px-3 py-2">
            <span className="text-foreground font-medium block">{profile.name}</span>
            {role && (
              <Badge variant="outline" className="mt-1 text-xs">
                {roleLabels[role] || role}
              </Badge>
            )}
          </div>
        )}

        {/* Settings/Profile */}
        <NavLink
          to="/profile"
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            location.pathname === '/profile'
              ? 'bg-sidebar-accent text-primary'
              : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5" />
          {(!collapsed || mobileOpen) && (
            <span className="text-sm whitespace-nowrap overflow-hidden">
              Configurações
            </span>
          )}
        </NavLink>
        
        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || mobileOpen) && (
            <span className="text-sm whitespace-nowrap overflow-hidden">
              Sair
            </span>
          )}
        </button>

        {/* Collapse Toggle - Hidden on mobile */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
      </aside>
    </>
  );
}
