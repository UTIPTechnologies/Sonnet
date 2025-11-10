import { SymbolData } from '../../../shared/types';
import { WebSocketClient } from '../../../shared/lib/api/websocket';

export const MOCK_SYMBOLS: SymbolData[] = [
  { Symbol: 'EURUSD', Group: 'Forex', Description: 'Euro vs US Dollar', SwapShort: -0.8, SwapLong: -0.7, ContractSize: 100000, Currency: 'USD' },
  { Symbol: 'USDJPY', Group: 'Forex', Description: 'US Dollar vs Japanese Yen', SwapShort: -0.4, SwapLong: -0.3, ContractSize: 100000, Currency: 'JPY' },
  { Symbol: 'GBPUSD', Group: 'Forex', Description: 'British Pound vs US Dollar', SwapShort: -0.6, SwapLong: -0.5, ContractSize: 100000, Currency: 'USD' },
  { Symbol: 'BTCUSD', Group: 'Crypto', Description: 'Bitcoin vs US Dollar', SwapShort: -25.0, SwapLong: -22.5, ContractSize: 1, Currency: 'USD' },
  { Symbol: 'ETHUSD', Group: 'Crypto', Description: 'Ethereum vs US Dollar', SwapShort: -1.5, SwapLong: -1.2, ContractSize: 1, Currency: 'USD' },
];

export function fetchSymbols(
  token: string,
  onSymbols: (symbols: SymbolData[]) => void,
  onError: (error: string) => void
): () => void {
  const ws = new WebSocketClient(`wss://dev-virt-point.utip.work/session/${token}?fragment=1`);
  let messageReceived = false;

  ws.connect(
    (data) => {
      if (data && data.msgType === 'symbols' && Array.isArray(data.symbolsArray)) {
        messageReceived = true;
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
      onError('Symbol connection error.');
    },
    () => {
      if (!messageReceived) {
        onError('Could not fetch symbols. Using mock data.');
        onSymbols(MOCK_SYMBOLS);
      }
    }
  );

  ws.send({ commandCode: '2088', notSendQuotes: '1' });

  return () => {
    ws.close();
  };
}

