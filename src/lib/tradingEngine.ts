// Trading Engine with REAL prices

import { getPortfolio, savePortfolio, type PaperPortfolio, type PaperTrade, type PaperPosition } from './paperTrading';

export interface TradeResult {
  success: boolean;
  trade?: PaperTrade;
  error?: string;
  portfolio?: PaperPortfolio;
}

// Live price cache (updated by API calls)
const livePrices: Map<string, number> = new Map();

// Update price from API
export function updatePrice(symbol: string, price: number) {
  livePrices.set(symbol, price);
}

// Get price (returns cached live price or 0)
export function getPrice(symbol: string): number {
  return livePrices.get(symbol) || 0;
}

// Fetch prices from API
export async function fetchLivePrices(symbols: string[]): Promise<Map<string, number>> {
  try {
    const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);
    const data = await response.json();
    
    if (data.prices) {
      for (const item of data.prices) {
        livePrices.set(item.symbol, item.price);
      }
    }
    
    return livePrices;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return livePrices;
  }
}

// Execute a buy order
export function executeBuy(
  symbol: string, 
  quantity: number, 
  market: string = 'US Stocks'
): TradeResult {
  const portfolio = getPortfolio();
  const price = getPrice(symbol);
  
  if (price <= 0) {
    return { success: false, error: 'Price not available. Please wait for market data.' };
  }
  
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
  
  if (price <= 0) {
    return { success: false, error: 'Price not available. Please wait for market data.' };
  }
  
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

// Bot trading
export interface BotConfig {
  strategies: string[];
  symbols: string[];
  maxPositionSize: number;
  maxPositions: number;
}

function getSignal(symbol: string, strategy: string): 'buy' | 'sell' | 'hold' {
  const rand = Math.random();
  
  switch (strategy) {
    case 'momentum':
      if (rand < 0.25) return 'buy';
      if (rand < 0.4) return 'sell';
      return 'hold';
    case 'meanreversion':
      if (rand < 0.2) return 'buy';
      if (rand < 0.35) return 'sell';
      return 'hold';
    case 'breakout':
      if (rand < 0.15) return 'buy';
      if (rand < 0.25) return 'sell';
      return 'hold';
    case 'dca':
      return rand < 0.3 ? 'buy' : 'hold';
    default:
      return 'hold';
  }
}

export function executeBotCycle(config: BotConfig): TradeResult[] {
  const results: TradeResult[] = [];
  const portfolio = getPortfolio();

  for (const symbol of config.symbols) {
    const price = getPrice(symbol);
    if (price <= 0) continue; // Skip if no price data
    
    for (const strategy of config.strategies) {
      const signal = getSignal(symbol, strategy);
      const position = portfolio.positions.find(p => p.symbol === symbol);
      
      if (signal === 'buy') {
        if (portfolio.positions.length < config.maxPositions || position) {
          const quantity = Math.floor(Math.min(config.maxPositionSize, portfolio.balance * 0.1) / price);
          if (quantity > 0 && portfolio.balance >= price * quantity) {
            const result = executeBuy(symbol, Math.min(quantity, 5), 'US Stocks');
            if (result.success) results.push(result);
            break; // One trade per symbol per cycle
          }
        }
      } else if (signal === 'sell' && position && position.quantity > 0) {
        const sellQty = Math.max(1, Math.floor(position.quantity / 2));
        const result = executeSell(symbol, sellQty);
        if (result.success) results.push(result);
        break;
      }
    }
  }

  return results;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
