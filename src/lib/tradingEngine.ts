// Trading Engine - Robust error handling

import { getPortfolio, savePortfolio, type PaperPortfolio, type PaperTrade } from './paperTrading';
import { analyzeMarket, getBuySignals, type MarketAnalysis } from './smartBot';

export interface TradeResult {
  success: boolean;
  trade?: PaperTrade;
  error?: string;
  analysis?: MarketAnalysis;
}

// Live price cache
const livePrices: Map<string, number> = new Map();

export function updatePrice(symbol: string, price: number) {
  if (price > 0) livePrices.set(symbol, price);
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

// Core order execution with full error handling
function executeOrder(
  symbol: string,
  type: 'buy' | 'sell',
  quantity: number,
  market: string,
  source: 'human' | 'bot',
  strategy?: string
): TradeResult {
  try {
    if (!symbol || quantity <= 0) {
      return { success: false, error: 'Invalid symbol or quantity' };
    }

    const portfolio = getPortfolio();
    const price = getPrice(symbol);
    
    if (!price || price <= 0) {
      return { success: false, error: `No price data for ${symbol}` };
    }

    if (type === 'buy') {
      const totalCost = price * quantity;
      
      if (totalCost > portfolio.balance) {
        return { success: false, error: `Insufficient funds: need $${totalCost.toFixed(0)}` };
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
      return { success: true, trade };
      
    } else {
      // SELL
      const position = portfolio.positions.find(p => p.symbol === symbol);

      if (!position) {
        return { success: false, error: `No position in ${symbol}` };
      }

      if (position.quantity < quantity) {
        quantity = position.quantity; // Sell all available
      }

      const totalValue = price * quantity;
      const pnl = (price - position.avgPrice) * quantity;
      const pnlPercent = ((price - position.avgPrice) / position.avgPrice) * 100;

      portfolio.balance += totalValue;

      position.quantity -= quantity;
      if (position.quantity <= 0) {
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
      return { success: true, trade };
    }
  } catch (error) {
    console.error('Trade execution error:', error);
    return { success: false, error: String(error) };
  }
}

// Bot Configuration
export interface BotConfig {
  symbols: string[];
  maxPositionSize: number;
  maxPositions: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

// Smart Bot Trading Cycle - Fully error handled
export async function runSmartBotCycle(config: BotConfig): Promise<TradeResult[]> {
  const results: TradeResult[] = [];
  
  try {
    // Fetch and analyze market
    const analyses = await analyzeMarket(config.symbols);
    
    if (!analyses || analyses.length === 0) {
      return results;
    }

    // Update price cache
    for (const a of analyses) {
      if (a.price > 0) updatePrice(a.symbol, a.price);
    }

    const portfolio = getPortfolio();

    // Check existing positions for sell opportunities
    const positionsToCheck = [...portfolio.positions];
    for (const position of positionsToCheck) {
      try {
        const analysis = analyses.find(a => a.symbol === position.symbol);
        if (!analysis || !analysis.price) continue;
        
        const currentPrice = analysis.price;
        const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;
        
        let shouldSell = false;
        let reason = '';
        
        if (pnlPercent >= 3) {
          shouldSell = true;
          reason = `Take profit +${pnlPercent.toFixed(1)}%`;
        } else if (pnlPercent <= -2) {
          shouldSell = true;
          reason = `Stop loss ${pnlPercent.toFixed(1)}%`;
        } else if (analysis.signal === 'strong_sell' && analysis.confidence > 80) {
          shouldSell = true;
          reason = `Strong sell signal`;
        }
        
        if (shouldSell) {
          const result = executeBotSell(position.symbol, position.quantity, reason);
          if (result.success) results.push(result);
        }
      } catch (e) {
        console.error('Sell check error:', e);
      }
    }

    // Look for buy opportunities
    const buySignals = getBuySignals(analyses);
    const currentPositions = getPortfolio().positions;
    const positionCount = currentPositions.length + results.filter(r => r.trade?.type === 'buy').length;
    
    for (const signal of buySignals) {
      try {
        if (positionCount >= config.maxPositions) break;
        
        // Skip if already have position
        if (currentPositions.find(p => p.symbol === signal.symbol)) continue;
        
        // Confidence check
        const minConfidence = config.riskLevel === 'aggressive' ? 40 : config.riskLevel === 'moderate' ? 50 : 60;
        if (signal.confidence < minConfidence) continue;
        
        // Calculate quantity
        const price = signal.price;
        if (!price || price <= 0) continue;
        
        let positionSize = config.maxPositionSize;
        if (config.riskLevel === 'conservative') positionSize *= 0.5;
        if (config.riskLevel === 'aggressive') positionSize *= 1.5;
        
        const quantity = Math.floor(positionSize / price);
        if (quantity <= 0) continue;
        
        const balance = getPortfolio().balance;
        if (price * quantity > balance) continue;
        
        const result = executeBotBuy(signal.symbol, quantity, 'US Stocks', signal.reason);
        if (result.success) {
          result.analysis = signal;
          results.push(result);
        }
      } catch (e) {
        console.error('Buy execution error:', e);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Bot cycle error:', error);
    return results;
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
