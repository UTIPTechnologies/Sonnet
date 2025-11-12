import React, { ReactNode, createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { SymbolData } from '../../shared/types';
import { fetchSymbols, MOCK_SYMBOLS } from '../../entities/symbol/api/symbolApi';
import { storage } from '../../shared/lib/storage';
import { useAuth } from '../../features/auth';

const SYMBOLS_CACHE_KEY = 'symbols-list';
const SUBSCRIPTIONS_KEY = 'subscribed-symbols';

interface SubscriptionContextType {
  allSymbols: SymbolData[];
  subscribedSymbols: string[];
  toggleSubscription: (symbolName: string) => void;
  isSubscribed: (symbolName: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { utipToken, acsToken } = useAuth();
  const token = useMemo(() => utipToken || acsToken || null, [utipToken, acsToken]);
  const [allSymbols, setAllSymbols] = useState<SymbolData[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const connectionTokenRef = useRef<string | null>(null); // Токен, с которым открыто текущее соединение

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const cachedSymbols = storage.get<SymbolData[]>(SYMBOLS_CACHE_KEY);
      if (cachedSymbols && cachedSymbols.length > 0) {
        setAllSymbols(cachedSymbols);
        // Не устанавливаем isLoading в false здесь, чтобы дать возможность WebSocket обновить данные
        // isLoading будет установлен в false после получения данных или таймаута
      }
      const cachedSubscriptions = storage.get<string[]>(SUBSCRIPTIONS_KEY);
      if (cachedSubscriptions) {
        setSubscribedSymbols(cachedSubscriptions);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // Fetch all symbols from WebSocket
  useEffect(() => {
    // Если соединение уже открыто для этого токена, не открываем новое
    if (connectionTokenRef.current === token && cleanupRef.current) {
      return () => {
        // В StrictMode cleanup вызывается, но соединение уже открыто для этого токена
        // Не закрываем его, если токен не изменился
      };
    }

    // Закрываем предыдущее соединение, если оно есть
    if (cleanupRef.current) {
      console.log('Closing previous WebSocket connection');
      cleanupRef.current();
      cleanupRef.current = null;
      connectionTokenRef.current = null;
    }

    if (!token) {
      // Если токен отсутствует (разлогинились), очищаем состояние
      currentTokenRef.current = null;
      connectionTokenRef.current = null;
      setAllSymbols([]);
      setSubscribedSymbols([]);
      setIsLoading(false);
      setError(null);
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        currentTokenRef.current = null;
        connectionTokenRef.current = null;
      };
    }

    // Сохраняем текущий токен
    currentTokenRef.current = token;
    // Сохраняем токен, с которым открываем соединение (ДО вызова fetchSymbols, чтобы предотвратить повторное открытие)
    connectionTokenRef.current = token;

    // Устанавливаем isLoading в true при открытии нового соединения, чтобы таймаут работал корректно
    setIsLoading(true);
    setError(null);

    console.log('Opening WebSocket connection for symbols with token:', token ? 'present' : 'missing');
    const cleanup = fetchSymbols(
      token,
      (symbolList) => {
        console.log('Received symbols:', symbolList.length);
        setAllSymbols(symbolList);
        storage.set(SYMBOLS_CACHE_KEY, symbolList);
        setError(null);
        setIsLoading(false);

        const cachedSubscriptions = storage.get<string[]>(SUBSCRIPTIONS_KEY);
        if (!cachedSubscriptions && symbolList.length > 0) {
          console.log('Setting default subscriptions...');
          const defaultSubscriptions = symbolList.slice(0, 10).map(s => s.Symbol);
          setSubscribedSymbols(defaultSubscriptions);
          storage.set(SUBSCRIPTIONS_KEY, defaultSubscriptions);
        }
      },
      (errorMessage) => {
        console.error('Symbols WebSocket error:', errorMessage);
        setError(errorMessage);
        // Мок данные уже должны быть установлены через onSymbols при таймауте или ошибке
        // Но если их нет (на случай, если onSymbols не был вызван), устанавливаем здесь
        setAllSymbols((prevSymbols) => {
          if (prevSymbols.length === 0) {
            console.log('No symbols available, setting mock data as fallback');
            storage.set(SYMBOLS_CACHE_KEY, MOCK_SYMBOLS);
            const cachedSubscriptions = storage.get<string[]>(SUBSCRIPTIONS_KEY);
            if (!cachedSubscriptions) {
              const defaultSubscriptions = MOCK_SYMBOLS.slice(0, 10).map(s => s.Symbol);
              setSubscribedSymbols(defaultSubscriptions);
              storage.set(SUBSCRIPTIONS_KEY, defaultSubscriptions);
            }
            return MOCK_SYMBOLS;
          }
          return prevSymbols;
        });
        setIsLoading(false);
      }
    );

    cleanupRef.current = cleanup;

    return () => {
      // Cleanup должен закрывать соединение только если токен изменился
      // В StrictMode cleanup вызывается с тем же токеном, но connectionTokenRef уже установлен
      if (cleanupRef.current) {
        // Если токен соединения отличается от текущего токена, закрываем соединение
        if (connectionTokenRef.current !== token) {
          console.log('Cleaning up WebSocket connection (token changed)');
          cleanupRef.current();
          cleanupRef.current = null;
          connectionTokenRef.current = null;
        } else {
          // В StrictMode cleanup вызывается с тем же токеном, не закрываем соединение
          console.log('Skipping cleanup (StrictMode double effect with same token)');
        }
      }
    };
  }, [token]);

  const toggleSubscription = useCallback((symbolName: string) => {
    setSubscribedSymbols((prev) => {
      const newSubscriptions = prev.includes(symbolName)
        ? prev.filter((s) => s !== symbolName)
        : [...prev, symbolName];
      storage.set(SUBSCRIPTIONS_KEY, newSubscriptions);
      return newSubscriptions;
    });
  }, []);

  const isSubscribed = useCallback(
    (symbolName: string) => {
      return subscribedSymbols.includes(symbolName);
    },
    [subscribedSymbols]
  );

  const value: SubscriptionContextType = {
    allSymbols,
    subscribedSymbols,
    toggleSubscription,
    isSubscribed,
    isLoading,
    error,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

