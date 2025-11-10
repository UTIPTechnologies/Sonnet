import React, { ReactNode } from 'react';
import { useSubscription } from '../../features/subscription';
import { useAuth } from '../../features/auth';

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { utipToken, acsToken } = useAuth();
  const token = utipToken || acsToken || null;
  
  useSubscription(token);
  return <>{children}</>;
};

