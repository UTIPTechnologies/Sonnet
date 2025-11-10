import React, { ReactNode } from 'react';
import { useAuth } from '../../features/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};

