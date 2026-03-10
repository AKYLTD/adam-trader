'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'JPM', name: 'JP Morgan' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq ETF' },
];

export default function ChartsPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [interval, setInterval] = useState('D');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">Charts</h1>
            <p className="text-slate-400 text-sm">Technical analysis powered by TradingView</p>
          </div>
        </div>
      </div>

      {/* Symbol & Interval Selector */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Symbol:</span>
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {SYMBOLS.map(s => (
              <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Interval:</span>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {['1', '5', '15', '60', 'D', 'W'].map(i => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className={`px-3 py-1 rounded text-sm transition ${
                  interval === i ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {i === 'D' ? '1D' : i === 'W' ? '1W' : `${i}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
        <iframe
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${symbol}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=RSI%40tv-basicstudies%2CMACD%40tv-basicstudies&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
          style={{ width: '100%', height: '600px' }}
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Quick Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-3">Indicators</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• RSI (14) - Momentum</li>
            <li>• MACD - Trend</li>
            <li>• Volume - Confirmation</li>
            <li>• Moving Averages</li>
          </ul>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-3">Timeframes</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• 1m/5m - Scalping</li>
            <li>• 15m/1h - Day trading</li>
            <li>• 1D - Swing trading</li>
            <li>• 1W - Position trading</li>
          </ul>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-3">Pro Tips</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• Draw support/resistance</li>
            <li>• Check multiple timeframes</li>
            <li>• Confirm with volume</li>
            <li>• Wait for confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
