'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Position {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPl: number;
  unrealizedPlpc: number;
  side: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alpaca/positions')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPositions(data.positions);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalPl = positions.reduce((sum, p) => sum + p.unrealizedPl, 0);
  const totalPlPercent = totalValue > 0 ? (totalPl / (totalValue - totalPl)) * 100 : 0;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-[#1a1a1a]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold">Portfolio</h1>
      </div>

      {/* Portfolio Summary */}
      <div className="t212-card">
        <p className="text-[#9e9e9e] text-sm mb-1">Total Value</p>
        <h2 className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm font-medium ${totalPl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {totalPl >= 0 ? '+' : ''}${totalPl.toFixed(2)} ({totalPlPercent.toFixed(2)}%)
          </span>
          <span className="text-[#9e9e9e] text-xs">All time</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="t212-card text-center">
          <p className="text-[#9e9e9e] text-xs mb-1">Positions</p>
          <p className="text-lg font-semibold">{positions.length}</p>
        </div>
        <div className="t212-card text-center">
          <p className="text-[#9e9e9e] text-xs mb-1">Invested</p>
          <p className="text-lg font-semibold">${(totalValue - totalPl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="t212-card text-center">
          <p className="text-[#9e9e9e] text-xs mb-1">Return</p>
          <p className={`text-lg font-semibold ${totalPl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {totalPlPercent >= 0 ? '+' : ''}{totalPlPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Positions List */}
      <div className="t212-card">
        <h3 className="font-semibold mb-4">Holdings</h3>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-[#2a2a2a] rounded w-20 mb-2" />
                  <div className="h-3 bg-[#2a2a2a] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#9e9e9e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[#9e9e9e] mb-4">No positions yet</p>
            <Link href="/charts" className="t212-btn-primary inline-block">
              Start Trading
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map(pos => (
              <div
                key={pos.symbol}
                className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-[#242424] transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center font-semibold">
                    {pos.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{pos.symbol}</p>
                    <p className="text-[#9e9e9e] text-sm">{pos.qty} shares • ${pos.avgEntryPrice.toFixed(2)} avg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${pos.marketValue.toFixed(2)}</p>
                  <p className={`text-sm ${pos.unrealizedPl >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {pos.unrealizedPl >= 0 ? '+' : ''}${pos.unrealizedPl.toFixed(2)} ({(pos.unrealizedPlpc * 100).toFixed(2)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/journal" className="t212-btn-secondary text-center">
          View History
        </Link>
        <Link href="/charts" className="t212-btn-primary text-center text-black">
          Trade Now
        </Link>
      </div>
    </div>
  );
}
