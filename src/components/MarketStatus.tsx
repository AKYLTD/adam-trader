'use client';

import { useState, useEffect } from 'react';

interface Market {
  id: string;
  name: string;
  flag: string;
  openHour: number; // UTC
  closeHour: number; // UTC
  days: number[]; // 0=Sun, 1=Mon, etc.
  timezone: string;
}

const MARKETS: Market[] = [
  { id: 'us', name: 'US', flag: '🇺🇸', openHour: 14.5, closeHour: 21, days: [1,2,3,4,5], timezone: 'America/New_York' },
  { id: 'uk', name: 'UK', flag: '🇬🇧', openHour: 8, closeHour: 16.5, days: [1,2,3,4,5], timezone: 'Europe/London' },
  { id: 'eu', name: 'EU', flag: '🇪🇺', openHour: 8, closeHour: 16.5, days: [1,2,3,4,5], timezone: 'Europe/Paris' },
  { id: 'crypto', name: 'Crypto', flag: '₿', openHour: 0, closeHour: 24, days: [0,1,2,3,4,5,6], timezone: 'UTC' },
  { id: 'forex', name: 'Forex', flag: '💱', openHour: 22, closeHour: 22, days: [0,1,2,3,4,5], timezone: 'UTC' }, // 24/5
];

function isMarketOpen(market: Market, now: Date): boolean {
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const utcDay = now.getUTCDay();
  
  // Crypto is always open
  if (market.id === 'crypto') return true;
  
  // Forex is 24/5 (Sun 22:00 UTC to Fri 22:00 UTC)
  if (market.id === 'forex') {
    if (utcDay === 6) return false; // Saturday closed
    if (utcDay === 0 && utcHour < 22) return false; // Sunday before 22:00 closed
    if (utcDay === 5 && utcHour >= 22) return false; // Friday after 22:00 closed
    return true;
  }
  
  // Check if it's a trading day
  if (!market.days.includes(utcDay)) return false;
  
  // Check trading hours
  return utcHour >= market.openHour && utcHour < market.closeHour;
}

function getNextOpen(market: Market, now: Date): string {
  if (isMarketOpen(market, now)) return 'Open now';
  
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();
  
  // Calculate hours until open
  let hoursUntilOpen = 0;
  
  if (market.days.includes(utcDay) && utcHour < market.openHour) {
    // Opens today
    hoursUntilOpen = market.openHour - utcHour;
  } else {
    // Opens on next trading day
    let nextDay = utcDay;
    let daysUntil = 0;
    do {
      nextDay = (nextDay + 1) % 7;
      daysUntil++;
    } while (!market.days.includes(nextDay));
    
    hoursUntilOpen = (24 - utcHour) + (daysUntil - 1) * 24 + market.openHour;
  }
  
  if (hoursUntilOpen < 1) {
    return `Opens in ${Math.round(hoursUntilOpen * 60)}m`;
  } else if (hoursUntilOpen < 24) {
    return `Opens in ${Math.round(hoursUntilOpen)}h`;
  } else {
    const days = Math.floor(hoursUntilOpen / 24);
    return `Opens in ${days}d`;
  }
}

function formatLocalTime(hour: number, timezone: string): string {
  try {
    const date = new Date();
    date.setUTCHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return `${Math.floor(hour)}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`;
  }
}

export function MarketStatusBar() {
  const [now, setNow] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState('');

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const openMarkets = MARKETS.filter(m => isMarketOpen(m, now));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
      {MARKETS.map(market => {
        const open = isMarketOpen(market, now);
        return (
          <div
            key={market.id}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
              open 
                ? 'bg-[#00d632]/15 border border-[#00d632]/30' 
                : 'bg-[#1a1a1a]'
            }`}
          >
            <span>{market.flag}</span>
            <span className={open ? 'text-[#00d632] font-medium' : 'text-[#636366]'}>
              {market.name}
            </span>
            {open ? (
              <div className="w-2 h-2 rounded-full bg-[#00d632] animate-pulse" />
            ) : (
              <span className="text-xs text-[#636366]">{getNextOpen(market, now)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MarketStatusCard() {
  const [now, setNow] = useState(new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const openCount = MARKETS.filter(m => isMarketOpen(m, now)).length;

  return (
    <div className="card">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00d632]/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🌍</span>
          </div>
          <div className="text-left">
            <p className="font-semibold">Markets</p>
            <p className="text-xs text-[#636366]">{openCount}/{MARKETS.length} open</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-[#636366] transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2 animate-slide-down">
          {MARKETS.map(market => {
            const open = isMarketOpen(market, now);
            return (
              <div key={market.id} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{market.flag}</span>
                  <div>
                    <p className="font-medium">{market.name}</p>
                    <p className="text-xs text-[#636366]">
                      {market.id === 'crypto' ? '24/7' : 
                       market.id === 'forex' ? 'Sun 22:00 - Fri 22:00 UTC' :
                       `${formatLocalTime(market.openHour, market.timezone)} - ${formatLocalTime(market.closeHour, market.timezone)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {open ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#00d632]/15 text-[#00d632] font-medium">Open</span>
                  ) : (
                    <span className="text-xs text-[#636366]">{getNextOpen(market, now)}</span>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-[#636366] text-center pt-2">
            Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
      )}
    </div>
  );
}
