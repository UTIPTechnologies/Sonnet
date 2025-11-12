import { SymbolData } from '../../../shared/types';
import { WebSocketClient } from '../../../shared/lib/api/websocket';

export const MOCK_SYMBOLS: SymbolData[] = [
  { Symbol: 'EURUSD', Group: 'Forex', Description: 'Euro vs US Dollar', SwapShort: -0.8, SwapLong: -0.7, ContractSize: 100000, Currency: 'USD' },
  { Symbol: 'USDJPY', Group: 'Forex', Description: 'US Dollar vs Japanese Yen', SwapShort: -0.4, SwapLong: -0.3, ContractSize: 100000, Currency: 'JPY' },
  { Symbol: 'GBPUSD', Group: 'Forex', Description: 'British Pound vs US Dollar', SwapShort: -0.6, SwapLong: -0.5, ContractSize: 100000, Currency: 'USD' },
  { Symbol: 'AUDUSD', Group: 'Forex', Description: 'Australian Dollar vs US Dollar', SwapShort: -0.5, SwapLong: -0.4, ContractSize: 100000, Currency: 'USD' },
  { Symbol: 'USDCAD', Group: 'Forex', Description: 'US Dollar vs Canadian Dollar', SwapShort: -0.3, SwapLong: -0.2, ContractSize: 100000, Currency: 'CAD' },
  { Symbol: 'EURGBP', Group: 'Forex', Description: 'Euro vs British Pound', SwapShort: -0.4, SwapLong: -0.3, ContractSize: 100000, Currency: 'GBP' },
  { Symbol: 'BTCUSD', Group: 'Crypto', Description: 'Bitcoin vs US Dollar', SwapShort: -25.0, SwapLong: -22.5, ContractSize: 1, Currency: 'USD' },
  { Symbol: 'ETHUSD', Group: 'Crypto', Description: 'Ethereum vs US Dollar', SwapShort: -1.5, SwapLong: -1.2, ContractSize: 1, Currency: 'USD' },
  { Symbol: 'XAUUSD', Group: 'Metals', Description: 'Gold vs US Dollar', SwapShort: -2.5, SwapLong: -2.0, ContractSize: 100, Currency: 'USD' },
  { Symbol: 'XAGUSD', Group: 'Metals', Description: 'Silver vs US Dollar', SwapShort: -0.15, SwapLong: -0.12, ContractSize: 5000, Currency: 'USD' },
];

export function fetchSymbols(
  token: string,
  onSymbols: (symbols: SymbolData[]) => void,
  onError: (error: string) => void
): () => void {
  const ws = new WebSocketClient(`wss://dev-virt-point.utip.work/session/${token}?fragment=1`);
  let messageReceived = false;
  let timeoutId: NodeJS.Timeout | null = null;
  let isCleanedUp = false;

  // Таймаут на 10 секунд
  timeoutId = setTimeout(() => {
    if (!messageReceived && !isCleanedUp) {
      console.warn('Symbols not received within 10 seconds, using mock data');
      isCleanedUp = true;
      ws.close();
      // Сначала устанавливаем мок данные, затем сообщаем об ошибке
      onSymbols(MOCK_SYMBOLS);
      onError('Symbols not received within timeout. Using mock data.');
    }
  }, 10000);

  ws.connect(
    (data) => {
      if (data && data.msgType === 'symbols' && Array.isArray(data.symbolsArray)) {
        messageReceived = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        const symbolList: SymbolData[] = data.symbolsArray.map((s: any) => ({
          Symbol: s.symbolName,
          Description: s.Description || `${s.symbolName} description`,
          Group: s.Group || 'N/A',
          SwapShort: s.SwapShort || 0,
          SwapLong: s.SwapLong || 0,
          ContractSize: s.ContractSize || 0,
          Currency: s.Currency || 'N/A',
        }));
        onSymbols(symbolList);
      }
    },
    () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (!messageReceived && !isCleanedUp) {
        isCleanedUp = true;
        onError('Symbol connection error. Using mock data.');
        onSymbols(MOCK_SYMBOLS);
      }
    },
    () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (!messageReceived && !isCleanedUp) {
        onError('Could not fetch symbols. Using mock data.');
        onSymbols(MOCK_SYMBOLS);
      }
    },
    () => {
      // Отправляем команду только после открытия соединения
      ws.send({ commandCode: '2088', notSendQuotes: '1' });
    }
  );

  return () => {
    isCleanedUp = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    ws.close();
  };
}

