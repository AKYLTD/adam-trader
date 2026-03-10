'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type TradingMode = 'paper' | 'live';

export function TradingModeToggle() {
  const [mode, setMode] = useState<TradingMode>('paper');
  const [showConfirm, setShowConfirm] = useState(false);
  const pathname = usePathname();

  // Hide on learn page
  if (pathname.startsWith('/learn')) {
    return null;
  }

  useEffect(() => {
    const saved = localStorage.getItem('tradingMode') as TradingMode;
    if (saved) setMode(saved);
  }, []);

  const handleModeChange = (newMode: TradingMode) => {
    if (newMode === 'live' && mode === 'paper') {
      setShowConfirm(true);
    } else {
      setMode(newMode);
      localStorage.setItem('tradingMode', newMode);
    }
  };

  const confirmLiveMode = () => {
    setMode('live');
    localStorage.setItem('tradingMode', 'live');
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center bg-[#1a1a1a] rounded-2xl p-1.5 w-full max-w-xs mx-auto">
        <button
          onClick={() => handleModeChange('paper')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            mode === 'paper' 
              ? 'bg-[#007aff] text-white shadow-lg shadow-[#007aff]/30' 
              : 'text-[#636366]'
          }`}
        >
          <span className="text-lg">📄</span>
          <span>Paper</span>
        </button>
        <button
          onClick={() => handleModeChange('live')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            mode === 'live' 
              ? 'bg-[#00d632] text-black shadow-lg shadow-[#00d632]/30' 
              : 'text-[#636366]'
          }`}
        >
          <span className="text-lg">💰</span>
          <span>Live</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#ff3b30]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Switch to Live Trading?</h3>
              <p className="text-sm text-[#8e8e93]">
                You will be trading with <span className="text-[#00d632] font-semibold">real money</span>. 
                Make sure you have a broker connected.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmLiveMode}
                className="btn bg-[#00d632] text-black font-semibold"
              >
                Switch to Live
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useTradingMode() {
  const [mode, setMode] = useState<TradingMode>('paper');
  
  useEffect(() => {
    const saved = localStorage.getItem('tradingMode') as TradingMode;
    if (saved) setMode(saved);
    
    const handleStorage = () => {
      const current = localStorage.getItem('tradingMode') as TradingMode;
      if (current) setMode(current);
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  return mode;
}
