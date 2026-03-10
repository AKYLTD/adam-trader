'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Shield, Brain, Clock, AlertTriangle, CheckCircle, Play, Pause, Settings, Info } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface Signal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
  indicators: string[];
  riskReward: string;
  timestamp: Date;
}

const FOCUS_OPTIONS = [
  { id: 'tech', name: 'Technology', symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] },
  { id: 'energy', name: 'Energy', symbols: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'] },
  { id: 'finance', name: 'Financials', symbols: ['JPM', 'BAC', 'GS', 'MS', 'WFC'] },
  { id: 'healthcare', name: 'Healthcare', symbols: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK'] },
  { id: 'consumer', name: 'Consumer', symbols: ['AMZN', 'TSLA', 'WMT', 'HD', 'NKE'] },
];

export default function TradingDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [isPaperTrading, setIsPaperTrading] = useState(true);
  const [focus, setFocus] = useState<string[]>(['tech']);
  const [riskPerTrade, setRiskPerTrade] = useState(1);
  const [maxDailyRisk, setMaxDailyRisk] = useState(5);
  const [thoughts, setThoughts] = useState<string[]>([
    "🔍 Pre-market scan starting...",
    "📊 Checking overnight market movements...",
    "🌏 Asian markets closed mixed, Europe slightly up",
    "📰 No major economic events today",
    "🎯 Focus: Technology sector selected",
    "⏳ Waiting for market open (9:30 AM ET)..."
  ]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Simulated account data
  const account = {
    balance: 10000,
    dayPnl: 0,
    totalPnl: 0,
    winRate: 0,
    trades: 0,
  };

  const addThought = (thought: string) => {
    setThoughts(prev => [...prev.slice(-9), thought]);
  };

  const toggleFocus = (id: string) => {
    setFocus(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isPaperTrading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isPaperTrading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
            {isPaperTrading ? '📄 Paper Trading' : '💰 Live Trading'}
          </div>
          <div className="text-sm text-slate-400">
            Market: <span className="text-white">Pre-Market</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isLive 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Pause Bot' : 'Start Bot'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account & Focus */}
        <div className="space-y-6">
          {/* Account Summary */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Account
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Balance
                  <InfoTooltip term="Balance" definition="Your total account value in cash, not including any open positions." />
                </span>
                <span className="text-white font-mono">£{account.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today P&L</span>
                <span className={account.dayPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  £{account.dayPnl.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Win Rate
                  <InfoTooltip term="Win Rate" definition="The percentage of your trades that are profitable. A 45% win rate can still be profitable with good risk/reward." />
                </span>
                <span className="text-white">{account.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Trades</span>
                <span className="text-white">{account.trades}</span>
              </div>
            </div>
          </div>

          {/* Focus Selection */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Focus Sectors
            </h2>
            <div className="space-y-2">
              {FOCUS_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleFocus(option.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                    focus.includes(option.id)
                      ? 'bg-emerald-500/20 border border-emerald-500/50'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  <span className={focus.includes(option.id) ? 'text-emerald-400' : 'text-slate-300'}>
                    {option.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {option.symbols.length} stocks
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Settings */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Risk Management
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Risk per Trade: {riskPerTrade}%
                  <InfoTooltip term="Risk per Trade" definition="The maximum percentage of your account you're willing to lose on a single trade. Professional traders risk 1-2% per trade." example="With $10,000 and 1% risk, max loss is $100 per trade." />
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={riskPerTrade}
                  onChange={e => setRiskPerTrade(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Max loss: £{(account.balance * riskPerTrade / 100).toFixed(2)}/trade
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Max Daily Risk: {maxDailyRisk}%
                  <InfoTooltip term="Max Daily Risk" definition="Stop trading for the day after losing this percentage. Prevents emotional revenge trading after losses." example="With 5% daily max, stop trading after losing $500 on a $10,000 account." />
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={maxDailyRisk}
                  onChange={e => setMaxDailyRisk(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Daily limit: £{(account.balance * maxDailyRisk / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - AI Thoughts */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Commentary */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-400" />
              Adam's Thoughts
              <span className="text-xs text-slate-500 ml-auto">Live Commentary</span>
            </h2>
            <div className="bg-slate-900/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm space-y-2">
              {thoughts.map((thought, i) => (
                <div 
                  key={i} 
                  className={`${i === thoughts.length - 1 ? 'text-emerald-400' : 'text-slate-400'}`}
                >
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {thought}
                </div>
              ))}
              <div className="text-emerald-400 animate-pulse">▌</div>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Trading Signals
            </h2>
            {signals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for market open...</p>
                <p className="text-xs text-slate-500 mt-1">Signals will appear when opportunities are found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{signal.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                        signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {signal.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{signal.reason}</p>
                    <div className="flex gap-2 mt-2">
                      {signal.indicators.map((ind, j) => (
                        <span key={j} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Positions */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Active Positions
            </h2>
            {positions.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p>No active positions</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-right p-2">Shares</th>
                      <th className="text-right p-2">Avg Price</th>
                      <th className="text-right p-2">Current</th>
                      <th className="text-right p-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="p-2 font-medium">{pos.symbol}</td>
                        <td className="p-2 text-right">{pos.shares}</td>
                        <td className="p-2 text-right">${pos.avgPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">${pos.currentPrice.toFixed(2)}</td>
                        <td className={`p-2 text-right ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Probability Stats */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Probability Engine
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">45%</p>
                <p className="text-xs text-slate-400">Win Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">£500</p>
                <p className="text-xs text-slate-400">Avg Win</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">£200</p>
                <p className="text-xs text-slate-400">Avg Loss</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">+£115</p>
                <p className="text-xs text-slate-400">Expected Value</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Formula: (0.45 × £500) - (0.55 × £200) = £225 - £110 = <span className="text-emerald-400">+£115 per trade</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
