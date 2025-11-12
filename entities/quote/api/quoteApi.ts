import { WebSocketClient } from '../../../shared/lib/api/websocket';
import { Quote } from '../model/types';

export function subscribeToQuotes(
  symbols: string[],
  onQuote: (quote: Quote) => void,
  onError?: (error: Event) => void
): () => void {
  if (symbols.length === 0) {
    return () => {};
  }

  const ws = new WebSocketClient('wss://dev-virt-point.utip.work/session');

  ws.connect(
    (data) => {
      if (data && data.msgType === 'quote' && data.quoteDetails) {
        onQuote(data.quoteDetails);
      }
    },
    onError,
    () => {
      console.log('Quotes WebSocket connection closed');
    },
    () => {
      // Отправляем команду только после открытия соединения
      ws.send({
        requestType: 'tickers',
        symbols,
      });
    }
  );

  return () => {
    ws.close();
  };
}

