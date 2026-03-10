// Paper Trading System with Human vs Bot Trade Tracking

export interface PaperTrade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  market: string;
  source: 'human' | 'bot'; // Track who made the trade
  strategy?: string; // Which strategy (for bot)
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

const STORAGE_KEY = 'paperPortfolio';
const INITIAL_BALANCE = 100000;

export function getPortfolio(): PaperPortfolio {
  if (typeof window === 'undefined') {
    return createNewPortfolio();
  }
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const portfolio = JSON.parse(saved);
    // Migrate old trades without source
    portfolio.trades = portfolio.trades.map((t: PaperTrade) => ({
      ...t,
      source: t.source || 'human'
    }));
    return portfolio;
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

// Get trades by source
export function getHumanTrades(): PaperTrade[] {
  return getPortfolio().trades.filter(t => t.source === 'human');
}

export function getBotTrades(): PaperTrade[] {
  return getPortfolio().trades.filter(t => t.source === 'bot');
}

// Calculate stats by source
export function calculateStats(source?: 'human' | 'bot') {
  const portfolio = getPortfolio();
  let trades = portfolio.trades;
  
  if (source) {
    trades = trades.filter(t => t.source === source);
  }
  
  const closedTrades = trades.filter(t => t.type === 'sell' && t.pnl !== undefined);
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
  
  return {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    totalPnl,
    avgWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
    avgLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
  };
}
