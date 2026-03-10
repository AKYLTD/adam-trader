'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { MarketStatusCard, MarketStatusBar } from '@/components/MarketStatus';

interface Account {
  cash: number;
  portfolioValue: number;
  buyingPower: number;
}

const WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple', price: 178.50, change: 1.33 },
  { symbol: 'MSFT', name: 'Microsoft', price: 420.15, change: -0.76 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 875.30, change: 1.79 },
  { symbol: 'TSLA', name: 'Tesla', price: 175.25, change: -2.83 },
];

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const mode = useTradingMode();

  useEffect(() => {
    fetch('/api/alpaca/account')
      .then(r => r.json())
      .then(acc => {
        if (acc.success) setAccount(acc.account);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Mode Indicator */}
      <div className={`card ${mode === 'paper' ? 'bg-[#007aff]/10 border border-[#007aff]/30' : 'bg-[#00d632]/10 border border-[#00d632]/30'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mode === 'paper' ? '🤖' : '💰'}</span>
          <div className="flex-1">
            <p className={`font-semibold ${mode === 'paper' ? 'text-[#007aff]' : 'text-[#00d632]'}`}>
              {mode === 'paper' ? 'Practice Mode' : 'Live Trading'}
            </p>
            <p className="text-xs text-[#8e8e93]">
              {mode === 'paper' 
                ? 'You can trade manually or let the bot trade • No real money'
                : 'Real money • Be careful!'}
            </p>
          </div>
        </div>
      </div>

      {/* Market Status */}
      <MarketStatusBar />

      {/* Portfolio */}
      <div className="card">
        <p className="text-[#8e8e93] text-xs font-medium mb-1">
          {mode === 'paper' ? 'Paper Portfolio' : 'Live Portfolio'}
        </p>
        {loading ? (
          <div className="skeleton h-10 w-36" />
        ) : (
          <h1 className="text-4xl font-bold tracking-tight">
            ${account?.portfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '100,000.00'}
          </h1>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-1 rounded-full bg-[#00d632]/15 text-[#00d632] font-medium">
            +$0.00 (0.00%)
          </span>
          <span className="text-[#636366] text-xs">today</span>
        </div>
      </div>

      {/* Trading Options */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-3">HOW DO YOU WANT TO TRADE?</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/charts" className="card-interactive bg-[#1a1a1a] flex flex-col items-center gap-2 py-4">
            <span className="text-3xl">👆</span>
            <span className="font-semibold">Manual</span>
            <span className="text-xs text-[#636366]">Trade yourself</span>
          </Link>
          <Link href="/bot" className="card-interactive bg-[#1a1a1a] flex flex-col items-center gap-2 py-4">
            <span className="text-3xl">🤖</span>
            <span className="font-semibold">Bot</span>
            <span className="text-xs text-[#636366]">Auto trading</span>
          </Link>
        </div>
      </div>

      {/* What You Can Trade */}
      <MarketStatusCard />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Cash</p>
          {loading ? <div className="skeleton h-6 w-20" /> : (
            <p className="text-xl font-semibold">${account?.cash?.toLocaleString() || '100,000'}</p>
          )}
        </div>
        <div className="card">
          <p className="text-[#636366] text-xs mb-1">Buying Power</p>
          {loading ? <div className="skeleton h-6 w-20" /> : (
            <p className="text-xl font-semibold">${account?.buyingPower?.toLocaleString() || '200,000'}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/charts', icon: '📈', label: 'Charts' },
          { href: '/positions', icon: '💼', label: 'Portfolio' },
          { href: '/performance', icon: '📊', label: 'Stats' },
          { href: '/brokers', icon: '🔗', label: 'Brokers' },
        ].map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-interactive flex flex-col items-center gap-2 py-4"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-[#8e8e93]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Watchlist */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Watchlist</h2>
          <Link href="/charts" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626] active:scale-95 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
        <div className="space-y-1">
          {WATCHLIST.map((stock, i) => (
            <Link
              key={stock.symbol}
              href={`/charts?symbol=${stock.symbol}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-xl active:bg-[#1c1c1c] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center font-semibold text-sm">
                {stock.symbol.slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{stock.symbol}</p>
                <p className="text-xs text-[#636366]">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${stock.price.toFixed(2)}</p>
                <p className={`text-xs font-medium ${stock.change >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
