// Trading Engine - Executes trades with source tracking

import { getPortfolio, savePortfolio, type PaperPortfolio, type PaperTrade, type PaperPosition } from './paperTrading';
import { analyzeMarket, getBestTrades, getSellSignals, updatePriceHistory, type MarketAnalysis } from './smartBot';

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
  updatePriceHistory(symbol, price);
}

export function getPrice(symbol: string): number {
  return livePrices.get(symbol) || 0;
}

// Execute a buy order - HUMAN trade
export function executeBuy(
  symbol: string, 
  quantity: number, 
  market: string = 'US Stocks'
): TradeResult {
  return executeOrder(symbol, 'buy', quantity, market, 'human');
}

// Execute a sell order - HUMAN trade
export function executeSell(
  symbol: string, 
  quantity: number
): TradeResult {
  return executeOrder(symbol, 'sell', quantity, '', 'human');
}

// Execute BOT buy
export function executeBotBuy(
  symbol: string, 
  quantity: number, 
  market: string,
  strategy: string,
  analysis?: MarketAnalysis
): TradeResult {
  const result = executeOrder(symbol, 'buy', quantity, market, 'bot', strategy);
  result.analysis = analysis;
  return result;
}

// Execute BOT sell
export function executeBotSell(
  symbol: string, 
  quantity: number,
  strategy: string,
  analysis?: MarketAnalysis
): TradeResult {
  const result = executeOrder(symbol, 'sell', quantity, '', 'bot', strategy);
  result.analysis = analysis;
  return result;
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
    return { success: false, error: 'Price not available. Waiting for market data.' };
  }

  if (type === 'buy') {
    const totalCost = price * quantity;
    
    if (totalCost > portfolio.balance) {
      return { success: false, error: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${portfolio.balance.toFixed(2)}` };
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
  const portfolio = getPortfolio();
  
  // Analyze all symbols
  const analyses = await analyzeMarket(config.symbols);
  if (analyses.length === 0) {
    console.log('No market data available');
    return results;
  }
  
  // Check existing positions for sell signals
  for (const position of portfolio.positions) {
    const analysis = analyses.find(a => a.symbol === position.symbol);
    if (!analysis) continue;
    
    // Sell if strong sell signal OR take profit at 5%+ OR stop loss at -3%
    const currentPrice = getPrice(position.symbol);
    const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;
    
    let shouldSell = false;
    let reason = '';
    
    if (analysis.signal === 'strong_sell' && analysis.confidence > 60) {
      shouldSell = true;
      reason = 'Strong sell signal';
    } else if (pnlPercent >= 5 && config.riskLevel !== 'aggressive') {
      shouldSell = true;
      reason = 'Taking profit at 5%+';
    } else if (pnlPercent <= -3 && config.riskLevel !== 'aggressive') {
      shouldSell = true;
      reason = 'Stop loss triggered at -3%';
    }
    
    if (shouldSell) {
      const result = executeBotSell(position.symbol, position.quantity, reason, analysis);
      if (result.success) {
        results.push(result);
        console.log(`🤖 BOT SOLD ${position.symbol}: ${reason}`);
      }
    }
  }
  
  // Look for buy opportunities
  const buySignals = getBestTrades(analyses);
  const currentPositions = getPortfolio().positions.length;
  
  for (const analysis of buySignals) {
    if (currentPositions + results.filter(r => r.trade?.type === 'buy').length >= config.maxPositions) {
      break; // Max positions reached
    }
    
    // Skip if already have position
    if (portfolio.positions.find(p => p.symbol === analysis.symbol)) {
      continue;
    }
    
    // Calculate position size based on risk level
    let positionSize = config.maxPositionSize;
    if (config.riskLevel === 'conservative') {
      positionSize = config.maxPositionSize * 0.5;
    } else if (config.riskLevel === 'aggressive') {
      positionSize = config.maxPositionSize * 1.5;
    }
    
    // Only buy with high confidence
    const minConfidence = config.riskLevel === 'aggressive' ? 50 : 60;
    if (analysis.confidence < minConfidence) {
      continue;
    }
    
    const price = getPrice(analysis.symbol);
    if (price <= 0) continue;
    
    const quantity = Math.floor(positionSize / price);
    if (quantity <= 0) continue;
    
    const balance = getPortfolio().balance;
    if (price * quantity > balance) continue;
    
    const result = executeBotBuy(
      analysis.symbol,
      quantity,
      'US Stocks',
      `${analysis.signal} (${analysis.confidence}% confidence)`,
      analysis
    );
    
    if (result.success) {
      results.push(result);
      console.log(`🤖 BOT BOUGHT ${analysis.symbol}: ${analysis.reasons[0]}`);
    }
  }
  
  return results;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
