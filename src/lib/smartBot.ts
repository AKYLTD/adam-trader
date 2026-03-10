// Smart Trading Bot - Robust Analysis

export interface MarketAnalysis {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reason: string;
}

// Analyze based on daily change
export function analyzeSymbol(symbol: string, price: number, changePercent: number): MarketAnalysis {
  // Validate inputs
  if (!price || price <= 0 || isNaN(changePercent)) {
    return {
      symbol,
      price: price || 0,
      change: 0,
      changePercent: 0,
      signal: 'hold',
      confidence: 0,
      reason: 'Invalid data',
    };
  }

  let signal: MarketAnalysis['signal'];
  let confidence: number;
  let reason: string;

  if (changePercent <= -2) {
    signal = 'strong_buy';
    confidence = 90;
    reason = `Down ${changePercent.toFixed(2)}% - Strong buy`;
  } else if (changePercent <= -0.5) {
    signal = 'buy';
    confidence = 75;
    reason = `Down ${changePercent.toFixed(2)}% - Buy dip`;
  } else if (changePercent < 0) {
    signal = 'buy';
    confidence = 60;
    reason = `Slightly red ${changePercent.toFixed(2)}%`;
  } else if (changePercent >= 3) {
    signal = 'strong_sell';
    confidence = 85;
    reason = `Up ${changePercent.toFixed(2)}% - Take profit`;
  } else if (changePercent >= 1.5) {
    signal = 'sell';
    confidence = 65;
    reason = `Up ${changePercent.toFixed(2)}% - Consider sell`;
  } else {
    signal = 'hold';
    confidence = 40;
    reason = `Flat ${changePercent.toFixed(2)}%`;
  }

  return {
    symbol,
    price,
    change: price * changePercent / 100,
    changePercent,
    signal,
    confidence,
    reason,
  };
}

// Fetch and analyze with error handling
export async function analyzeMarket(symbols: string[]): Promise<MarketAnalysis[]> {
  try {
    const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Price API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      console.error('Invalid price data');
      return [];
    }

    const analyses: MarketAnalysis[] = [];
    
    for (const p of data.prices) {
      if (p.symbol && typeof p.price === 'number' && p.price > 0) {
        const analysis = analyzeSymbol(p.symbol, p.price, p.changePercent || 0);
        analyses.push(analysis);
      }
    }
    
    return analyses;
  } catch (error) {
    console.error('Market analysis error:', error);
    return [];
  }
}

export function getBuySignals(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => (a.signal === 'strong_buy' || a.signal === 'buy') && a.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

export function getSellSignals(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => (a.signal === 'strong_sell' || a.signal === 'sell') && a.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}
