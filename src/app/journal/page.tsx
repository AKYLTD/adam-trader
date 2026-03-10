'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradingModeToggle } from '@/components/TradingMode';
import { getPortfolio, type PaperTrade } from '@/lib/paperTrading';

export default function JournalPage() {
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const portfolio = getPortfolio();
    setTrades(portfolio.trades.reverse()); // Most recent first
    setLoading(false);
  }, []);

  const filteredTrades = trades.filter(t => filter === 'all' || t.type === filter);
  
  // Calculate stats
  const totalTrades = trades.length;
  const buyTrades = trades.filter(t => t.type === 'buy');
  const sellTrades = trades.filter(t => t.type === 'sell');
  const totalProfit = sellTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = sellTrades.filter(t => (t.pnl || 0) > 0);
  const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Trade Journal</h1>
        <span className="text-sm text-[#636366]">{totalTrades} trades</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </p>
          <p className="text-xs text-[#636366]">Total P&L</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-xl font-bold ${winRate >= 50 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {winRate.toFixed(0)}%
          </p>
          <p className="text-xs text-[#636366]">Win Rate</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-xl font-bold">{sellTrades.length}</p>
          <p className="text-xs text-[#636366]">Closed</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'buy', 'sell'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f 
                ? f === 'buy' ? 'bg-[#00d632] text-black' 
                  : f === 'sell' ? 'bg-[#ff3b30] text-white'
                  : 'bg-white text-black'
                : 'bg-[#1a1a1a] text-white'
            }`}
          >
            {f === 'all' ? 'All' : f === 'buy' ? '🛒 Buys' : '💸 Sells'}
          </button>
        ))}
      </div>

      {/* Trades List */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-lg font-medium mb-2">No trades yet</p>
            <p className="text-[#636366] text-sm mb-4">Start trading to see your history</p>
            <Link href="/charts" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d632] text-black font-semibold rounded-xl">
              Start Trading
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTrades.map(trade => (
              <div key={trade.id} className="p-4 bg-[#0d0d0d] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      trade.type === 'buy' ? 'bg-[#00d632]/20' : 'bg-[#ff3b30]/20'
                    }`}>
                      {trade.type === 'buy' ? '🛒' : '💸'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{trade.symbol}</p>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#636366]">
                        {trade.quantity} shares @ ${trade.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(trade.price * trade.quantity).toFixed(2)}</p>
                    <p className="text-xs text-[#636366]">{formatTime(trade.timestamp)}</p>
                  </div>
                </div>
                
                {/* Show P&L for sell trades */}
                {trade.type === 'sell' && trade.pnl !== undefined && (
                  <div className={`mt-2 p-2 rounded-lg text-center ${
                    trade.pnl >= 0 ? 'bg-[#00d632]/10' : 'bg-[#ff3b30]/10'
                  }`}>
                    <span className={`font-semibold ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                      {trade.pnl >= 0 ? '📈 Profit: +' : '📉 Loss: '}${Math.abs(trade.pnl).toFixed(2)} 
                      ({trade.pnlPercent !== undefined ? (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(1) + '%' : ''})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {sellTrades.length > 0 && (
        <div className="card bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
          <p className="text-xs text-[#636366] mb-3">PERFORMANCE SUMMARY</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Total Buys</span>
              <span className="font-medium">{buyTrades.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Total Sells</span>
              <span className="font-medium">{sellTrades.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Winning Trades</span>
              <span className="font-medium text-[#00d632]">{winningTrades.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Losing Trades</span>
              <span className="font-medium text-[#ff3b30]">{sellTrades.length - winningTrades.length}</span>
            </div>
            <div className="border-t border-[#262626] pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium">Net Profit/Loss</span>
                <span className={`font-bold ${totalProfit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
