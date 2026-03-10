// Trading Engine - Executes trades

import { getPortfolio, savePortfolio, type PaperPortfolio, type PaperTrade, type PaperPosition } from './paperTrading';
import { analyzeMarket, getBuySignals, getSellSignals, type MarketAnalysis } from './smartBot';

export interface TradeResult {
  success: boolean;
  trade?: PaperTrade;
  error?: string;
  portfolio?: PaperPortfolio;
  analysis?: MarketAnalysis;
}

// Live price cache
const livePrices: Map<string, number> = new Map();

export function updatePrice(symbol: string, price: number) {
  livePrices.set(symbol, price);
}

export function getPrice(symbol: string): number {
  return livePrices.get(symbol) || 0;
}

// Execute HUMAN buy
export function executeBuy(symbol: string, quantity: number, market: string = 'US Stocks'): TradeResult {
  return executeOrder(symbol, 'buy', quantity, market, 'human');
}

// Execute HUMAN sell
export function executeSell(symbol: string, quantity: number): TradeResult {
  return executeOrder(symbol, 'sell', quantity, '', 'human');
}

// Execute BOT buy
export function executeBotBuy(symbol: string, quantity: number, market: string, strategy: string): TradeResult {
  return executeOrder(symbol, 'buy', quantity, market, 'bot', strategy);
}

// Execute BOT sell
export function executeBotSell(symbol: string, quantity: number, strategy: string): TradeResult {
  return executeOrder(symbol, 'sell', quantity, '', 'bot', strategy);
}

// Core order execution
function executeOrder(
  symbol: string,
  type: 'buy' | 'sell',
  quantity: number,
  market: string,
  source: 'human' | 'bot',
  strategy?: string
): TradeResult {
  const portfolio = getPortfolio();
  const price = getPrice(symbol);
  
  if (price <= 0) {
    return { success: false, error: `No price for ${symbol}` };
  }

  if (type === 'buy') {
    const totalCost = price * quantity;
    
    if (totalCost > portfolio.balance) {
      return { success: false, error: `Need $${totalCost.toFixed(0)}, have $${portfolio.balance.toFixed(0)}` };
    }

    portfolio.balance -= totalCost;

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

    const trade: PaperTrade = {
      id: generateId(),
      symbol,
      type: 'buy',
      quantity,
      price,
      timestamp: Date.now(),
      market,
      source,
      strategy,
    };
    portfolio.trades.push(trade);
    savePortfolio(portfolio);
    
    console.log(`✅ ${source.toUpperCase()} BUY: ${quantity} ${symbol} @ $${price.toFixed(2)}`);
    return { success: true, trade, portfolio };
    
  } else {
    // SELL
    const position = portfolio.positions.find(p => p.symbol === symbol);

    if (!position) {
      return { success: false, error: `No position in ${symbol}` };
    }

    if (position.quantity < quantity) {
      return { success: false, error: `Only have ${position.quantity} shares` };
    }

    const totalValue = price * quantity;
    const pnl = (price - position.avgPrice) * quantity;
    const pnlPercent = ((price - position.avgPrice) / position.avgPrice) * 100;

    portfolio.balance += totalValue;

    position.quantity -= quantity;
    if (position.quantity === 0) {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
    }

    const trade: PaperTrade = {
      id: generateId(),
      symbol,
      type: 'sell',
      quantity,
      price,
      timestamp: Date.now(),
      market: position.market,
      source,
      strategy,
      pnl,
      pnlPercent,
    };
    portfolio.trades.push(trade);
    savePortfolio(portfolio);
    
    console.log(`✅ ${source.toUpperCase()} SELL: ${quantity} ${symbol} @ $${price.toFixed(2)} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    return { success: true, trade, portfolio };
  }
}

// Smart Bot Trading Cycle
export interface BotConfig {
  symbols: string[];
  maxPositionSize: number;
  maxPositions: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

export async function runSmartBotCycle(config: BotConfig): Promise<TradeResult[]> {
  const results: TradeResult[] = [];
  
  console.log('🤖 Bot cycle starting...');
  
  // Fetch and analyze market
  const analyses = await analyzeMarket(config.symbols);
  
  if (analyses.length === 0) {
    console.log('❌ No market data');
    return results;
  }

  // Update price cache
  for (const a of analyses) {
    updatePrice(a.symbol, a.price);
  }

  const portfolio = getPortfolio();
  console.log(`💰 Balance: $${portfolio.balance.toFixed(0)} | Positions: ${portfolio.positions.length}`);

  // Check existing positions for sell opportunities
  for (const position of portfolio.positions) {
    const analysis = analyses.find(a => a.symbol === position.symbol);
    if (!analysis) continue;
    
    const currentPrice = analysis.price;
    const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;
    
    // Sell conditions
    let shouldSell = false;
    let reason = '';
    
    if (pnlPercent >= 3) {
      shouldSell = true;
      reason = `Taking profit +${pnlPercent.toFixed(1)}%`;
    } else if (pnlPercent <= -2) {
      shouldSell = true;
      reason = `Stop loss ${pnlPercent.toFixed(1)}%`;
    } else if (analysis.signal === 'strong_sell') {
      shouldSell = true;
      reason = analysis.reason;
    }
    
    if (shouldSell) {
      console.log(`📤 Selling ${position.symbol}: ${reason}`);
      const result = executeBotSell(position.symbol, position.quantity, reason);
      if (result.success) results.push(result);
    }
  }

  // Look for buy opportunities
  const buySignals = getBuySignals(analyses);
  const currentPositionCount = getPortfolio().positions.length;
  
  console.log(`📊 Buy signals: ${buySignals.length}`);
  
  for (const signal of buySignals) {
    // Check max positions
    if (currentPositionCount + results.filter(r => r.trade?.type === 'buy').length >= config.maxPositions) {
      console.log('Max positions reached');
      break;
    }
    
    // Skip if already have position
    if (portfolio.positions.find(p => p.symbol === signal.symbol)) {
      continue;
    }
    
    // Only trade high confidence signals
    const minConfidence = config.riskLevel === 'aggressive' ? 50 : config.riskLevel === 'moderate' ? 60 : 70;
    if (signal.confidence < minConfidence) {
      continue;
    }
    
    // Calculate quantity
    const price = signal.price;
    let positionSize = config.maxPositionSize;
    if (config.riskLevel === 'conservative') positionSize *= 0.5;
    if (config.riskLevel === 'aggressive') positionSize *= 1.5;
    
    const quantity = Math.floor(positionSize / price);
    if (quantity <= 0) continue;
    
    const balance = getPortfolio().balance;
    if (price * quantity > balance) {
      console.log(`Not enough balance for ${signal.symbol}`);
      continue;
    }
    
    console.log(`📥 Buying ${signal.symbol}: ${signal.reason}`);
    const result = executeBotBuy(signal.symbol, quantity, 'US Stocks', signal.reason);
    if (result.success) {
      result.analysis = signal;
      results.push(result);
    }
  }
  
  console.log(`🤖 Bot cycle done. Trades: ${results.length}`);
  return results;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
