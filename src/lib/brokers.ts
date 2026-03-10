// Multi-broker trading infrastructure

export type BrokerId = 'alpaca' | 'ibkr' | 'trading212' | 'binance' | 'coinbase' | 'oanda' | 'ig';

export interface BrokerConfig {
  id: BrokerId;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  paperTrading: boolean;
}

export interface BrokerAccount {
  brokerId: BrokerId;
  balance: number;
  currency: string;
  buyingPower: number;
  status: 'active' | 'paper' | 'error';
}

export interface BrokerPosition {
  brokerId: BrokerId;
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface BrokerOrder {
  brokerId: BrokerId;
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQty?: number;
  filledPrice?: number;
}

// Broker API base URLs
export const BROKER_URLS: Record<BrokerId, { paper: string; live: string }> = {
  alpaca: {
    paper: 'https://paper-api.alpaca.markets/v2',
    live: 'https://api.alpaca.markets/v2',
  },
  ibkr: {
    paper: 'https://localhost:5000/v1/api', // IBKR runs locally
    live: 'https://localhost:5000/v1/api',
  },
  trading212: {
    paper: 'https://demo.trading212.com/api/v0',
    live: 'https://live.trading212.com/api/v0',
  },
  binance: {
    paper: 'https://testnet.binance.vision/api/v3',
    live: 'https://api.binance.com/api/v3',
  },
  coinbase: {
    paper: 'https://api-public.sandbox.exchange.coinbase.com',
    live: 'https://api.exchange.coinbase.com',
  },
  oanda: {
    paper: 'https://api-fxpractice.oanda.com/v3',
    live: 'https://api-fxtrade.oanda.com/v3',
  },
  ig: {
    paper: 'https://demo-api.ig.com/gateway/deal',
    live: 'https://api.ig.com/gateway/deal',
  },
};

// Broker market support
export const BROKER_MARKETS: Record<BrokerId, string[]> = {
  alpaca: ['US Stocks', 'Crypto'],
  ibkr: ['US Stocks', 'UK Stocks', 'EU Stocks', 'Forex', 'Options', 'Futures', 'Commodities'],
  trading212: ['US Stocks', 'UK Stocks', 'EU Stocks', 'ETFs'],
  binance: ['Crypto', 'Crypto Futures'],
  coinbase: ['Crypto'],
  oanda: ['Forex', 'CFDs'],
  ig: ['Forex', 'Indices', 'Commodities', 'Stocks CFD', 'Crypto'],
};

// Helper to route orders to correct broker
export function getBrokerForMarket(market: string): BrokerId[] {
  const brokers: BrokerId[] = [];
  for (const [brokerId, markets] of Object.entries(BROKER_MARKETS)) {
    if (markets.includes(market)) {
      brokers.push(brokerId as BrokerId);
    }
  }
  return brokers;
}

// Symbol format converters
export const symbolConverters: Record<BrokerId, (symbol: string) => string> = {
  alpaca: (s) => s.replace('/', ''), // BTCUSD
  ibkr: (s) => s, // Pass through
  trading212: (s) => s,
  binance: (s) => s.replace('/', ''), // BTCUSDT
  coinbase: (s) => s.replace('/', '-'), // BTC-USD
  oanda: (s) => s.replace('/', '_'), // EUR_USD
  ig: (s) => s,
};
