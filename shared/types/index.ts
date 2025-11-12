export interface AuthResponse {
  acsToken: string;
  acsTokenExpire: string;
  utipToken?: string;
  woToken?: string;
  acsUserId: number;
  result: string;
}

export interface SymbolData {
  Symbol: string;
  Group: string;
  Description: string;
  SwapShort: number;
  SwapLong: number;
  ContractSize: number;
  Currency: string;
}

export interface QuoteDetails {
  symbol: string;
  bid: string;
  ask: string;
  date: string;
  ExchangeName: string;
}

