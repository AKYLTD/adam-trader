'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  symbol: string;
  qty: number;
  filledQty: number;
  type: string;
  side: string;
  status: string;
  limitPrice: number | null;
  filledAvgPrice: number | null;
  createdAt: string;
  filledAt: string | null;
}

export default function JournalPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alpaca/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'canceled': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending_new':
      case 'new': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const filledOrders = orders.filter(o => o.status === 'filled');
  const wins = filledOrders.filter(o => o.side === 'sell'); // simplified
  const winRate = filledOrders.length > 0 ? (wins.length / filledOrders.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">Trade Journal</h1>
            <p className="text-slate-400 text-sm">Your trading history and performance</p>
          </div>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Filled</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{filledOrders.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Canceled</p>
          <p className="text-2xl font-bold mt-1 text-red-400">
            {orders.filter(o => o.status === 'canceled').length}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-slate-400">Win Rate</p>
          <p className="text-2xl font-bold mt-1">{winRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No orders yet</p>
            <p className="text-sm mt-2">Place your first trade to start tracking</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Symbol</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Side</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Type</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Qty</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Filled</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Price</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-xs uppercase">{order.status}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{order.symbol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{order.type}</td>
                  <td className="p-4 text-right">{order.qty}</td>
                  <td className="p-4 text-right">{order.filledQty}</td>
                  <td className="p-4 text-right">
                    {order.filledAvgPrice ? `$${order.filledAvgPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4 text-right text-sm text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
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
