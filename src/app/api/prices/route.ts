import { NextResponse } from 'next/server';

const YAHOO_SYMBOLS: Record<string, string> = {
  'AAPL': 'AAPL', 'MSFT': 'MSFT', 'GOOGL': 'GOOGL', 'AMZN': 'AMZN',
  'NVDA': 'NVDA', 'META': 'META', 'TSLA': 'TSLA', 'JPM': 'JPM',
  'V': 'V', 'WMT': 'WMT', 'JNJ': 'JNJ', 'MA': 'MA', 'PG': 'PG',
  'UNH': 'UNH', 'HD': 'HD', 'DIS': 'DIS', 'NFLX': 'NFLX',
  'PYPL': 'PYPL', 'INTC': 'INTC', 'AMD': 'AMD',
  'BTCUSD': 'BTC-USD', 'ETHUSD': 'ETH-USD', 'SOLUSD': 'SOL-USD',
  'BNBUSD': 'BNB-USD', 'XRPUSD': 'XRP-USD', 'ADAUSD': 'ADA-USD',
  'DOGEUSD': 'DOGE-USD', 'DOTUSD': 'DOT-USD',
  'SPY': 'SPY', 'QQQ': 'QQQ', 'DIA': 'DIA', 'IWM': 'IWM', 'VTI': 'VTI',
  'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'USDJPY=X',
  'AUDUSD': 'AUDUSD=X', 'USDCAD': 'USDCAD=X',
  'GC1!': 'GC=F', 'CL1!': 'CL=F', 'SI1!': 'SI=F', 'NG1!': 'NG=F',
};

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Cache prices server-side
const priceCache: Map<string, { data: PriceData; timestamp: number }> = new Map();
const CACHE_TTL = 15000; // 15 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  
  if (!symbolsParam) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',');
  const results: PriceData[] = [];

  for (const symbol of symbols) {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results.push(cached.data);
      continue;
    }

    try {
      const yahooSymbol = YAHOO_SYMBOLS[symbol] || symbol;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 15 }
      });

      if (!response.ok) continue;

      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || meta.chartPreviousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      const priceData: PriceData = { symbol, price, change, changePercent };
      results.push(priceData);
      
      // Cache it
      priceCache.set(symbol, { data: priceData, timestamp: Date.now() });
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
    }
  }

  return NextResponse.json({ prices: results, timestamp: Date.now() });
}
