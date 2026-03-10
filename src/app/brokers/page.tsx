'use client';

import { useState } from 'react';
import { TradingModeToggle } from '@/components/TradingMode';

interface Broker {
  id: string;
  name: string;
  icon: string;
  markets: string[];
  connected: boolean;
  status?: 'live' | 'paper';
  balance?: number;
  url: string;
}

const BROKERS: Broker[] = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    icon: '🦙',
    markets: ['US Stocks', 'Crypto'],
    connected: true,
    status: 'paper',
    balance: 100000,
    url: 'https://alpaca.markets',
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    icon: '🏦',
    markets: ['Global Stocks', 'Forex', 'Options', 'Futures'],
    connected: false,
    url: 'https://interactivebrokers.com',
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    icon: '📊',
    markets: ['UK/EU Stocks', 'ETFs'],
    connected: false,
    url: 'https://trading212.com',
  },
  {
    id: 'binance',
    name: 'Binance',
    icon: '🔶',
    markets: ['Crypto', 'Futures'],
    connected: false,
    url: 'https://binance.com',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '🪙',
    markets: ['Crypto'],
    connected: false,
    url: 'https://coinbase.com',
  },
  {
    id: 'oanda',
    name: 'OANDA',
    icon: '💱',
    markets: ['Forex', 'CFDs'],
    connected: false,
    url: 'https://oanda.com',
  },
];

export default function BrokersPage() {
  const [brokers, setBrokers] = useState(BROKERS);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connected = brokers.filter(b => b.connected);
  const available = brokers.filter(b => !b.connected);

  const handleConnect = async () => {
    if (!apiKey || !secretKey) return;
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setBrokers(brokers.map(b => 
      b.id === showModal ? { ...b, connected: true, status: 'paper', balance: 10000 } : b
    ));
    setShowModal(null);
    setApiKey('');
    setSecretKey('');
    setConnecting(false);
  };

  const selectedBroker = brokers.find(b => b.id === showModal);

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Trading Mode Toggle */}
      <TradingModeToggle />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Brokers</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-[#00d632]/15 text-[#00d632] font-medium">
          {connected.length} connected
        </span>
      </div>

      {/* Connected */}
      {connected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#636366] font-medium px-1">CONNECTED</p>
          {connected.map(broker => (
            <div key={broker.id} className="card flex items-center gap-3">
              <span className="text-3xl">{broker.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{broker.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${broker.status === 'paper' ? 'bg-[#ff9500]/15 text-[#ff9500]' : 'bg-[#00d632]/15 text-[#00d632]'}`}>
                    {broker.status === 'paper' ? 'Paper' : 'Live'}
                  </span>
                </div>
                <p className="text-xs text-[#636366]">{broker.markets.join(' • ')}</p>
              </div>
              {broker.balance && (
                <div className="text-right">
                  <p className="font-semibold">${broker.balance.toLocaleString()}</p>
                  <p className="text-xs text-[#636366]">Balance</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Available */}
      <div className="space-y-2">
        <p className="text-xs text-[#636366] font-medium px-1">AVAILABLE</p>
        {available.map(broker => (
          <button
            key={broker.id}
            onClick={() => setShowModal(broker.id)}
            className="card w-full flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <span className="text-3xl">{broker.icon}</span>
            <div className="flex-1">
              <p className="font-semibold">{broker.name}</p>
              <p className="text-xs text-[#636366]">{broker.markets.join(' • ')}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626]">
              <svg className="w-4 h-4 text-[#00d632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedBroker && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-[#1a1a1a] w-full md:w-[400px] md:rounded-2xl rounded-t-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedBroker.icon}</span>
                <p className="font-semibold">{selectedBroker.name}</p>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626] active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-[#636366] mb-2 block">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter API key"
                  className="w-full bg-[#0d0d0d] rounded-xl p-3 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#00d632]/50"
                />
              </div>
              <div>
                <label className="text-xs text-[#636366] mb-2 block">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder="Enter secret key"
                  className="w-full bg-[#0d0d0d] rounded-xl p-3 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#00d632]/50"
                />
              </div>

              <a
                href={selectedBroker.url}
                target="_blank"
                className="flex items-center justify-center gap-2 text-sm text-[#007aff]"
              >
                Get API keys
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                onClick={handleConnect}
                disabled={!apiKey || !secretKey || connecting}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {connecting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
