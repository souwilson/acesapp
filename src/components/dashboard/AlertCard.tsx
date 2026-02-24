import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  canDismiss?: boolean;
}

interface AlertCardProps {
  alerts: Alert[];
  className?: string;
  onDismiss?: (alertId: string) => void;
  isDismissing?: boolean;
}

const alertStyles = {
  warning: {
    bg: 'bg-warning/5 border-warning/20',
    icon: Clock,
    iconColor: 'text-warning',
  },
  critical: {
    bg: 'bg-destructive/5 border-destructive/20',
    icon: AlertTriangle,
    iconColor: 'text-destructive',
  },
  info: {
    bg: 'bg-primary/5 border-primary/20',
    icon: TrendingDown,
    iconColor: 'text-primary',
  },
};

export function AlertCard({ alerts, className, onDismiss, isDismissing }: AlertCardProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-warning" />
        Alertas
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                style.bg
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              {alert.canDismiss && onDismiss && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDismiss(alert.id)}
                  disabled={isDismissing}
                  className="flex-shrink-0 gap-1.5 text-success border-success/30 hover:bg-success/10 hover:text-success"
                >
                  <Check className="w-4 h-4" />
                  Pago
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

