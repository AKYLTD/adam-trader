// Smart Trading Bot - Trades based on daily price movements

export interface MarketAnalysis {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reason: string;
}

// Analyze based on daily change - SIMPLE but effective
export function analyzeSymbol(symbol: string, price: number, changePercent: number): MarketAnalysis {
  let signal: MarketAnalysis['signal'] = 'hold';
  let confidence = 50;
  let reason = '';

  // Strategy: Buy dips, sell rallies
  if (changePercent <= -3) {
    signal = 'strong_buy';
    confidence = 85;
    reason = `🔥 Down ${changePercent.toFixed(1)}% - Strong buy opportunity!`;
  } else if (changePercent <= -1.5) {
    signal = 'buy';
    confidence = 70;
    reason = `📉 Down ${changePercent.toFixed(1)}% - Good entry point`;
  } else if (changePercent >= 4) {
    signal = 'strong_sell';
    confidence = 80;
    reason = `🚀 Up ${changePercent.toFixed(1)}% - Take profits!`;
  } else if (changePercent >= 2) {
    signal = 'sell';
    confidence = 65;
    reason = `📈 Up ${changePercent.toFixed(1)}% - Consider selling`;
  } else if (changePercent < -0.5) {
    signal = 'buy';
    confidence = 55;
    reason = `📉 Slight dip ${changePercent.toFixed(1)}%`;
  } else if (changePercent > 0.5) {
    signal = 'hold';
    confidence = 50;
    reason = `📊 Flat day ${changePercent.toFixed(1)}%`;
  } else {
    signal = 'hold';
    confidence = 40;
    reason = `⏸️ No clear signal`;
  }

  return { symbol, price, change: price * changePercent / 100, changePercent, signal, confidence, reason };
}

// Fetch and analyze all symbols
export async function analyzeMarket(symbols: string[]): Promise<MarketAnalysis[]> {
  try {
    const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      console.log('No price data received');
      return [];
    }

    const analyses: MarketAnalysis[] = [];
    for (const p of data.prices) {
      const analysis = analyzeSymbol(p.symbol, p.price, p.changePercent);
      analyses.push(analysis);
      console.log(`📊 ${p.symbol}: $${p.price.toFixed(2)} (${p.changePercent >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%) → ${analysis.signal.toUpperCase()}`);
    }
    
    return analyses;
  } catch (error) {
    console.error('Market analysis failed:', error);
    return [];
  }
}

// Get buy signals sorted by confidence
export function getBuySignals(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => a.signal === 'strong_buy' || a.signal === 'buy')
    .sort((a, b) => b.confidence - a.confidence);
}

// Get sell signals
export function getSellSignals(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => a.signal === 'strong_sell' || a.signal === 'sell')
    .sort((a, b) => b.confidence - a.confidence);
}
