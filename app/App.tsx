import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useAuth } from '../features/auth';
import { AuthProvider, ThemeProvider, SubscriptionProvider } from './providers';
import { Spinner } from '../shared/ui/spinner';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const SymbolsPage = lazy(() => import('../pages/SymbolsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const TicketsPage = lazy(() => import('../pages/TicketsPage'));

type Page = 'symbols' | 'settings' | 'tickets';

const AppContent: React.FC = () => {
  const { acsToken } = useAuth();
  const [page, setPage] = useState<Page>('symbols');
  const prevTokenRef = useRef<string | null>(null);

  // Сбрасываем страницу на 'symbols' только при логине или разлогинивании
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    const currentToken = acsToken;

    // Если токен изменился (логин или разлогинивание), сбрасываем страницу
    if (prevToken !== currentToken) {
      if (currentToken && !prevToken) {
        // Логин: переходим на страницу символов
        setPage('symbols');
      } else if (!currentToken && prevToken) {
        // Разлогинивание: сбрасываем страницу
        setPage('symbols');
      }
      prevTokenRef.current = currentToken;
    }
  }, [acsToken]);

  if (!acsToken) {
    return <LoginPage />;
  }

  return (
    <SubscriptionProvider>
      {page === 'symbols' && <SymbolsPage navigateTo={setPage} />}
      {page === 'settings' && <SettingsPage navigateTo={setPage} />}
      {page === 'tickets' && <TicketsPage navigateTo={setPage} />}
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

