import { useState, useEffect, useRef, useMemo } from 'react';
import { Quote } from '../../../entities/quote/model/types';
import { subscribeToQuotes } from '../../../entities/quote/api/quoteApi';

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const cleanupRef = useRef<(() => void) | null>(null);
  const currentSymbolsRef = useRef<string>('');
  
  // Мемоизируем строковое представление символов для сравнения
  const symbolsKey = useMemo(() => [...symbols].sort().join(','), [symbols]);

  useEffect(() => {
    // Если символы не изменились, не открываем новое соединение
    if (currentSymbolsRef.current === symbolsKey) {
      return;
    }

    // Закрываем предыдущее соединение, если оно есть
    if (cleanupRef.current) {
      console.log('Closing previous quotes WebSocket connection');
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (symbols.length === 0) {
      currentSymbolsRef.current = '';
      setQuotes({});
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }

    // Сохраняем текущие символы
    currentSymbolsRef.current = symbolsKey;

    console.log('Opening WebSocket connection for quotes with symbols:', symbols);
    const cleanup = subscribeToQuotes(
      symbols,
      (quote) => {
        console.log('Received quote for symbol:', quote.symbol);
        setQuotes((prevQuotes) => ({
          ...prevQuotes,
          [quote.symbol]: quote,
        }));
      },
      (error) => {
        console.error('Quotes WebSocket error:', error);
      }
    );

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        console.log('Cleaning up quotes WebSocket connection');
        cleanupRef.current();
        cleanupRef.current = null;
      }
      currentSymbolsRef.current = '';
    };
  }, [symbols, symbolsKey]);

  return quotes;
}

