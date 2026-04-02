import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROUTES } from '../utils/adminRoutes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_ROUTES.login} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
