'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ExternalLink, Plus, Trash2, RefreshCw, Globe, Coins, DollarSign, BarChart3 } from 'lucide-react';

interface Broker {
  id: string;
  name: string;
  description: string;
  icon: string;
  markets: string[];
  features: string[];
  signupUrl: string;
  docsUrl: string;
  connected: boolean;
  status?: 'active' | 'paper' | 'pending' | 'error';
  balance?: number;
  currency?: string;
}

const AVAILABLE_BROKERS: Broker[] = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    description: 'Commission-free US stock & crypto trading API',
    icon: '🦙',
    markets: ['US Stocks', 'Crypto'],
    features: ['Paper Trading', 'Commission Free', 'REST & WebSocket API'],
    signupUrl: 'https://alpaca.markets',
    docsUrl: 'https://docs.alpaca.markets',
    connected: true,
    status: 'paper',
    balance: 100000,
    currency: 'USD',
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    description: 'Professional multi-asset global trading',
    icon: '🏦',
    markets: ['US Stocks', 'UK Stocks', 'EU Stocks', 'Forex', 'Options', 'Futures', 'Commodities'],
    features: ['Global Markets', 'Low Fees', 'Professional Tools', 'Paper Trading'],
    signupUrl: 'https://www.interactivebrokers.com',
    docsUrl: 'https://www.interactivebrokers.com/en/trading/ib-api.php',
    connected: false,
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    description: 'UK-friendly commission-free trading',
    icon: '📊',
    markets: ['US Stocks', 'UK Stocks', 'EU Stocks', 'ETFs'],
    features: ['Commission Free', 'Fractional Shares', 'UK Regulated', 'ISA Available'],
    signupUrl: 'https://www.trading212.com',
    docsUrl: 'https://t212public-api-docs.redoc.ly',
    connected: false,
  },
  {
    id: 'binance',
    name: 'Binance',
    description: 'World\'s largest crypto exchange',
    icon: '🔶',
    markets: ['Crypto', 'Crypto Futures'],
    features: ['500+ Coins', 'Low Fees', 'Spot & Futures', 'Staking'],
    signupUrl: 'https://www.binance.com',
    docsUrl: 'https://binance-docs.github.io/apidocs',
    connected: false,
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'US-regulated crypto exchange',
    icon: '🪙',
    markets: ['Crypto'],
    features: ['US Regulated', 'Easy to Use', 'Institutional Grade'],
    signupUrl: 'https://www.coinbase.com',
    docsUrl: 'https://docs.cloud.coinbase.com',
    connected: false,
  },
  {
    id: 'oanda',
    name: 'OANDA',
    description: 'Professional forex trading',
    icon: '💱',
    markets: ['Forex', 'CFDs'],
    features: ['Tight Spreads', 'No Minimum Deposit', 'Practice Account'],
    signupUrl: 'https://www.oanda.com',
    docsUrl: 'https://developer.oanda.com',
    connected: false,
  },
  {
    id: 'ig',
    name: 'IG',
    description: 'UK-based CFD & spread betting',
    icon: '🇬🇧',
    markets: ['Forex', 'Indices', 'Commodities', 'Stocks CFD', 'Crypto'],
    features: ['UK Regulated', 'Spread Betting (Tax Free)', '17,000+ Markets'],
    signupUrl: 'https://www.ig.com',
    docsUrl: 'https://labs.ig.com/rest-trading-api-reference',
    connected: false,
  },
];

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>(AVAILABLE_BROKERS);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectedBrokers = brokers.filter(b => b.connected);
  const availableBrokers = brokers.filter(b => !b.connected);

  const handleConnect = async (brokerId: string) => {
    setConnecting(true);
    // In real implementation, this would validate and save credentials
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBrokers(brokers.map(b => 
      b.id === brokerId 
        ? { ...b, connected: true, status: 'paper', balance: 10000, currency: 'USD' }
        : b
    ));
    setShowConnectModal(null);
    setApiKey('');
    setSecretKey('');
    setConnecting(false);
  };

  const handleDisconnect = (brokerId: string) => {
    if (confirm('Disconnect this broker?')) {
      setBrokers(brokers.map(b => 
        b.id === brokerId 
          ? { ...b, connected: false, status: undefined, balance: undefined }
          : b
      ));
    }
  };

  const selectedBroker = brokers.find(b => b.id === showConnectModal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <div>
          <h1 className="text-2xl font-bold">Broker Connections</h1>
          <p className="text-slate-400 text-sm">Manage your trading accounts across multiple brokers</p>
        </div>
      </div>

      {/* Connected Brokers */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          Connected ({connectedBrokers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedBrokers.map(broker => (
            <div
              key={broker.id}
              className="bg-slate-800/50 border border-green-500/30 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{broker.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{broker.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      broker.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      broker.status === 'paper' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {broker.status === 'paper' ? '📄 Paper' : '💰 Live'}
                    </span>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              
              {broker.balance !== undefined && (
                <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400">Balance</p>
                  <p className="text-xl font-bold text-white">
                    {broker.currency === 'USD' ? '$' : '£'}{broker.balance.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {broker.markets.map(m => (
                  <span key={m} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                    {m}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition">
                  Trade
                </button>
                <button
                  onClick={() => handleDisconnect(broker.id)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Brokers */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-400" />
          Available Brokers ({availableBrokers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBrokers.map(broker => (
            <div
              key={broker.id}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{broker.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{broker.name}</h3>
                  <p className="text-xs text-slate-400">{broker.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {broker.markets.map(m => (
                  <span key={m} className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                    {m}
                  </span>
                ))}
              </div>

              <ul className="text-xs text-slate-400 space-y-1 mb-4">
                {broker.features.slice(0, 3).map(f => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConnectModal(broker.id)}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition"
                >
                  Connect
                </button>
                <a
                  href={broker.signupUrl}
                  target="_blank"
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Coverage */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🌍 Market Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="font-semibold">50+ Countries</p>
            <p className="text-xs text-slate-400">Global markets</p>
          </div>
          <div className="text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <p className="font-semibold">500+ Crypto</p>
            <p className="text-xs text-slate-400">Via Binance</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="font-semibold">100+ Forex</p>
            <p className="text-xs text-slate-400">Via OANDA/IG</p>
          </div>
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="font-semibold">Commodities</p>
            <p className="text-xs text-slate-400">Oil, Gold, Silver</p>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedBroker.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">Connect {selectedBroker.name}</h3>
                <p className="text-xs text-slate-400">Enter your API credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder="Enter your secret key"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
                <p className="mb-2">📋 How to get API keys:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Sign up at <a href={selectedBroker.signupUrl} target="_blank" className="text-emerald-400">{selectedBroker.name}</a></li>
                  <li>Go to API settings / Developer section</li>
                  <li>Generate new API keys</li>
                  <li>Copy and paste them here</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConnectModal(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConnect(selectedBroker.id)}
                  disabled={!apiKey || !secretKey || connecting}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
