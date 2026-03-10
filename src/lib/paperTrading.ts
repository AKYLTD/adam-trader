// Paper Trading Simulator with Performance Tracking

export interface PaperTrade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  market: string;
  closedAt?: number;
  closePrice?: number;
  pnl?: number;
  pnlPercent?: number;
  notes?: string;
}

export interface PaperPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  market: string;
  currentPrice?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface PaperPortfolio {
  balance: number;
  initialBalance: number;
  positions: PaperPosition[];
  trades: PaperTrade[];
  createdAt: number;
}

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  totalPnlPercent: number;
  bestTrade: PaperTrade | null;
  worstTrade: PaperTrade | null;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  currentStreak: number;
  maxDrawdown: number;
}

const STORAGE_KEY = 'paperPortfolio';
const INITIAL_BALANCE = 100000;

export function getPortfolio(): PaperPortfolio {
  if (typeof window === 'undefined') {
    return createNewPortfolio();
  }
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return createNewPortfolio();
}

export function savePortfolio(portfolio: PaperPortfolio): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function createNewPortfolio(): PaperPortfolio {
  return {
    balance: INITIAL_BALANCE,
    initialBalance: INITIAL_BALANCE,
    positions: [],
    trades: [],
    createdAt: Date.now(),
  };
}

export function resetPortfolio(): PaperPortfolio {
  const portfolio = createNewPortfolio();
  savePortfolio(portfolio);
  return portfolio;
}

export function executeTrade(
  symbol: string,
  type: 'buy' | 'sell',
  quantity: number,
  price: number,
  market: string,
  notes?: string
): { success: boolean; error?: string; trade?: PaperTrade } {
  const portfolio = getPortfolio();
  const totalCost = price * quantity;
  
  if (type === 'buy') {
    if (totalCost > portfolio.balance) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    portfolio.balance -= totalCost;
    
    // Add or update position
    const existingPos = portfolio.positions.find(p => p.symbol === symbol);
    if (existingPos) {
      const totalQty = existingPos.quantity + quantity;
      const totalCostBasis = (existingPos.avgPrice * existingPos.quantity) + totalCost;
      existingPos.avgPrice = totalCostBasis / totalQty;
      existingPos.quantity = totalQty;
    } else {
      portfolio.positions.push({
        symbol,
        quantity,
        avgPrice: price,
        market,
      });
    }
  } else {
    // Sell
    const position = portfolio.positions.find(p => p.symbol === symbol);
    if (!position || position.quantity < quantity) {
      return { success: false, error: 'Insufficient shares' };
    }
    
    const pnl = (price - position.avgPrice) * quantity;
    const pnlPercent = ((price - position.avgPrice) / position.avgPrice) * 100;
    
    portfolio.balance += totalCost;
    position.quantity -= quantity;
    
    if (position.quantity === 0) {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
    }
    
    // Record closed trade
    const trade: PaperTrade = {
      id: generateId(),
      symbol,
      type,
      quantity,
      price,
      timestamp: Date.now(),
      market,
      pnl,
      pnlPercent,
      notes,
    };
    
    portfolio.trades.push(trade);
    savePortfolio(portfolio);
    return { success: true, trade };
  }
  
  // Record buy trade
  const trade: PaperTrade = {
    id: generateId(),
    symbol,
    type,
    quantity,
    price,
    timestamp: Date.now(),
    market,
    notes,
  };
  
  portfolio.trades.push(trade);
  savePortfolio(portfolio);
  return { success: true, trade };
}

export function calculateStats(): PerformanceStats {
  const portfolio = getPortfolio();
  const closedTrades = portfolio.trades.filter(t => t.type === 'sell' && t.pnl !== undefined);
  
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
  
  const sortedByPnl = [...closedTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
  
  // Calculate current streak
  let streak = 0;
  for (let i = closedTrades.length - 1; i >= 0; i--) {
    if (i === closedTrades.length - 1) {
      streak = (closedTrades[i].pnl || 0) > 0 ? 1 : -1;
    } else {
      const isWin = (closedTrades[i].pnl || 0) > 0;
      if ((streak > 0 && isWin) || (streak < 0 && !isWin)) {
        streak += streak > 0 ? 1 : -1;
      } else {
        break;
      }
    }
  }
  
  return {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    totalPnl,
    totalPnlPercent: (totalPnl / portfolio.initialBalance) * 100,
    bestTrade: sortedByPnl[0] || null,
    worstTrade: sortedByPnl[sortedByPnl.length - 1] || null,
    avgWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
    avgLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    currentStreak: streak,
    maxDrawdown: 0, // TODO: Calculate properly
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
