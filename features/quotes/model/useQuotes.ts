import { useState, useEffect } from 'react';
import { Quote } from '../../../entities/quote/model/types';
import { subscribeToQuotes } from '../../../entities/quote/api/quoteApi';

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes({});
      return;
    }

    const cleanup = subscribeToQuotes(
      symbols,
      (quote) => {
        setQuotes((prevQuotes) => ({
          ...prevQuotes,
          [quote.symbol]: quote,
        }));
      },
      (error) => {
        console.error('Quotes WebSocket error:', error);
      }
    );

    return cleanup;
  }, [symbols]);

  return quotes;
}

