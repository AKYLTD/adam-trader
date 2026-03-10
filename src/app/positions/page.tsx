'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TradingModeToggle } from '@/components/TradingMode';

interface Position {
  symbol: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlpc: number;
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
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Portfolio</h1>
        <Link href="/journal" className="text-sm text-[#007aff] font-medium">History</Link>
      </div>

      {/* Total Value */}
      <div className="card">
        <p className="text-[#636366] text-xs mb-1">Total Value</p>
        {loading ? (
          <div className="skeleton h-10 w-36" />
        ) : (
          <h2 className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${totalPl >= 0 ? 'bg-[#00d632]/15 text-[#00d632]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'}`}>
            {totalPl >= 0 ? '+' : ''}${totalPl.toFixed(2)} ({totalPlPercent.toFixed(2)}%)
          </span>
          <span className="text-[#636366] text-xs">all time</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{positions.length}</p>
          <p className="text-[#636366] text-xs">Holdings</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">${(totalValue - totalPl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-[#636366] text-xs">Invested</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${totalPl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {totalPlPercent >= 0 ? '+' : ''}{totalPlPercent.toFixed(1)}%
          </p>
          <p className="text-[#636366] text-xs">Return</p>
        </div>
      </div>

      {/* Holdings */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Holdings</h3>
          <Link 
            href="/charts" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00d632] active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-16 mb-2" />
                  <div className="skeleton h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[#8e8e93] mb-4">No positions yet</p>
            <Link href="/charts" className="btn btn-primary btn-small inline-flex">
              Start Trading
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {positions.map((pos, i) => (
              <div
                key={pos.symbol}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl active:bg-[#1c1c1c] transition-colors"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="w-12 h-12 bg-[#1c1c1c] rounded-full flex items-center justify-center font-bold">
                  {pos.symbol.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{pos.symbol}</p>
                  <p className="text-xs text-[#636366]">{pos.qty} × ${pos.avgEntryPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${pos.marketValue.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${pos.unrealizedPl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {pos.unrealizedPl >= 0 ? '+' : ''}${pos.unrealizedPl.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/charts" className="btn btn-primary text-black">
          Buy
        </Link>
        <Link href="/charts" className="btn btn-secondary border border-[#ff3b30] text-[#ff3b30]">
          Sell
        </Link>
      </div>
    </div>
  );
}
