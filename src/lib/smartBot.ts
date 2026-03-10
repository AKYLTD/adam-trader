// Smart Trading Bot - Uses Technical Analysis

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketAnalysis {
  symbol: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number; // 0-100
  reasons: string[];
  targetPrice?: number;
  stopLoss?: number;
}

// Price history for analysis
const priceHistory: Map<string, { price: number; timestamp: number }[]> = new Map();
const MAX_HISTORY = 100;

// Update price history
export function updatePriceHistory(symbol: string, price: number) {
  const history = priceHistory.get(symbol) || [];
  history.push({ price, timestamp: Date.now() });
  
  // Keep only last N entries
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
  
  priceHistory.set(symbol, history);
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0);
  const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate momentum
function calculateMomentum(prices: number[], period: number = 10): number {
  if (prices.length < period) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - period];
  return ((current - past) / past) * 100;
}

// Analyze a symbol and generate trading signal
export function analyzeSymbol(symbol: string, currentPrice: number, changePercent: number): MarketAnalysis {
  const history = priceHistory.get(symbol) || [];
  const prices = history.map(h => h.price);
  
  // Add current price to analysis
  if (prices.length === 0 || prices[prices.length - 1] !== currentPrice) {
    prices.push(currentPrice);
  }
  
  const reasons: string[] = [];
  let score = 0; // -100 to +100
  
  // 1. Daily Change Analysis (-20 to +20)
  if (changePercent < -3) {
    score += 15; // Oversold - buy opportunity
    reasons.push(`📉 Down ${changePercent.toFixed(1)}% today - potential bounce`);
  } else if (changePercent < -1) {
    score += 5;
    reasons.push(`📉 Down ${changePercent.toFixed(1)}% - slight dip`);
  } else if (changePercent > 3) {
    score -= 15; // Overbought - sell signal
    reasons.push(`📈 Up ${changePercent.toFixed(1)}% today - possible profit taking`);
  } else if (changePercent > 1) {
    score -= 5;
    reasons.push(`📈 Up ${changePercent.toFixed(1)}% - momentum positive`);
  }
  
  // 2. RSI Analysis (-30 to +30)
  if (prices.length >= 14) {
    const rsi = calculateRSI(prices);
    if (rsi < 30) {
      score += 30;
      reasons.push(`🔵 RSI ${rsi.toFixed(0)} - OVERSOLD (Strong Buy)`);
    } else if (rsi < 40) {
      score += 15;
      reasons.push(`🔵 RSI ${rsi.toFixed(0)} - Approaching oversold`);
    } else if (rsi > 70) {
      score -= 30;
      reasons.push(`🔴 RSI ${rsi.toFixed(0)} - OVERBOUGHT (Strong Sell)`);
    } else if (rsi > 60) {
      score -= 15;
      reasons.push(`🔴 RSI ${rsi.toFixed(0)} - Getting overbought`);
    } else {
      reasons.push(`⚪ RSI ${rsi.toFixed(0)} - Neutral zone`);
    }
  }
  
  // 3. Moving Average Analysis (-25 to +25)
  if (prices.length >= 20) {
    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    
    if (currentPrice > sma10 && sma10 > sma20) {
      score += 20;
      reasons.push(`📊 Price above both MAs - Bullish trend`);
    } else if (currentPrice < sma10 && sma10 < sma20) {
      score -= 20;
      reasons.push(`📊 Price below both MAs - Bearish trend`);
    } else if (currentPrice > sma10) {
      score += 10;
      reasons.push(`📊 Price above short-term MA`);
    } else if (currentPrice < sma10) {
      score -= 10;
      reasons.push(`📊 Price below short-term MA`);
    }
  }
  
  // 4. Momentum Analysis (-25 to +25)
  if (prices.length >= 10) {
    const momentum = calculateMomentum(prices, 10);
    if (momentum > 5) {
      score += 15;
      reasons.push(`🚀 Strong momentum +${momentum.toFixed(1)}%`);
    } else if (momentum > 2) {
      score += 8;
      reasons.push(`↗️ Positive momentum +${momentum.toFixed(1)}%`);
    } else if (momentum < -5) {
      score -= 15;
      reasons.push(`📉 Weak momentum ${momentum.toFixed(1)}%`);
    } else if (momentum < -2) {
      score -= 8;
      reasons.push(`↘️ Negative momentum ${momentum.toFixed(1)}%`);
    }
  }
  
  // Determine signal based on score
  let signal: MarketAnalysis['signal'];
  if (score >= 40) signal = 'strong_buy';
  else if (score >= 15) signal = 'buy';
  else if (score <= -40) signal = 'strong_sell';
  else if (score <= -15) signal = 'sell';
  else signal = 'hold';
  
  // Calculate confidence (0-100)
  const confidence = Math.min(100, Math.abs(score) + 30);
  
  return {
    symbol,
    signal,
    confidence,
    reasons,
    targetPrice: signal.includes('buy') ? currentPrice * 1.05 : currentPrice * 0.95,
    stopLoss: signal.includes('buy') ? currentPrice * 0.97 : currentPrice * 1.03,
  };
}

// Get all analyses for watched symbols
export async function analyzeMarket(symbols: string[]): Promise<MarketAnalysis[]> {
  try {
    const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
    const data = await response.json();
    
    const analyses: MarketAnalysis[] = [];
    
    if (data.prices) {
      for (const priceData of data.prices) {
        updatePriceHistory(priceData.symbol, priceData.price);
        const analysis = analyzeSymbol(priceData.symbol, priceData.price, priceData.changePercent);
        analyses.push(analysis);
      }
    }
    
    return analyses;
  } catch (error) {
    console.error('Market analysis failed:', error);
    return [];
  }
}

// Get best trades based on analysis
export function getBestTrades(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => a.signal === 'strong_buy' || a.signal === 'buy')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

// Get sells based on analysis
export function getSellSignals(analyses: MarketAnalysis[]): MarketAnalysis[] {
  return analyses
    .filter(a => a.signal === 'strong_sell' || a.signal === 'sell')
    .sort((a, b) => b.confidence - a.confidence);
}
