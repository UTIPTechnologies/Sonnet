import React, { ReactNode } from 'react';
import { useTheme } from '../../features/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useTheme();
  return <>{children}</>;
};

