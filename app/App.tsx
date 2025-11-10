import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '../features/auth';
import { AuthProvider, ThemeProvider, SubscriptionProvider } from './providers';
import { Spinner } from '../shared/ui/spinner';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const SymbolsPage = lazy(() => import('../pages/SymbolsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

type Page = 'symbols' | 'settings';

const AppContent: React.FC = () => {
  const { acsToken } = useAuth();
  const [page, setPage] = useState<Page>('symbols');

  if (!acsToken) {
    return <LoginPage />;
  }

  return (
    <SubscriptionProvider>
      {page === 'symbols' && <SymbolsPage navigateTo={setPage} />}
      {page === 'settings' && <SettingsPage navigateTo={setPage} />}
    </SubscriptionProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="authPage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="lg" />
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
};

