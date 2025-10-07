import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, restore } = useAuth();

  useEffect(() => {
    if (!user) restore();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
