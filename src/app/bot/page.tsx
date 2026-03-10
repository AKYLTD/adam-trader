'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';

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
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleBot = () => {
    if (!botEnabled && !selectedStrategy) {
      alert('Please select a strategy first');
      return;
    }
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
          <p className="text-xs text-[#636366]">Automated trading strategies</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          botEnabled 
            ? 'bg-[#00d632]/15 text-[#00d632]' 
            : 'bg-[#636366]/15 text-[#636366]'
        }`}>
          {botEnabled ? '● Running' : '○ Stopped'}
        </div>
      </div>

      {/* Bot Status Card */}
      <div className={`card ${botEnabled ? 'bg-[#00d632]/10 border border-[#00d632]/30' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              botEnabled ? 'bg-[#00d632]/20' : 'bg-[#1a1a1a]'
            }`}>
              🤖
            </div>
            <div>
              <p className="font-semibold">
                {botEnabled ? 'Bot is Trading' : 'Bot is Off'}
              </p>
              <p className="text-xs text-[#636366]">
                {botEnabled 
                  ? `Using ${STRATEGIES.find(s => s.id === selectedStrategy)?.name}` 
                  : 'Select a strategy to start'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleBot}
            className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 ${
              botEnabled 
                ? 'bg-[#ff3b30] text-white' 
                : 'bg-[#00d632] text-black'
            }`}
          >
            {botEnabled ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Mode Warning */}
      {mode === 'live' && (
        <div className="card bg-[#ff3b30]/10 border border-[#ff3b30]/30">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-[#ff3b30]">Live Mode Active</p>
              <p className="text-xs text-[#8e8e93]">Bot will trade with real money!</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategies */}
      <div>
        <p className="text-xs text-[#636366] font-medium mb-3 px-1">SELECT STRATEGY</p>
        <div className="space-y-2">
          {STRATEGIES.map(strategy => {
            const selected = selectedStrategy === strategy.id;
            const risk = RISK_COLORS[strategy.risk];
            return (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                disabled={botEnabled}
                className={`card w-full text-left transition-all active:scale-[0.98] ${
                  selected ? 'border-2 border-[#007aff]' : ''
                } ${botEnabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-2xl">
                    {strategy.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{strategy.name}</p>
                      {selected && <span className="text-[#007aff]">✓</span>}
                    </div>
                    <p className="text-sm text-[#8e8e93]">{strategy.description}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
                      {risk.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bot Stats */}
      {botEnabled && (
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-[#636366]">Trades</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-[#00d632]">$0</p>
            <p className="text-xs text-[#636366]">Profit</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-[#636366]">Win Rate</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card bg-[#007aff]/10 border border-[#007aff]/30">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-semibold text-[#007aff]">How it works</p>
            <p className="text-sm text-[#8e8e93] mt-1">
              The bot monitors markets and executes trades based on your selected strategy. 
              In Paper mode, it uses virtual money. In Live mode, it trades real funds.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#007aff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Trading Bot?</h3>
              <p className="text-sm text-[#8e8e93]">
                {mode === 'paper' 
                  ? 'The bot will trade with virtual money.'
                  : 'The bot will trade with REAL MONEY!'}
              </p>
              <p className="text-sm mt-2">
                Strategy: <span className="font-semibold">{STRATEGIES.find(s => s.id === selectedStrategy)?.name}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmStart} className="btn bg-[#00d632] text-black font-semibold">
                Start Bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
