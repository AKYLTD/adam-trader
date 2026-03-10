'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { executeBotCycle, type BotConfig } from '@/lib/tradingEngine';
import { getPortfolio, type PaperTrade } from '@/lib/paperTrading';
import { setBotStatus, getBotStatus } from '@/components/BotIndicator';

interface BotStrategy {
  id: string;
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  icon: string;
}

const STRATEGIES: BotStrategy[] = [
  { id: 'dca', name: 'Dollar Cost Average', description: 'Buy fixed amount at regular intervals', risk: 'low', icon: '📅' },
  { id: 'momentum', name: 'Momentum Trading', description: 'Buy trending stocks, sell when momentum fades', risk: 'medium', icon: '🚀' },
  { id: 'meanreversion', name: 'Mean Reversion', description: 'Buy oversold, sell overbought (RSI based)', risk: 'medium', icon: '📊' },
  { id: 'breakout', name: 'Breakout Trading', description: 'Buy when price breaks resistance', risk: 'high', icon: '💥' },
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

  // Load bot state and trades on mount
  useEffect(() => {
    const status = getBotStatus();
    setBotEnabled(status.active);
    
    const savedStrategies = localStorage.getItem('botStrategies');
    if (savedStrategies) {
      setSelectedStrategies(JSON.parse(savedStrategies));
    }
    
    loadStats();
  }, []);

  const loadStats = () => {
    const portfolio = getPortfolio();
    setRecentTrades(portfolio.trades.slice(-10).reverse());
    
    const sells = portfolio.trades.filter(t => t.type === 'sell' && t.pnl !== undefined);
    const wins = sells.filter(t => (t.pnl || 0) > 0);
    const totalPnl = sells.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    setStats({
      trades: portfolio.trades.length,
      profit: totalPnl,
      winRate: sells.length > 0 ? (wins.length / sells.length) * 100 : 0,
    });
  };

  // Run bot when enabled
  useEffect(() => {
    if (botEnabled) {
      // Execute immediately
      runBotCycle();
      
      // Then run every 5 seconds
      intervalRef.current = setInterval(runBotCycle, 5000);
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
    
    executeBotCycle(config);
    loadStats();
    
    // Update global status
    const portfolio = getPortfolio();
    setBotStatus(true, portfolio.trades.length);
  };

  const toggleStrategy = (id: string) => {
    if (botEnabled) return;
    
    let newStrategies: string[];
    if (selectedStrategies.includes(id)) {
      if (selectedStrategies.length > 1) {
        newStrategies = selectedStrategies.filter(s => s !== id);
      } else {
        return; // Must have at least one
      }
    } else {
      newStrategies = [...selectedStrategies, id];
    }
    
    setSelectedStrategies(newStrategies);
    localStorage.setItem('botStrategies', JSON.stringify(newStrategies));
  };

  const handleToggleBot = () => {
    if (!botEnabled) {
      setShowConfirm(true);
    } else {
      setBotEnabled(false);
      setBotStatus(false, stats.trades);
      localStorage.setItem('botActive', 'false');
    }
  };

  const confirmStart = () => {
    setBotEnabled(true);
    setBotStatus(true, stats.trades);
    localStorage.setItem('botActive', 'true');
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
          <p className="text-xs text-[#636366]">Auto trades every 5 seconds</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          botEnabled 
            ? 'bg-[#00d632] text-black animate-pulse' 
            : 'bg-[#636366]/20 text-[#636366]'
        }`}>
          {botEnabled ? '🟢 RUNNING' : '⚪ STOPPED'}
        </div>
      </div>

      {/* Big Control Button */}
      <div className={`card ${botEnabled ? 'bg-[#00d632]/10 border-2 border-[#00d632]' : 'border border-[#262626]'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
            botEnabled ? 'bg-[#00d632]/20 animate-bounce' : 'bg-[#1a1a1a]'
          }`}>
            🤖
          </div>
          <div className="flex-1">
            <p className="font-bold text-xl">
              {botEnabled ? 'Bot is Active!' : 'Bot is Off'}
            </p>
            <p className="text-sm text-[#8e8e93]">
              {botEnabled 
                ? `Running ${selectedStrategies.length} strateg${selectedStrategies.length > 1 ? 'ies' : 'y'}` 
                : 'Select strategies and start'}
            </p>
          </div>
          <button
            onClick={handleToggleBot}
            className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all active:scale-95 ${
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
        <div className="card text-center py-4">
          <p className="text-3xl font-bold">{stats.trades}</p>
          <p className="text-xs text-[#636366]">Trades</p>
        </div>
        <div className="card text-center py-4">
          <p className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            ${stats.profit.toFixed(0)}
          </p>
          <p className="text-xs text-[#636366]">P&L</p>
        </div>
        <div className="card text-center py-4">
          <p className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {stats.winRate.toFixed(0)}%
          </p>
          <p className="text-xs text-[#636366]">Win Rate</p>
        </div>
      </div>

      {/* Live Warning */}
      {mode === 'live' && (
        <div className="card bg-[#ff3b30]/10 border border-[#ff3b30]/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold text-[#ff3b30]">LIVE MODE!</p>
              <p className="text-sm text-[#8e8e93]">Bot will trade with REAL money!</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategies */}
      <div>
        <p className="text-xs text-[#636366] font-medium mb-3 px-1">
          STRATEGIES ({selectedStrategies.length} selected)
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
                className={`card w-full text-left transition-all ${
                  selected ? 'border-2 border-[#007aff] bg-[#007aff]/5' : ''
                } ${botEnabled ? 'opacity-50' : 'active:scale-[0.98]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    selected ? 'bg-[#007aff]/20' : 'bg-[#1a1a1a]'
                  }`}>
                    {strategy.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{strategy.name}</p>
                      {selected && <span className="text-[#007aff] text-xl">✓</span>}
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
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Recent Bot Trades</p>
            <Link href="/journal" className="text-sm text-[#007aff]">See all</Link>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded font-semibold ${
                    trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                  }`}>
                    {trade.type === 'buy' ? '🛒 BUY' : '💸 SELL'}
                  </span>
                  <span className="font-medium">{trade.symbol}</span>
                  <span className="text-xs text-[#636366]">×{trade.quantity}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">${trade.price.toFixed(2)}</p>
                  {trade.pnl !== undefined && (
                    <p className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
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
              <div className="w-24 h-24 bg-[#00d632]/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Bot?</h3>
              <p className="text-[#8e8e93]">
                {mode === 'paper' 
                  ? 'Bot will trade with virtual $100,000'
                  : '⚠️ Bot will trade with REAL MONEY!'}
              </p>
              <div className="mt-4 p-3 bg-[#0d0d0d] rounded-xl text-left">
                <p className="text-xs text-[#636366] mb-2">Active Strategies:</p>
                {selectedStrategies.map(id => {
                  const s = STRATEGIES.find(st => st.id === id);
                  return s && <p key={id} className="text-sm font-medium">• {s.icon} {s.name}</p>;
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary py-4">
                Cancel
              </button>
              <button onClick={confirmStart} className="btn bg-[#00d632] text-black font-bold py-4">
                🚀 START
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
