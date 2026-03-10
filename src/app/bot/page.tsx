'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { executeBotCycle, type BotConfig } from '@/lib/tradingEngine';
import { getPortfolio, type PaperTrade } from '@/lib/paperTrading';

interface BotStrategy {
  id: string;
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  icon: string;
}

const STRATEGIES: BotStrategy[] = [
  { 
    id: 'dca', 
    name: 'Dollar Cost Average', 
    description: 'Buy fixed amount at regular intervals',
    risk: 'low',
    icon: '📅'
  },
  { 
    id: 'momentum', 
    name: 'Momentum Trading', 
    description: 'Buy trending stocks, sell when momentum fades',
    risk: 'medium',
    icon: '🚀'
  },
  { 
    id: 'meanreversion', 
    name: 'Mean Reversion', 
    description: 'Buy oversold, sell overbought (RSI based)',
    risk: 'medium',
    icon: '📊'
  },
  { 
    id: 'breakout', 
    name: 'Breakout Trading', 
    description: 'Buy when price breaks resistance',
    risk: 'high',
    icon: '💥'
  },
];

const RISK_COLORS = {
  low: { bg: 'bg-[#00d632]/15', text: 'text-[#00d632]', label: 'Low Risk' },
  medium: { bg: 'bg-[#ff9500]/15', text: 'text-[#ff9500]', label: 'Medium Risk' },
  high: { bg: 'bg-[#ff3b30]/15', text: 'text-[#ff3b30]', label: 'High Risk' },
};

