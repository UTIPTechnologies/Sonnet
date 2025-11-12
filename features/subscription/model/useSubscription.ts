import { useState, useEffect, useCallback } from 'react';
import { SymbolData } from '../../../shared/types';
import { fetchSymbols, MOCK_SYMBOLS } from '../../../entities/symbol/api/symbolApi';
import { storage } from '../../../shared/lib/storage';

const SYMBOLS_CACHE_KEY = 'symbols-list';
const SUBSCRIPTIONS_KEY = 'subscribed-symbols';

export function useSubscription(token: string | null) {
  const [allSymbols, setAllSymbols] = useState<SymbolData[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const cachedSymbols = storage.get<SymbolData[]>(SYMBOLS_CACHE_KEY);
      if (cachedSymbols) {
        setAllSymbols(cachedSymbols);
        setIsLoading(false);
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
    if (!token) {
      // Если токен отсутствует (разлогинились), очищаем состояние
      setAllSymbols([]);
      setSubscribedSymbols([]);
      setIsLoading(false);
      setError(null);
      // Возвращаем пустую функцию cleanup - предыдущий cleanup уже вызван React'ом
      return () => {};
    }

    const cleanup = fetchSymbols(
      token,
      (symbolList) => {
        setAllSymbols(symbolList);
        storage.set(SYMBOLS_CACHE_KEY, symbolList);
        setError(null);
        setIsLoading(false);

        const cachedSubscriptions = storage.get<string[]>(SUBSCRIPTIONS_KEY);
        if (!cachedSubscriptions && symbolList.length > 0) {
          console.log('Setting default subscriptions...');
          const defaultSubscriptions = symbolList.slice(0, 5).map(s => s.Symbol);
          setSubscribedSymbols(defaultSubscriptions);
          storage.set(SUBSCRIPTIONS_KEY, defaultSubscriptions);
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        if (allSymbols.length === 0) {
          setAllSymbols(MOCK_SYMBOLS);
          storage.set(SYMBOLS_CACHE_KEY, MOCK_SYMBOLS);
          const cachedSubscriptions = storage.get<string[]>(SUBSCRIPTIONS_KEY);
          if (!cachedSubscriptions) {
            const defaultSubscriptions = MOCK_SYMBOLS.slice(0, 5).map(s => s.Symbol);
            setSubscribedSymbols(defaultSubscriptions);
            storage.set(SUBSCRIPTIONS_KEY, defaultSubscriptions);
          }
        }
        setIsLoading(false);
      }
    );

    return cleanup;
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

  return {
    allSymbols,
    subscribedSymbols,
    toggleSubscription,
    isSubscribed,
    isLoading,
    error,
  };
}

