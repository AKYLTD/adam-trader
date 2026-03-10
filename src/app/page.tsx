'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Account {
  cash: number;
  portfolioValue: number;
  buyingPower: number;
  status: string;
}

const WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.35, changePercent: 1.33 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.15, change: -3.20, changePercent: -0.76 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 15.40, changePercent: 1.79 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.25, change: -5.10, changePercent: -2.83 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.95, changePercent: 0.67 },
];

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/alpaca/account').then(r => r.json()),
      fetch('/api/alpaca/clock').then(r => r.json()),
    ]).then(([accountData, clockData]) => {
      if (accountData.success) setAccount(accountData.account);
      if (clockData.success) setMarketOpen(clockData.clock.isOpen);
    }).finally(() => setLoading(false));
  }, []);

  const dailyChange = 0;
  const dailyChangePercent = 0;

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Portfolio Value */}
      <section className="card">
        <p className="text-secondary text-sm font-medium mb-2">Portfolio Value</p>
        {loading ? (
          <div className="skeleton h-10 w-40 mb-2" />
        ) : (
          <h1 className="number-large">
            ${account?.portfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </h1>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={`badge ${dailyChange >= 0 ? 'badge-green' : 'badge-red'}`}>
            {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
          </span>
          <span className="text-tertiary text-xs">Today</span>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-tertiary text-xs font-medium mb-1">Available Cash</p>
          {loading ? (
            <div className="skeleton h-7 w-24" />
          ) : (
            <p className="number-medium">${account?.cash?.toLocaleString() || '0'}</p>
          )}
        </div>
        <div className="card">
          <p className="text-tertiary text-xs font-medium mb-1">Buying Power</p>
          {loading ? (
            <div className="skeleton h-7 w-24" />
          ) : (
            <p className="number-medium">${account?.buyingPower?.toLocaleString() || '0'}</p>
          )}
        </div>
      </section>

      {/* Market Status */}
      <section className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${marketOpen ? 'bg-[#00d632]' : 'bg-[#ff3b30]'} animate-pulse`} />
          <div>
            <p className="font-medium">US Markets</p>
            <p className="text-tertiary text-xs">{marketOpen ? 'Open for trading' : 'Closed'}</p>
          </div>
        </div>
        <span className="badge badge-blue">9:30 AM - 4:00 PM ET</span>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/charts" className="card-interactive flex items-center gap-4">
          <div className="avatar avatar-md bg-blue text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Charts</p>
            <p className="text-tertiary text-xs">View markets</p>
          </div>
        </Link>
        <Link href="/positions" className="card-interactive flex items-center gap-4">
          <div className="avatar avatar-md bg-gain text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Portfolio</p>
            <p className="text-tertiary text-xs">Your holdings</p>
          </div>
        </Link>
      </section>

      {/* Watchlist */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0">Watchlist</h2>
          <Link href="/charts" className="text-[#007aff] text-sm font-medium">See all</Link>
        </div>
        <div className="space-y-1">
          {WATCHLIST.map(stock => (
            <Link
              key={stock.symbol}
              href={`/charts?symbol=${stock.symbol}`}
              className="list-item"
            >
              <div className="avatar avatar-md bg-[#1c1c1c] text-white mr-3">
                {stock.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{stock.symbol}</p>
                <p className="text-tertiary text-sm truncate">{stock.name}</p>
              </div>
              <div className="text-right ml-3">
                <p className="font-semibold">${stock.price.toFixed(2)}</p>
                <p className={`text-sm ${stock.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Insights */}
      <section className="card border border-[#00d632]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar avatar-md bg-[#00d632] text-black font-bold">AI</div>
          <div>
            <p className="font-semibold">Adam&apos;s Insights</p>
            <p className="text-tertiary text-xs">AI-powered analysis</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] rounded-xl p-4 text-sm text-secondary space-y-2">
          <p>📊 Market analysis ready. US markets {marketOpen ? 'are open' : 'will open at 9:30 AM ET'}.</p>
          <p>💡 Tip: Check the Learn section to improve your trading knowledge.</p>
        </div>
      </section>

      {/* Paper Trading Notice */}
      <section className="card bg-orange border border-[#ff9500]/30">
        <div className="flex items-center gap-4">
          <span className="text-3xl">📄</span>
          <div>
            <p className="font-semibold text-[#ff9500]">Paper Trading Mode</p>
            <p className="text-sm text-secondary">No real money is being used. Practice freely!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