export default function BotPage() {
  const mode = useTradingMode();
  const [botEnabled, setBotEnabled] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(['momentum']);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [stats, setStats] = useState({ trades: 0, profit: 0, winRate: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent trades
  useEffect(() => {
    const portfolio = getPortfolio();
    setRecentTrades(portfolio.trades.slice(-10).reverse());
    
    const sells = portfolio.trades.filter(t => t.type === 'sell' && t.pnl !== undefined);
    const wins = sells.filter(t => (t.pnl || 0) > 0);
    const totalPnl = sells.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    setStats({
      trades: sells.length,
      profit: totalPnl,
      winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
    });
  }, [botEnabled]);

  // Run bot when enabled
  useEffect(() => {
    if (botEnabled) {
      // Execute immediately
      runBotCycle();
      
      // Then run every 10 seconds
      intervalRef.current = setInterval(runBotCycle, 10000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [botEnabled, selectedStrategies]);

  const runBotCycle = () => {
    const config: BotConfig = {
      strategies: selectedStrategies,
      symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'],
      maxPositionSize: 5000,
      maxPositions: 5,
    };
    
    const results = executeBotCycle(config);
    
    if (results.length > 0) {
      const portfolio = getPortfolio();
      setRecentTrades(portfolio.trades.slice(-10).reverse());
      
      const sells = portfolio.trades.filter(t => t.type === 'sell' && t.pnl !== undefined);
      const wins = sells.filter(t => (t.pnl || 0) > 0);
      const totalPnl = sells.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      setStats({
        trades: sells.length,
        profit: totalPnl,
        winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
      });
    }
  };

  const toggleStrategy = (id: string) => {
    if (botEnabled) return; // Can't change while running
    
    if (selectedStrategies.includes(id)) {
      if (selectedStrategies.length > 1) {
        setSelectedStrategies(selectedStrategies.filter(s => s !== id));
      }
    } else {
      setSelectedStrategies([...selectedStrategies, id]);
    }
  };

  const handleToggleBot = () => {
    if (!botEnabled) {
      setShowConfirm(true);
    } else {
      setBotEnabled(false);
    }
  };

  const confirmStart = () => {
    setBotEnabled(true);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Trading Bot</h1>
          <p className="text-xs text-[#636366]">Auto trades every 10 seconds</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          botEnabled 
            ? 'bg-[#00d632]/15 text-[#00d632] animate-pulse' 
            : 'bg-[#636366]/15 text-[#636366]'
        }`}>
          {botEnabled ? '● Running' : '○ Stopped'}
        </div>
      </div>

      {/* Bot Control Card */}
      <div className={`card ${botEnabled ? 'bg-[#00d632]/10 border border-[#00d632]/30' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
              botEnabled ? 'bg-[#00d632]/20 animate-bounce' : 'bg-[#1a1a1a]'
            }`}>
              🤖
            </div>
            <div>
              <p className="font-semibold text-lg">
                {botEnabled ? 'Bot is Trading!' : 'Bot is Off'}
              </p>
              <p className="text-sm text-[#636366]">
                {botEnabled 
                  ? `${selectedStrategies.length} strateg${selectedStrategies.length > 1 ? 'ies' : 'y'} active` 
                  : 'Select strategies to start'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleBot}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
              botEnabled 
                ? 'bg-[#ff3b30] text-white' 
                : 'bg-[#00d632] text-black'
            }`}
          >
            {botEnabled ? 'STOP' : 'START'}
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{stats.trades}</p>
          <p className="text-xs text-[#636366]">Trades</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            ${stats.profit.toFixed(0)}
          </p>
          <p className="text-xs text-[#636366]">P&L</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {stats.winRate.toFixed(0)}%
          </p>
          <p className="text-xs text-[#636366]">Win Rate</p>
        </div>
      </div>

      {/* Mode Warning */}
      {mode === 'live' && (
        <div className="card bg-[#ff3b30]/10 border border-[#ff3b30]/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-[#ff3b30]">Live Mode Active</p>
              <p className="text-xs text-[#8e8e93]">Bot will trade with REAL money!</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategies */}
      <div>
        <p className="text-xs text-[#636366] font-medium mb-3 px-1">
          SELECT STRATEGIES ({selectedStrategies.length} selected)
        </p>
        <div className="space-y-2">
          {STRATEGIES.map(strategy => {
            const selected = selectedStrategies.includes(strategy.id);
            const risk = RISK_COLORS[strategy.risk];
            return (
              <button
                key={strategy.id}
                onClick={() => toggleStrategy(strategy.id)}
                disabled={botEnabled}
                className={`card w-full text-left transition-all active:scale-[0.98] ${
                  selected ? 'border-2 border-[#007aff]' : ''
                } ${botEnabled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    selected ? 'bg-[#007aff]/20' : 'bg-[#1a1a1a]'
                  }`}>
                    {strategy.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{strategy.name}</p>
                      {selected && <span className="text-[#007aff] text-lg">✓</span>}
                    </div>
                    <p className="text-sm text-[#8e8e93]">{strategy.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${risk.bg} ${risk.text}`}>
                    {risk.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <div className="card">
          <p className="font-semibold mb-3">Recent Trades</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    trade.type === 'buy' ? 'bg-[#00d632]/15 text-[#00d632]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="font-medium">{trade.symbol}</span>
                  <span className="text-xs text-[#636366]">×{trade.quantity}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">${trade.price.toFixed(2)}</p>
                  {trade.pnl !== undefined && (
                    <p className={`text-xs ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#007aff]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Start Trading Bot?</h3>
              <p className="text-sm text-[#8e8e93]">
                {mode === 'paper' 
                  ? 'The bot will trade with virtual money.'
                  : '⚠️ The bot will trade with REAL MONEY!'}
              </p>
              <div className="mt-4 p-3 bg-[#0d0d0d] rounded-xl text-left">
                <p className="text-xs text-[#636366] mb-2">Active Strategies:</p>
                {selectedStrategies.map(id => {
                  const s = STRATEGIES.find(st => st.id === id);
                  return s && (
                    <p key={id} className="text-sm">• {s.icon} {s.name}</p>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmStart} className="btn bg-[#00d632] text-black font-bold">
                Start Bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
