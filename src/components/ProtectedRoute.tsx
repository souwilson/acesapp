import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { checkIsAllowed } from '@/hooks/useLoginAudit';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEditor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireEditor }: ProtectedRouteProps) {
  const { user, loading, role, isAdmin, canEdit, signOut } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!user?.email) {
        setVerifying(false);
        setAllowed(false);
        return;
      }

      // Double-check whitelist on every protected route access (defense in depth)
      const isAllowed = await checkIsAllowed(user.email);
      
      if (!isAllowed) {
        // User was removed from whitelist or deactivated - force sign out
        await signOut();
        setAllowed(false);
      } else {
        setAllowed(true);
      }
      
      setVerifying(false);
    };

    if (!loading && user) {
      verifyAccess();
    } else if (!loading) {
      setVerifying(false);
    }
  }, [user, loading, signOut]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !allowed) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireEditor && !canEdit) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
