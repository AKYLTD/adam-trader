'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BotIndicator() {
  const [botActive, setBotActive] = useState(false);
  const [trades, setTrades] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Check bot status from localStorage
  useEffect(() => {
    const checkBotStatus = () => {
      const status = localStorage.getItem('botActive');
      const tradeCount = localStorage.getItem('botTrades');
      setBotActive(status === 'true');
      setTrades(Number(tradeCount) || 0);
    };

    checkBotStatus();
    const interval = setInterval(checkBotStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Don't show on bot page
  if (pathname === '/bot' || !botActive) {
    return null;
  }

  return (
    <>
      {/* Floating Bot Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="fixed bottom-24 right-4 md:bottom-6 z-50 w-14 h-14 bg-[#00d632] rounded-full shadow-lg shadow-[#00d632]/30 flex items-center justify-center animate-bounce"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="fixed bottom-40 right-4 md:bottom-24 z-50 w-64 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#262626] animate-scale-in">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#00d632] rounded-full animate-pulse" />
                <span className="font-semibold">Bot Running</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-[#636366]"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#0d0d0d] rounded-xl p-2 text-center">
                <p className="text-lg font-bold">{trades}</p>
                <p className="text-xs text-[#636366]">Trades</p>
              </div>
              <div className="bg-[#0d0d0d] rounded-xl p-2 text-center">
                <p className="text-lg font-bold text-[#00d632]">Active</p>
                <p className="text-xs text-[#636366]">Status</p>
              </div>
            </div>

            <Link
              href="/bot"
              className="block w-full py-3 bg-[#262626] rounded-xl text-center font-medium active:scale-95 transition-transform"
            >
              Open Bot Settings
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// Helper to update bot status from bot page
export function setBotStatus(active: boolean, trades: number = 0) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('botActive', String(active));
    localStorage.setItem('botTrades', String(trades));
  }
}

export function getBotStatus(): { active: boolean; trades: number } {
  if (typeof window === 'undefined') {
    return { active: false, trades: 0 };
  }
  return {
    active: localStorage.getItem('botActive') === 'true',
    trades: Number(localStorage.getItem('botTrades')) || 0,
  };
}
