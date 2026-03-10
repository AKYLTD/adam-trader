'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { getPortfolio, type PaperPosition, type PaperTrade } from '@/lib/paperTrading';
import { getPrice } from '@/lib/tradingEngine';

export default function PositionsPage() {
  const mode = useTradingMode();
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [balance, setBalance] = useState(100000);
  const [loading, setLoading] = useState(true);

  // Load positions and update prices
  const loadPortfolio = () => {
    const portfolio = getPortfolio();
    
    // Update current prices and calculate P&L
    const updatedPositions = portfolio.positions.map(pos => {
      const currentPrice = getPrice(pos.symbol);
      const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
      const pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
      return {
        ...pos,
        currentPrice,
        pnl,
        pnlPercent,
      };
    });

    setPositions(updatedPositions);
    setBalance(portfolio.balance);
    setRecentTrades(portfolio.trades.slice(-5).reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadPortfolio();
    // Refresh every 2 seconds
    const interval = setInterval(loadPortfolio, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = positions.reduce((sum, p) => sum + (p.currentPrice || p.avgPrice) * p.quantity, 0);
  const totalPl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
  const totalCost = positions.reduce((sum, p) => sum + p.avgPrice * p.quantity, 0);
  const totalPlPercent = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;
  const portfolioValue = balance + totalValue;

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Portfolio</h1>
        <button onClick={loadPortfolio} className="text-sm text-[#007aff] font-medium">
          Refresh
        </button>
      </div>

      {/* Total Portfolio Value */}
      <div className="card bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
        <p className="text-[#636366] text-xs mb-1">Total Portfolio</p>
        <h2 className="text-4xl font-bold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm px-3 py-1 rounded-full font-semibold ${totalPl >= 0 ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'}`}>
            {totalPl >= 0 ? '+' : ''}${totalPl.toFixed(2)} ({totalPlPercent >= 0 ? '+' : ''}{totalPlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Cash & Invested */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">💵 Cash</p>
          <p className="text-2xl font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">📈 Invested</p>
          <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Positions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Stocks ({positions.length})</h3>
          <Link 
            href="/charts" 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00d632] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-14 h-14 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-5 w-20 mb-2" />
                  <div className="skeleton h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-lg font-medium mb-2">No positions yet</p>
            <p className="text-[#636366] text-sm mb-4">Buy some stocks to get started!</p>
            <Link href="/charts" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d632] text-black font-semibold rounded-xl">
              <span>Start Trading</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div
                key={pos.symbol}
                className="flex items-center gap-3 p-3 bg-[#0d0d0d] rounded-xl"
              >
                <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center font-bold text-lg">
                  {pos.symbol.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{pos.symbol}</p>
                    <span className="text-xs px-2 py-0.5 bg-[#262626] rounded-full text-[#8e8e93]">
                      {pos.quantity} shares
                    </span>
                  </div>
                  <p className="text-sm text-[#636366]">
                    Avg: ${pos.avgPrice.toFixed(2)} → Now: ${(pos.currentPrice || pos.avgPrice).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">${((pos.currentPrice || pos.avgPrice) * pos.quantity).toFixed(2)}</p>
                  <p className={`text-sm font-medium ${(pos.pnl || 0) >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {(pos.pnl || 0) >= 0 ? '+' : ''}${(pos.pnl || 0).toFixed(2)} ({(pos.pnlPercent || 0).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentTrades.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activity</h3>
            <Link href="/journal" className="text-sm text-[#007aff]">See all</Link>
          </div>
          <div className="space-y-2">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                  }`}>
                    {trade.type === 'buy' ? '↓' : '↑'}
                  </span>
                  <div>
                    <p className="font-medium">{trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.symbol}</p>
                    <p className="text-xs text-[#636366]">{trade.quantity} × ${trade.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(trade.price * trade.quantity).toFixed(2)}</p>
                  {trade.pnl !== undefined && (
                    <p className={`text-xs ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/charts" className="btn bg-[#00d632] text-black font-semibold">
          Buy Stocks
        </Link>
        <Link href="/performance" className="btn btn-secondary">
          View Stats
        </Link>
      </div>
    </div>
  );
}
