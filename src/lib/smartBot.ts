// Smart Trading Bot - AGGRESSIVE dip buyer

export interface MarketAnalysis {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reason: string;
}

// Analyze based on daily change - MORE AGGRESSIVE
export function analyzeSymbol(symbol: string, price: number, changePercent: number): MarketAnalysis {
  let signal: MarketAnalysis['signal'] = 'hold';
  let confidence = 50;
  let reason = '';

  // AGGRESSIVE: Buy any dip, sell any rally
  if (changePercent <= -2) {
    signal = 'strong_buy';
    confidence = 90;
    reason = `🔥 Down ${changePercent.toFixed(1)}% - STRONG BUY!`;
  } else if (changePercent <= -0.5) {
    signal = 'buy';
    confidence = 75;
    reason = `📉 Down ${changePercent.toFixed(1)}% - Buy the dip`;
  } else if (changePercent < 0) {
    signal = 'buy';
    confidence = 60;
    reason = `📉 Slightly red ${changePercent.toFixed(2)}%`;
  } else if (changePercent >= 3) {
    signal = 'strong_sell';
    confidence = 85;
    reason = `🚀 Up ${changePercent.toFixed(1)}% - Take profits!`;
  } else if (changePercent >= 1) {
    signal = 'sell';
    confidence = 65;
    reason = `📈 Up ${changePercent.toFixed(1)}% - Consider selling`;
  } else {
    signal = 'hold';
    confidence = 40;
    reason = `⏸️ Flat ${changePercent.toFixed(2)}%`;
  }

  return { symbol, price, change: price * changePercent / 100, changePercent, signal, confidence, reason };
}

// Fetch and analyze all symbols
export async function analyzeMarket(symbols: string[]): Promise<MarketAnalysis[]> {
  try {
    const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      console.log('❌ No price data received');
      return [];
    }

    const analyses: MarketAnalysis[] = [];
    for (const p of data.prices) {
      const analysis = analyzeSymbol(p.symbol, p.price, p.changePercent);
      analyses.push(analysis);
    }
    
    // Log summary
    const buys = analyses.filter(a => a.signal.includes('buy')).length;
    const sells = analyses.filter(a => a.signal.includes('sell')).length;
    console.log(`📊 Analysis: ${buys} buys, ${sells} sells, ${analyses.length - buys - sells} hold`);
    
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
