// Trading Engine - Executes actual trades

import { getPortfolio, savePortfolio, type PaperPortfolio, type PaperTrade, type PaperPosition } from './paperTrading';

export interface TradeResult {
  success: boolean;
  trade?: PaperTrade;
  error?: string;
  portfolio?: PaperPortfolio;
}

// Get mock price (in real app, fetch from API)
export function getPrice(symbol: string): number {
  const prices: Record<string, number> = {
    'AAPL': 178.50,
    'MSFT': 420.15,
    'GOOGL': 141.80,
    'AMZN': 178.25,
    'NVDA': 875.30,
    'META': 505.75,
    'TSLA': 175.25,
    'JPM': 195.40,
    'V': 275.60,
    'WMT': 165.30,
    'BTCUSD': 67500,
    'ETHUSD': 3450,
    'SOLUSD': 145,
    'SPY': 512.50,
    'QQQ': 438.20,
  };
  return prices[symbol] || 100 + Math.random() * 100;
}

// Execute a buy order
export function executeBuy(
  symbol: string, 
  quantity: number, 
  market: string = 'US Stocks'
): TradeResult {
  const portfolio = getPortfolio();
  const price = getPrice(symbol);
  const totalCost = price * quantity;

  if (totalCost > portfolio.balance) {
    return { success: false, error: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${portfolio.balance.toFixed(2)}` };
  }

  // Deduct from balance
  portfolio.balance -= totalCost;

  // Add or update position
  const existingPos = portfolio.positions.find(p => p.symbol === symbol);
  if (existingPos) {
    const totalQty = existingPos.quantity + quantity;
    const totalCostBasis = (existingPos.avgPrice * existingPos.quantity) + totalCost;
    existingPos.avgPrice = totalCostBasis / totalQty;
    existingPos.quantity = totalQty;
    existingPos.currentPrice = price;
  } else {
    portfolio.positions.push({
      symbol,
      quantity,
      avgPrice: price,
      currentPrice: price,
      market,
      pnl: 0,
      pnlPercent: 0,
    });
  }

  // Record trade
  const trade: PaperTrade = {
    id: generateId(),
    symbol,
    type: 'buy',
    quantity,
    price,
    timestamp: Date.now(),
    market,
  };
  portfolio.trades.push(trade);

  savePortfolio(portfolio);
  return { success: true, trade, portfolio };
}

// Execute a sell order
export function executeSell(
  symbol: string, 
  quantity: number
): TradeResult {
  const portfolio = getPortfolio();
  const position = portfolio.positions.find(p => p.symbol === symbol);

  if (!position) {
    return { success: false, error: `No position in ${symbol}` };
  }

  if (position.quantity < quantity) {
    return { success: false, error: `Only have ${position.quantity} shares, trying to sell ${quantity}` };
  }

  const price = getPrice(symbol);
  const totalValue = price * quantity;
  const pnl = (price - position.avgPrice) * quantity;
  const pnlPercent = ((price - position.avgPrice) / position.avgPrice) * 100;

  // Add to balance
  portfolio.balance += totalValue;

  // Update or remove position
  position.quantity -= quantity;
  if (position.quantity === 0) {
    portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
  }

  // Record trade with P&L
  const trade: PaperTrade = {
    id: generateId(),
    symbol,
    type: 'sell',
    quantity,
    price,
    timestamp: Date.now(),
    market: position.market,
    pnl,
    pnlPercent,
  };
  portfolio.trades.push(trade);

  savePortfolio(portfolio);
  return { success: true, trade, portfolio };
}

// Bot trading strategies
export interface BotConfig {
  strategies: string[];
  symbols: string[];
  maxPositionSize: number; // Max $ per position
  maxPositions: number;
}

const DEFAULT_BOT_CONFIG: BotConfig = {
  strategies: ['momentum'],
  symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'],
  maxPositionSize: 5000,
  maxPositions: 5,
};

// Simulate strategy signals
function getSignal(symbol: string, strategy: string): 'buy' | 'sell' | 'hold' {
  // Random for demo - in real app, use technical indicators
  const rand = Math.random();
  
  switch (strategy) {
    case 'momentum':
      // 30% buy, 20% sell, 50% hold
      if (rand < 0.3) return 'buy';
      if (rand < 0.5) return 'sell';
      return 'hold';
    
    case 'meanreversion':
      // 25% buy, 25% sell, 50% hold
      if (rand < 0.25) return 'buy';
      if (rand < 0.5) return 'sell';
      return 'hold';
    
    case 'breakout':
      // 20% buy, 15% sell, 65% hold (fewer signals)
      if (rand < 0.2) return 'buy';
      if (rand < 0.35) return 'sell';
      return 'hold';
    
    case 'dca':
      // Always buy small amounts
      return 'buy';
    
    default:
      return 'hold';
  }
}

// Execute one bot trading cycle
export function executeBotCycle(config: BotConfig = DEFAULT_BOT_CONFIG): TradeResult[] {
  const results: TradeResult[] = [];
  const portfolio = getPortfolio();

  for (const symbol of config.symbols) {
    for (const strategy of config.strategies) {
      const signal = getSignal(symbol, strategy);
      const position = portfolio.positions.find(p => p.symbol === symbol);
      
      if (signal === 'buy') {
        // Only buy if we don't exceed max positions
        if (portfolio.positions.length < config.maxPositions || position) {
          const price = getPrice(symbol);
          const quantity = Math.floor(config.maxPositionSize / price);
          if (quantity > 0 && portfolio.balance >= price * quantity) {
            const result = executeBuy(symbol, Math.min(quantity, 10), 'US Stocks');
            if (result.success) {
              results.push(result);
            }
          }
        }
      } else if (signal === 'sell' && position && position.quantity > 0) {
        // Sell half the position
        const sellQty = Math.max(1, Math.floor(position.quantity / 2));
        const result = executeSell(symbol, sellQty);
        if (result.success) {
          results.push(result);
        }
      }
    }
  }

  return results;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
