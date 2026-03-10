// Real-time market data from Yahoo Finance

const YAHOO_SYMBOLS: Record<string, string> = {
  // US Stocks
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'GOOGL': 'GOOGL',
  'AMZN': 'AMZN',
  'NVDA': 'NVDA',
  'META': 'META',
  'TSLA': 'TSLA',
  'JPM': 'JPM',
  'V': 'V',
  'WMT': 'WMT',
  'JNJ': 'JNJ',
  'MA': 'MA',
  'PG': 'PG',
  'UNH': 'UNH',
  'HD': 'HD',
  'DIS': 'DIS',
  'NFLX': 'NFLX',
  'PYPL': 'PYPL',
  'INTC': 'INTC',
  'AMD': 'AMD',
  // Crypto
  'BTCUSD': 'BTC-USD',
  'ETHUSD': 'ETH-USD',
  'SOLUSD': 'SOL-USD',
  'BNBUSD': 'BNB-USD',
  'XRPUSD': 'XRP-USD',
  'ADAUSD': 'ADA-USD',
  'DOGEUSD': 'DOGE-USD',
  'DOTUSD': 'DOT-USD',
  // Indices/ETFs
  'SPY': 'SPY',
  'QQQ': 'QQQ',
  'DIA': 'DIA',
  'IWM': 'IWM',
  'VTI': 'VTI',
  // Forex
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'USDJPY=X',
  'AUDUSD': 'AUDUSD=X',
  'USDCAD': 'USDCAD=X',
  // Commodities
  'GC1!': 'GC=F',
  'CL1!': 'CL=F',
  'SI1!': 'SI=F',
  'NG1!': 'NG=F',
};

// Price cache with TTL
interface PriceCache {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const priceCache: Map<string, PriceCache> = new Map();
const CACHE_TTL = 30000; // 30 seconds

export async function fetchPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  const yahooSymbol = YAHOO_SYMBOLS[symbol] || symbol;
  
  // Check cache
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { price: cached.price, change: cached.change, changePercent: cached.changePercent };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      throw new Error('No data');
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    // Cache result
    priceCache.set(symbol, {
      price,
      change,
      changePercent,
      timestamp: Date.now()
    });

    return { price, change, changePercent };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

// Fetch multiple prices at once
export async function fetchPrices(symbols: string[]): Promise<Map<string, { price: number; change: number; changePercent: number }>> {
  const results = new Map();
  
  // Fetch in parallel, max 5 at a time
  const batches = [];
  for (let i = 0; i < symbols.length; i += 5) {
    batches.push(symbols.slice(i, i + 5));
  }

  for (const batch of batches) {
    const promises = batch.map(async (symbol) => {
      const result = await fetchPrice(symbol);
      if (result) {
        results.set(symbol, result);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// Get cached price (for immediate display)
export function getCachedPrice(symbol: string): number {
  const cached = priceCache.get(symbol);
  return cached?.price || 0;
}

// Clear cache
export function clearPriceCache() {
  priceCache.clear();
}
