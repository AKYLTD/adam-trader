'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { runSmartBotCycle, type BotConfig } from '@/lib/tradingEngine';
import { getPortfolio, getBotTrades, calculateStats, type PaperTrade } from '@/lib/paperTrading';
import { setBotStatus } from '@/components/BotIndicator';

// More symbols = more opportunities
const BOT_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN', 'AMD', 'NFLX', 'JPM',
  'V', 'MA', 'DIS', 'PYPL', 'INTC', 'WMT', 'PG', 'JNJ', 'UNH', 'HD'
];

type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

const RISK_CONFIG: Record<RiskLevel, { label: string; emoji: string; color: string; bg: string }> = {
  conservative: { label: 'Conservative', emoji: '🛡️', color: 'text-[#00d632]', bg: 'bg-[#00d632]' },
  moderate: { label: 'Moderate', emoji: '⚖️', color: 'text-[#ff9500]', bg: 'bg-[#ff9500]' },
  aggressive: { label: 'Aggressive', emoji: '🔥', color: 'text-[#ff3b30]', bg: 'bg-[#ff3b30]' },
};

export default function BotPage() {
  const mode = useTradingMode();
  const [botEnabled, setBotEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('moderate');
  const [showConfirm, setShowConfirm] = useState(false);
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [stats, setStats] = useState({ trades: 0, profit: 0, winRate: 0 });
  const [lastAction, setLastAction] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load bot state and trades
  useEffect(() => {
    const savedActive = localStorage.getItem('botActive') === 'true';
    const savedRisk = localStorage.getItem('botRiskLevel') as RiskLevel;
    
    setBotEnabled(savedActive);
    if (savedRisk) setRiskLevel(savedRisk);
    
    loadStats();
  }, []);

  const loadStats = () => {
    const botTrades = getBotTrades();
    setRecentTrades(botTrades.slice(-10).reverse());
    
    const botStats = calculateStats('bot');
    setStats({
      trades: botStats.totalTrades,
      profit: botStats.totalPnl,
      winRate: botStats.winRate,
    });
    
    setBotStatus(botEnabled, botStats.totalTrades);
  };

  // Run bot cycle
  const runCycle = async () => {
    setAnalyzing(true);
    setLastAction('🔍 Analyzing market...');
    
    const config: BotConfig = {
      symbols: BOT_SYMBOLS,
      maxPositionSize: riskLevel === 'aggressive' ? 15000 : riskLevel === 'moderate' ? 8000 : 4000,
      maxPositions: riskLevel === 'aggressive' ? 10 : riskLevel === 'moderate' ? 6 : 3,
      riskLevel,
    };
    
    try {
      const results = await runSmartBotCycle(config);
      
      if (results.length > 0) {
        const actions = results.map(r => 
          `${r.trade?.type === 'buy' ? '🛒' : '💸'} ${r.trade?.type.toUpperCase()} ${r.trade?.symbol}`
        );
        setLastAction(actions.join(' | '));
      } else {
        setLastAction('👀 Watching... No good opportunities');
      }
      
      loadStats();
    } catch (error) {
      setLastAction('❌ Analysis failed');
      console.error('Bot cycle error:', error);
    }
    
    setAnalyzing(false);
  };

  // Bot loop
  useEffect(() => {
    if (botEnabled) {
      runCycle();
      intervalRef.current = setInterval(runCycle, 15000); // Every 15 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLastAction('');
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [botEnabled, riskLevel]);

  const handleToggleBot = () => {
    if (!botEnabled) {
      setShowConfirm(true);
    } else {
      setBotEnabled(false);
      localStorage.setItem('botActive', 'false');
      setBotStatus(false, stats.trades);
    }
  };

  const confirmStart = () => {
    setBotEnabled(true);
    localStorage.setItem('botActive', 'true');
    localStorage.setItem('botRiskLevel', riskLevel);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🤖 Smart Trading Bot</h1>
          <p className="text-xs text-[#636366]">AI-powered technical analysis</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${
          botEnabled 
            ? 'bg-[#00d632] text-black animate-pulse' 
            : 'bg-[#262626] text-[#636366]'
        }`}>
          {botEnabled ? '🟢 LIVE' : '⚪ OFF'}
        </div>
      </div>

      {/* Main Control */}
      <div className={`card ${botEnabled ? 'bg-[#00d632]/10 border-2 border-[#00d632]' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
            botEnabled ? 'bg-[#00d632]/20' : 'bg-[#1a1a1a]'
          }`}>
            {analyzing ? '🔍' : '🤖'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-xl">
              {botEnabled ? (analyzing ? 'Analyzing...' : 'Bot Active') : 'Bot Ready'}
            </p>
            <p className="text-sm text-[#8e8e93]">
              {lastAction || 'Start the bot to begin smart trading'}
            </p>
          </div>
          <button
            onClick={handleToggleBot}
            className={`px-8 py-4 rounded-2xl font-bold text-xl ${
              botEnabled ? 'bg-[#ff3b30] text-white' : 'bg-[#00d632] text-black'
            }`}
          >
            {botEnabled ? 'STOP' : 'START'}
          </button>
        </div>
      </div>

      {/* Bot Stats (Bot trades only!) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-4">
          <p className="text-3xl font-bold">{stats.trades}</p>
          <p className="text-xs text-[#636366]">Bot Trades</p>
        </div>
        <div className="card text-center py-4">
          <p className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            ${stats.profit.toFixed(0)}
          </p>
          <p className="text-xs text-[#636366]">Bot P&L</p>
        </div>
        <div className="card text-center py-4">
          <p className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            {stats.winRate.toFixed(0)}%
          </p>
          <p className="text-xs text-[#636366]">Win Rate</p>
        </div>
      </div>

      {/* Risk Level */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-3">RISK LEVEL</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(RISK_CONFIG) as RiskLevel[]).map(level => (
            <button
              key={level}
              onClick={() => !botEnabled && setRiskLevel(level)}
              disabled={botEnabled}
              className={`p-3 rounded-xl text-center transition-all ${
                riskLevel === level 
                  ? `${RISK_CONFIG[level].bg} text-black font-bold`
                  : 'bg-[#1a1a1a]'
              } ${botEnabled ? 'opacity-50' : ''}`}
            >
              <span className="text-2xl block mb-1">{RISK_CONFIG[level].emoji}</span>
              <span className="text-sm">{RISK_CONFIG[level].label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-[#636366] mt-3 text-center">
          {riskLevel === 'conservative' && '🛡️ Lower risk, smaller positions, strict stop-loss'}
          {riskLevel === 'moderate' && '⚖️ Balanced approach, medium positions'}
          {riskLevel === 'aggressive' && '🔥 Higher risk, larger positions, more trades'}
        </p>
      </div>

      {/* What Bot Analyzes */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-3">🧠 BOT STRATEGY</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Buy the Dip (down 1.5%+ = buy signal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Sell the Rally (up 2%+ = sell signal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Auto Take Profit at +3%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Auto Stop-Loss at -2%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Scans {BOT_SYMBOLS.length} stocks every 15s</span>
          </div>
        </div>
      </div>

      {/* Mode Warning */}
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

      {/* Recent Bot Trades */}
      {recentTrades.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">🤖 Bot Trade History</p>
            <Link href="/journal" className="text-sm text-[#007aff]">All trades</Link>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded font-bold ${
                    trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                  }`}>
                    {trade.type === 'buy' ? '🛒 BUY' : '💸 SELL'}
                  </span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">${trade.price.toFixed(2)}</p>
                  {trade.pnl !== undefined && (
                    <p className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
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
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-[#00d632]/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-6xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Smart Bot?</h3>
              <p className="text-[#8e8e93]">
                {mode === 'paper' 
                  ? 'Bot will analyze markets and trade with virtual money'
                  : '⚠️ Bot will trade with REAL money!'}
              </p>
              <div className="mt-4 p-3 bg-[#0d0d0d] rounded-xl">
                <p className="text-sm">Risk: <span className={RISK_CONFIG[riskLevel].color}>{RISK_CONFIG[riskLevel].label}</span></p>
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
