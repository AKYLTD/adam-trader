'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

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
  const [error, setError] = useState('');

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alpaca/positions');
      const data = await res.json();
      if (data.success) {
        setPositions(data.positions);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Failed to fetch positions');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalPl = positions.reduce((sum, p) => sum + p.unrealizedPl, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">Positions</h1>
            <p className="text-slate-400 text-sm">Your current holdings</p>
          </div>
        </div>
        <button
          onClick={fetchPositions}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Total Positions</p>
          <p className="text-2xl font-bold mt-1">{positions.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Market Value</p>
          <p className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Unrealized P&L</p>
          <p className={`text-2xl font-bold mt-1 ${totalPl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading positions...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : positions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No open positions</p>
            <p className="text-sm mt-2">Place a trade to see your holdings here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Symbol</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Qty</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Avg Price</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Current</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Market Value</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">P&L</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.symbol} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {pos.unrealizedPl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="font-medium">{pos.symbol}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">{pos.qty}</td>
                  <td className="p-4 text-right">${pos.avgEntryPrice.toFixed(2)}</td>
                  <td className="p-4 text-right">${pos.currentPrice.toFixed(2)}</td>
                  <td className="p-4 text-right">${pos.marketValue.toFixed(2)}</td>
                  <td className={`p-4 text-right ${pos.unrealizedPl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${pos.unrealizedPl.toFixed(2)}
                  </td>
                  <td className={`p-4 text-right ${pos.unrealizedPlpc >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(pos.unrealizedPlpc * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
