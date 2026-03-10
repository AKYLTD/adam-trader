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
    // Check every 500ms for responsiveness
    const interval = setInterval(checkBotStatus, 500);
    return () => clearInterval(interval);
  }, []);

  // Don't show on bot page or if not active
  if (pathname === '/bot' || !botActive) {
    return null;
  }

  return (
    <>
      {/* Floating Bot Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="fixed bottom-24 right-4 md:bottom-8 z-[60] w-16 h-16 bg-[#00d632] rounded-2xl shadow-lg shadow-[#00d632]/40 flex items-center justify-center"
        style={{ animation: 'bounce 1s infinite' }}
      >
        <span className="text-3xl">🤖</span>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff3b30] rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{trades}</span>
        </div>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[59]"
            onClick={() => setExpanded(false)}
          />
          
          {/* Panel */}
          <div className="fixed bottom-44 right-4 md:bottom-28 z-[60] w-72 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#262626] animate-scale-in">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00d632] rounded-full animate-pulse" />
                  <span className="font-bold text-lg">Bot Running</span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626]"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-[#0d0d0d] rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{trades}</p>
                    <p className="text-xs text-[#636366]">Total Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00d632]">Active</p>
                    <p className="text-xs text-[#636366]">Status</p>
                  </div>
                </div>
              </div>

              <Link
                href="/bot"
                onClick={() => setExpanded(false)}
                className="block w-full py-4 bg-[#262626] rounded-xl text-center font-semibold active:scale-95 transition-transform"
              >
                ⚙️ Bot Settings
              </Link>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

// Helper to update bot status
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
