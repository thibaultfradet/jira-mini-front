import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

export function AdminRoute() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
