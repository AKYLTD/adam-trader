'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortfolio, calculateStats, resetPortfolio, type PaperPortfolio, type PerformanceStats } from '@/lib/paperTrading';

export default function PerformancePage() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    setPortfolio(getPortfolio());
    setStats(calculateStats());
  }, []);

  const handleReset = () => {
    resetPortfolio();
    setPortfolio(getPortfolio());
    setStats(calculateStats());
    setShowReset(false);
  };

  const formatMoney = (n: number) => {
    return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
  };

  if (!portfolio || !stats) {
    return <div className="animate-pulse p-4"><div className="skeleton h-32 w-full" /></div>;
  }

  const totalValue = portfolio.balance + portfolio.positions.reduce((sum, p) => 
    sum + (p.quantity * (p.currentPrice || p.avgPrice)), 0
  );
  const totalReturn = totalValue - portfolio.initialBalance;
  const totalReturnPercent = (totalReturn / portfolio.initialBalance) * 100;

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Performance</h1>
        <button
          onClick={() => setShowReset(true)}
          className="text-xs text-[#ff3b30] font-medium"
        >
          Reset
        </button>
      </div>

      {/* Portfolio Value */}
      <div className="card">
        <p className="text-[#636366] text-xs mb-1">Paper Portfolio</p>
        <h2 className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${totalReturn >= 0 ? 'bg-[#00d632]/15 text-[#00d632]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'}`}>
            {formatMoney(totalReturn)} ({totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%)
          </span>
          <span className="text-[#636366] text-xs">all time</span>
        </div>
      </div>

      {/* Win Rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Win Rate</p>
          <span className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {stats.winRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-[#262626] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00d632] transition-all duration-500"
            style={{ width: `${stats.winRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#636366]">
          <span>🟢 {stats.winningTrades} wins</span>
          <span>🔴 {stats.losingTrades} losses</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Total Trades</p>
          <p className="text-2xl font-bold">{stats.totalTrades}</p>
        </div>
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Profit Factor</p>
          <p className={`text-2xl font-bold ${stats.profitFactor >= 1 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Avg Win</p>
          <p className="text-xl font-bold text-[#00d632]">${stats.avgWin.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Avg Loss</p>
          <p className="text-xl font-bold text-[#ff3b30]">${stats.avgLoss.toFixed(2)}</p>
        </div>
      </div>

      {/* Streak */}
      {stats.currentStreak !== 0 && (
        <div className={`card ${stats.currentStreak > 0 ? 'bg-[#00d632]/10 border border-[#00d632]/30' : 'bg-[#ff3b30]/10 border border-[#ff3b30]/30'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stats.currentStreak > 0 ? '🔥' : '❄️'}</span>
            <div>
              <p className="font-semibold">
                {Math.abs(stats.currentStreak)} Trade {stats.currentStreak > 0 ? 'Win' : 'Loss'} Streak
              </p>
              <p className="text-xs text-[#8e8e93]">
                {stats.currentStreak > 0 ? 'Keep it up!' : 'Time to review your strategy'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Best/Worst Trades */}
      {(stats.bestTrade || stats.worstTrade) && (
        <div className="space-y-2">
          <p className="text-xs text-[#636366] font-medium px-1">NOTABLE TRADES</p>
          
          {stats.bestTrade && (
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00d632]/20 rounded-full flex items-center justify-center">
                <span>🏆</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{stats.bestTrade.symbol}</p>
                <p className="text-xs text-[#636366]">Best trade</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#00d632]">{formatMoney(stats.bestTrade.pnl || 0)}</p>
                <p className="text-xs text-[#00d632]">+{(stats.bestTrade.pnlPercent || 0).toFixed(1)}%</p>
              </div>
            </div>
          )}
          
          {stats.worstTrade && stats.worstTrade.pnl !== stats.bestTrade?.pnl && (
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff3b30]/20 rounded-full flex items-center justify-center">
                <span>📉</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{stats.worstTrade.symbol}</p>
                <p className="text-xs text-[#636366]">Worst trade</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#ff3b30]">{formatMoney(stats.worstTrade.pnl || 0)}</p>
                <p className="text-xs text-[#ff3b30]">{(stats.worstTrade.pnlPercent || 0).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {stats.totalTrades === 0 && (
        <div className="card text-center py-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-[#8e8e93] mb-4">No completed trades yet</p>
          <Link href="/charts" className="btn btn-primary btn-small inline-flex">
            Start Trading
          </Link>
        </div>
      )}

      {/* Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#ff3b30]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Reset Paper Trading?</h3>
              <p className="text-sm text-[#8e8e93]">
                This will delete all your paper trades and reset your balance to $100,000.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowReset(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReset} className="btn bg-[#ff3b30] text-white font-semibold">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
