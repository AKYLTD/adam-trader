'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { runSmartBotCycle, type BotConfig } from '@/lib/tradingEngine';
import { getPortfolio, getBotTrades, calculateStats, type PaperTrade } from '@/lib/paperTrading';

const BOT_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN', 'AMD', 'NFLX', 'JPM',
  'V', 'MA', 'DIS', 'PYPL', 'INTC', 'WMT', 'PG', 'JNJ', 'UNH', 'HD'
];

type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'buy' | 'sell' | 'analysis' | 'error';
  message: string;
  details?: string;
}

export default function BotPage() {
  const mode = useTradingMode();
  const [botEnabled, setBotEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('aggressive');
  const [recentTrades, setRecentTrades] = useState<PaperTrade[]>([]);
  const [stats, setStats] = useState({ trades: 0, profit: 0, winRate: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      message,
      details,
    };
    setLogs(prev => [...prev.slice(-50), entry]); // Keep last 50 logs
  };

  useEffect(() => {
    const savedActive = localStorage.getItem('botActive') === 'true';
    const savedRisk = localStorage.getItem('botRiskLevel') as RiskLevel;
    setBotEnabled(savedActive);
    if (savedRisk) setRiskLevel(savedRisk);
    loadStats();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadStats = () => {
    const botTrades = getBotTrades();
    setRecentTrades(botTrades.slice(-10).reverse());
    const botStats = calculateStats('bot');
    setStats({
      trades: botStats.totalTrades,
      profit: botStats.totalPnl,
      winRate: botStats.winRate,
    });
  };

  const runCycle = async () => {
    if (analyzing) return; // Prevent overlapping cycles
    setAnalyzing(true);
    
    const config: BotConfig = {
      symbols: BOT_SYMBOLS,
      maxPositionSize: riskLevel === 'aggressive' ? 15000 : riskLevel === 'moderate' ? 8000 : 4000,
      maxPositions: riskLevel === 'aggressive' ? 10 : riskLevel === 'moderate' ? 6 : 3,
      riskLevel,
    };

    try {
      // Fetch prices
      const priceRes = await fetch(`/api/prices?symbols=${BOT_SYMBOLS.join(',')}`, { cache: 'no-store' });
      
      if (!priceRes.ok) {
        addLog('error', '⚠️ API unavailable', 'Retrying...');
        setAnalyzing(false);
        return;
      }
      
      const priceData = await priceRes.json();
      
      if (!priceData.prices || priceData.prices.length === 0) {
        addLog('info', '⏳ Waiting for data...', '');
        setAnalyzing(false);
        return;
      }

      const redStocks = priceData.prices.filter((p: any) => p.changePercent < 0);
      const greenStocks = priceData.prices.filter((p: any) => p.changePercent >= 0);
      
      const topRed = redStocks.slice(0, 3).map((s: any) => 
        `${s.symbol} ${s.changePercent.toFixed(1)}%`
      ).join(', ');
      
      addLog('analysis', `📊 ${redStocks.length} red / ${greenStocks.length} green`, topRed || 'All stocks green');

      const results = await runSmartBotCycle(config);
      
      for (const result of results) {
        if (result.success && result.trade) {
          const t = result.trade;
          if (t.type === 'buy') {
            addLog('buy', `🛒 BUY ${t.quantity} ${t.symbol} @ $${t.price.toFixed(2)}`, t.strategy || '');
          } else {
            const pnl = t.pnl || 0;
            addLog('sell', `💸 SELL ${t.quantity} ${t.symbol} @ $${t.price.toFixed(2)}`, 
              `P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
          }
        }
      }
      
      if (results.length === 0) {
        const portfolio = getPortfolio();
        addLog('info', '👀 Watching', `Balance: $${portfolio.balance.toFixed(0)} | Positions: ${portfolio.positions.length}`);
      }
      
      loadStats();
    } catch (error) {
      console.error('Bot cycle error:', error);
      addLog('info', '⏳ Retrying...', '');
    }
    
    setAnalyzing(false);
  };

  useEffect(() => {
    if (botEnabled) {
      addLog('info', '🚀 Bot started', `Risk: ${riskLevel}`);
      runCycle();
      intervalRef.current = setInterval(runCycle, 15000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [botEnabled, riskLevel]);

  const toggleBot = () => {
    const newState = !botEnabled;
    setBotEnabled(newState);
    localStorage.setItem('botActive', String(newState));
    localStorage.setItem('botRiskLevel', riskLevel);
    if (!newState) {
      addLog('info', '⏹️ Bot stopped', '');
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom pb-20">
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🤖 Trading Bot</h1>
          <p className="text-xs text-[#636366]">AI-powered auto trading</p>
        </div>
        <button
          onClick={toggleBot}
          className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
            botEnabled 
              ? 'bg-[#ff3b30] text-white' 
              : 'bg-[#00d632] text-black'
          }`}
        >
          {botEnabled ? '⏹ STOP' : '▶ START'}
        </button>
      </div>

      {/* Status Card */}
      <div className={`card ${botEnabled ? 'bg-[#00d632]/10 border-2 border-[#00d632]' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
            botEnabled ? 'bg-[#00d632]/20' : 'bg-[#1a1a1a]'
          } ${analyzing ? 'animate-pulse' : ''}`}>
            {analyzing ? '🔍' : botEnabled ? '🤖' : '💤'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-xl">
              {botEnabled ? (analyzing ? 'Analyzing...' : 'Running') : 'Stopped'}
            </p>
            <p className="text-sm text-[#8e8e93]">
              {botEnabled ? `Scanning ${BOT_SYMBOLS.length} stocks every 15s` : 'Press START to begin'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            botEnabled ? 'bg-[#00d632] text-black' : 'bg-[#262626] text-[#636366]'
          }`}>
            {botEnabled ? '🟢 LIVE' : '⚫ OFF'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{stats.trades}</p>
          <p className="text-xs text-[#636366]">Trades</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
            ${Math.abs(stats.profit).toFixed(0)}
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

      {/* Risk Level */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-2">RISK LEVEL</p>
        <div className="grid grid-cols-3 gap-2">
          {(['conservative', 'moderate', 'aggressive'] as RiskLevel[]).map(level => (
            <button
              key={level}
              onClick={() => !botEnabled && setRiskLevel(level)}
              disabled={botEnabled}
              className={`p-2 rounded-xl text-center transition-all ${
                riskLevel === level 
                  ? level === 'aggressive' ? 'bg-[#ff3b30] text-white' 
                    : level === 'moderate' ? 'bg-[#ff9500] text-black'
                    : 'bg-[#00d632] text-black'
                  : 'bg-[#1a1a1a]'
              } ${botEnabled ? 'opacity-50' : ''}`}
            >
              <span className="text-lg">{level === 'conservative' ? '🛡️' : level === 'moderate' ? '⚖️' : '🔥'}</span>
              <p className="text-xs mt-1 capitalize">{level}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Activity Log */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold">📋 Live Activity</p>
          <button onClick={() => setLogs([])} className="text-xs text-[#636366]">Clear</button>
        </div>
        <div className="bg-[#0d0d0d] rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <p className="text-[#636366] text-center py-8">Bot activity will appear here...</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className={`flex gap-2 ${
                log.type === 'buy' ? 'text-[#00d632]' : 
                log.type === 'sell' ? 'text-[#ff9500]' : 
                log.type === 'error' ? 'text-[#ff3b30]' :
                log.type === 'analysis' ? 'text-[#007aff]' : 'text-[#8e8e93]'
              }`}>
                <span className="text-[#636366] flex-shrink-0">{formatTime(log.timestamp)}</span>
                <span>{log.message}</span>
                {log.details && <span className="text-[#636366]">| {log.details}</span>}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Recent Bot Trades */}
      {recentTrades.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">🤖 Recent Bot Trades</p>
            <Link href="/journal" className="text-xs text-[#007aff]">View All →</Link>
          </div>
          <div className="space-y-2">
            {recentTrades.slice(0, 5).map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-2 bg-[#0d0d0d] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    trade.type === 'buy' ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff9500]/20 text-[#ff9500]'
                  }`}>
                    {trade.type === 'buy' ? '🛒' : '💸'}
                  </span>
                  <span className="font-medium">{trade.symbol}</span>
                  <span className="text-xs text-[#636366]">x{trade.quantity}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">${trade.price.toFixed(2)}</p>
                  {trade.pnl !== undefined && (
                    <p className={`text-xs font-bold ${trade.pnl >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Info */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-2">🧠 STRATEGY</p>
        <div className="text-sm space-y-1">
          <p>📉 <span className="text-[#00d632]">Buy</span> any red stock (down today)</p>
          <p>📈 <span className="text-[#ff9500]">Sell</span> at +3% profit or -2% stop loss</p>
          <p>⏱️ Scans every 15 seconds</p>
        </div>
      </div>
    </div>
  );
}
