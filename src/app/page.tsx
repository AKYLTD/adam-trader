'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Account {
  cash: number;
  portfolioValue: number;
  buyingPower: number;
  status: string;
}

export default function TradingDashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    // Fetch account
    fetch('/api/alpaca/account')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAccount(data.account);
      })
      .finally(() => setLoading(false));

    // Check market status
    fetch('/api/alpaca/clock')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMarketOpen(data.clock.isOpen);
      });
  }, []);

  const dailyChange = 0;
  const dailyChangePercent = 0;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Portfolio Value Card */}
      <div className="t212-card">
        <p className="text-[#9e9e9e] text-sm mb-1">Portfolio Value</p>
        {loading ? (
          <div className="h-10 bg-[#2a2a2a] rounded animate-pulse w-40" />
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight">
              ${account?.portfolioValue?.toLocaleString() || '0'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-medium ${dailyChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%)
              </span>
              <span className="text-[#9e9e9e] text-xs">Today</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="t212-card">
          <p className="text-[#9e9e9e] text-xs mb-1">Cash</p>
          <p className="text-xl font-semibold">${account?.cash?.toLocaleString() || '0'}</p>
        </div>
        <div className="t212-card">
          <p className="text-[#9e9e9e] text-xs mb-1">Buying Power</p>
          <p className="text-xl font-semibold">${account?.buyingPower?.toLocaleString() || '0'}</p>
        </div>
      </div>

      {/* Market Status */}
      <div className="t212-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${marketOpen ? 'bg-[#00c853]' : 'bg-[#ff1744]'} animate-pulse`} />
          <div>
            <p className="font-medium">US Market</p>
            <p className="text-[#9e9e9e] text-xs">{marketOpen ? 'Open' : 'Closed'}</p>
          </div>
        </div>
        <span className="text-xs text-[#9e9e9e]">9:30 AM - 4:00 PM ET</span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/charts" className="t212-card-interactive flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2979ff]/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#2979ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Charts</p>
            <p className="text-[#9e9e9e] text-xs">View markets</p>
          </div>
        </Link>
        <Link href="/positions" className="t212-card-interactive flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00c853]/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00c853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Portfolio</p>
            <p className="text-[#9e9e9e] text-xs">Your holdings</p>
          </div>
        </Link>
      </div>

      {/* Watchlist */}
      <div className="t212-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Watchlist</h2>
          <Link href="/charts" className="text-[#2979ff] text-sm">See all</Link>
        </div>
        <div className="space-y-3">
          {[
            { symbol: 'AAPL', name: 'Apple Inc', price: 178.50, change: 2.35, changePercent: 1.33 },
            { symbol: 'MSFT', name: 'Microsoft', price: 420.15, change: -3.20, changePercent: -0.76 },
            { symbol: 'NVDA', name: 'NVIDIA', price: 875.30, change: 15.40, changePercent: 1.79 },
            { symbol: 'TSLA', name: 'Tesla', price: 175.25, change: -5.10, changePercent: -2.83 },
          ].map(stock => (
            <Link 
              key={stock.symbol}
              href={`/charts?symbol=${stock.symbol}`}
              className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-[#242424] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center font-semibold text-sm">
                  {stock.symbol[0]}
                </div>
                <div>
                  <p className="font-medium">{stock.symbol}</p>
                  <p className="text-[#9e9e9e] text-xs">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${stock.price.toFixed(2)}</p>
                <p className={`text-xs ${stock.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="t212-card border border-[#00c853]/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#00c853] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">AI</span>
          </div>
          <div>
            <p className="font-medium">Adam's Insights</p>
            <p className="text-[#9e9e9e] text-xs">AI-powered analysis</p>
          </div>
        </div>
        <div className="bg-[#0d0d0d] rounded-xl p-3 text-sm text-[#9e9e9e]">
          <p>📊 Market analysis ready. US markets {marketOpen ? 'are open' : 'will open at 9:30 AM ET'}.</p>
          <p className="mt-2">💡 Tip: Check the Learn section to improve your trading knowledge.</p>
        </div>
      </div>

      {/* Paper Trading Notice */}
      <div className="t212-card bg-[#ff9800]/10 border border-[#ff9800]/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <p className="font-medium text-[#ff9800]">Paper Trading Mode</p>
            <p className="text-sm text-[#9e9e9e]">No real money is being used. Practice freely!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
