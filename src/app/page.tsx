'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { MarketStatusCard, MarketStatusBar } from '@/components/MarketStatus';
import { getPortfolio, type PaperPosition, type PaperTrade } from '@/lib/paperTrading';
import { updatePrice } from '@/lib/tradingEngine';

export default function Dashboard() {
  const mode = useTradingMode();
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live prices and update portfolio
  const loadPortfolio = async () => {
    const portfolio = getPortfolio();
    
    if (portfolio.positions.length > 0) {
      try {
        const symbols = portfolio.positions.map(p => p.symbol).join(',');
        const response = await fetch(`/api/prices?symbols=${symbols}`);
        const data = await response.json();
        
        const priceMap = new Map();
        if (data.prices) {
          for (const p of data.prices) {
            priceMap.set(p.symbol, p.price);
            updatePrice(p.symbol, p.price);
          }
        }
        
        const updatedPositions = portfolio.positions.map(pos => {
          const livePrice = priceMap.get(pos.symbol) || pos.avgPrice;
          const pnl = (livePrice - pos.avgPrice) * pos.quantity;
          return { ...pos, currentPrice: livePrice, pnl };
        });
        
        setPositions(updatedPositions);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        setPositions(portfolio.positions);
      }
    } else {
      setPositions([]);
    }
    
    setBalance(portfolio.balance);
    setRecentTrades(portfolio.trades.slice(-3).reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const totalInvested = positions.reduce((sum, p) => sum + (p.currentPrice || p.avgPrice) * p.quantity, 0);
  const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
  const portfolioValue = balance + totalInvested;

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Mode Indicator */}
      <div className={`card ${mode === 'paper' ? 'bg-[#007aff]/10 border border-[#007aff]/30' : 'bg-[#00d632]/10 border border-[#00d632]/30'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mode === 'paper' ? '📄' : '💰'}</span>
          <div className="flex-1">
            <p className={`font-semibold ${mode === 'paper' ? 'text-[#007aff]' : 'text-[#00d632]'}`}>
              {mode === 'paper' ? 'Paper Trading Mode' : 'Live Trading Mode'}
            </p>
            <p className="text-xs text-[#8e8e93]">
              {mode === 'paper' 
                ? 'Practice with virtual money'
                : 'Trading with real money'}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Value - LIVE */}
      <div className="card bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#636366] text-xs font-medium">Portfolio Value</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#00d632] rounded-full animate-pulse" />
            <span className="text-xs text-[#636366]">Live</span>
          </div>
        </div>
        {loading ? (
          <div className="skeleton h-12 w-48" />
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${totalPnl >= 0 ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
              <span className="text-[#636366] text-xs">unrealized P&L</span>
            </div>
          </>
        )}
      </div>

      {/* Market Status */}
      <MarketStatusBar />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <p className="text-xl font-bold">${(balance/1000).toFixed(1)}k</p>
          <p className="text-xs text-[#636366]">Cash</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-xl font-bold">${(totalInvested/1000).toFixed(1)}k</p>
          <p className="text-xs text-[#636366]">Invested</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-xl font-bold">{positions.length}</p>
          <p className="text-xs text-[#636366]">Positions</p>
        </div>
      </div>

      {/* Your Positions */}
      {positions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your Positions</h2>
            <Link href="/positions" className="text-sm text-[#007aff]">See all</Link>
          </div>
          <div className="space-y-2">
            {positions.slice(0, 4).map(pos => (
              <div key={pos.symbol} className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center font-semibold">
                    {pos.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{pos.symbol}</p>
                    <p className="text-xs text-[#636366]">{pos.quantity} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${((pos.currentPrice || pos.avgPrice) * pos.quantity).toFixed(2)}</p>
                  <p className={`text-xs ${(pos.pnl || 0) >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {(pos.pnl || 0) >= 0 ? '+' : ''}${(pos.pnl || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Trades</h2>
            <Link href="/journal" className="text-sm text-[#007aff]">History</Link>
          </div>
          <div className="space-y-2">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <span className="text-sm">${(trade.price * trade.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trading Options */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-3">TRADE</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/charts" className="card-interactive bg-[#0d0d0d] flex flex-col items-center gap-2 py-5">
            <span className="text-3xl">👆</span>
            <span className="font-semibold">Manual</span>
            <span className="text-xs text-[#636366]">Trade yourself</span>
          </Link>
          <Link href="/bot" className="card-interactive bg-[#0d0d0d] flex flex-col items-center gap-2 py-5">
            <span className="text-3xl">🤖</span>
            <span className="font-semibold">Bot</span>
            <span className="text-xs text-[#636366]">Auto trading</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/charts', icon: '📈', label: 'Charts' },
          { href: '/positions', icon: '💼', label: 'Portfolio' },
          { href: '/performance', icon: '📊', label: 'Stats' },
          { href: '/brokers', icon: '🔗', label: 'Brokers' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-interactive flex flex-col items-center gap-2 py-3"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium text-[#8e8e93]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
