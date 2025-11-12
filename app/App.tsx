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
  const isInitialMountRef = useRef<boolean>(true);

  // Редирект на страницу символов при нажатии на кнопку Sign In (через флаг в localStorage)
  // Важно: проверяем флаг только при изменении токена с null на значение (новый логин),
  // но не при первой загрузке токена из localStorage
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    const currentToken = acsToken;

    // Пропускаем первую загрузку (когда токен загружается из localStorage)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevTokenRef.current = currentToken;
      return;
    }

    // Проверяем флаг только при переходе от null к токену (новый логин через LoginPage)
    if (currentToken && !prevToken) {
      const shouldRedirect = localStorage.getItem('shouldRedirectToSymbols');
      if (shouldRedirect === 'true') {
        setPage('symbols');
        localStorage.removeItem('shouldRedirectToSymbols');
      }
    }

    prevTokenRef.current = currentToken;
  }, [acsToken]);

  // Редирект на страницу символов при разлогинивании
  useEffect(() => {
    const prevToken = prevTokenRef.current;
    const currentToken = acsToken;

    if (prevToken !== currentToken) {
      if (!currentToken && prevToken) {
        // Разлогинивание: сбрасываем страницу
        setPage('symbols');
      }
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

