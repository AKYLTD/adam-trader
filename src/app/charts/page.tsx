'use client';

import { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Globe, Coins, Fuel, Crown, DollarSign } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'stocks-us',
    name: 'US Stocks',
    icon: <TrendingUp className="w-4 h-4" />,
    symbols: [
      { symbol: 'AAPL', name: 'Apple' },
      { symbol: 'MSFT', name: 'Microsoft' },
      { symbol: 'GOOGL', name: 'Google' },
      { symbol: 'NVDA', name: 'NVIDIA' },
      { symbol: 'TSLA', name: 'Tesla' },
      { symbol: 'AMZN', name: 'Amazon' },
      { symbol: 'META', name: 'Meta' },
      { symbol: 'JPM', name: 'JP Morgan' },
    ],
  },
  {
    id: 'stocks-uk',
    name: 'UK Stocks',
    icon: <Globe className="w-4 h-4" />,
    symbols: [
      { symbol: 'LSE:SHEL', name: 'Shell' },
      { symbol: 'LSE:BP', name: 'BP' },
      { symbol: 'LSE:HSBA', name: 'HSBC' },
      { symbol: 'LSE:ULVR', name: 'Unilever' },
      { symbol: 'LSE:AZN', name: 'AstraZeneca' },
      { symbol: 'LSE:VOD', name: 'Vodafone' },
      { symbol: 'LSE:BARC', name: 'Barclays' },
      { symbol: 'LSE:LLOY', name: 'Lloyds' },
    ],
  },
  {
    id: 'stocks-eu',
    name: 'EU Stocks',
    icon: <Globe className="w-4 h-4" />,
    symbols: [
      { symbol: 'FWB:SAP', name: 'SAP (Germany)' },
      { symbol: 'FWB:SIE', name: 'Siemens' },
      { symbol: 'EURONEXT:MC', name: 'LVMH (France)' },
      { symbol: 'EURONEXT:OR', name: "L'Oreal" },
      { symbol: 'MIL:ENI', name: 'ENI (Italy)' },
      { symbol: 'BME:SAN', name: 'Santander (Spain)' },
    ],
  },
  {
    id: 'indices',
    name: 'Indices',
    icon: <TrendingUp className="w-4 h-4" />,
    symbols: [
      { symbol: 'SPY', name: 'S&P 500 ETF' },
      { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
      { symbol: 'DIA', name: 'Dow Jones ETF' },
      { symbol: 'TVC:UKX', name: 'FTSE 100' },
      { symbol: 'TVC:DAX', name: 'DAX (Germany)' },
      { symbol: 'TVC:CAC40', name: 'CAC 40 (France)' },
      { symbol: 'TVC:NI225', name: 'Nikkei 225 (Japan)' },
      { symbol: 'SSE:000001', name: 'Shanghai Composite' },
    ],
  },
  {
    id: 'crypto',
    name: 'Crypto',
    icon: <Coins className="w-4 h-4" />,
    symbols: [
      { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin' },
      { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum' },
      { symbol: 'BINANCE:SOLUSDT', name: 'Solana' },
      { symbol: 'BINANCE:BNBUSDT', name: 'BNB' },
      { symbol: 'BINANCE:XRPUSDT', name: 'Ripple' },
      { symbol: 'BINANCE:ADAUSDT', name: 'Cardano' },
      { symbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin' },
      { symbol: 'BINANCE:DOTUSDT', name: 'Polkadot' },
    ],
  },
  {
    id: 'commodities',
    name: 'Commodities',
    icon: <Fuel className="w-4 h-4" />,
    symbols: [
      { symbol: 'TVC:USOIL', name: 'Crude Oil WTI' },
      { symbol: 'TVC:UKOIL', name: 'Brent Oil' },
      { symbol: 'COMEX:NG1!', name: 'Natural Gas' },
      { symbol: 'CBOT:ZC1!', name: 'Corn' },
      { symbol: 'CBOT:ZW1!', name: 'Wheat' },
      { symbol: 'CBOT:ZS1!', name: 'Soybeans' },
    ],
  },
  {
    id: 'metals',
    name: 'Precious Metals',
    icon: <Crown className="w-4 h-4" />,
    symbols: [
      { symbol: 'TVC:GOLD', name: 'Gold' },
      { symbol: 'TVC:SILVER', name: 'Silver' },
      { symbol: 'TVC:PLATINUM', name: 'Platinum' },
      { symbol: 'TVC:PALLADIUM', name: 'Palladium' },
      { symbol: 'COMEX:HG1!', name: 'Copper' },
    ],
  },
  {
    id: 'forex',
    name: 'Forex',
    icon: <DollarSign className="w-4 h-4" />,
    symbols: [
      { symbol: 'FX:EURUSD', name: 'EUR/USD' },
      { symbol: 'FX:GBPUSD', name: 'GBP/USD' },
      { symbol: 'FX:USDJPY', name: 'USD/JPY' },
      { symbol: 'FX:USDCHF', name: 'USD/CHF' },
      { symbol: 'FX:AUDUSD', name: 'AUD/USD' },
      { symbol: 'FX:USDCAD', name: 'USD/CAD' },
      { symbol: 'FX:EURGBP', name: 'EUR/GBP' },
      { symbol: 'FX:GBPJPY', name: 'GBP/JPY' },
    ],
  },
];

export default function ChartsPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [symbolName, setSymbolName] = useState('Apple');
  const [interval, setInterval] = useState('D');
  const [category, setCategory] = useState('stocks-us');
  const [searchQuery, setSearchQuery] = useState('');

  const selectSymbol = (sym: string, name: string) => {
    setSymbol(sym);
    setSymbolName(name);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSymbol(searchQuery.toUpperCase());
      setSymbolName(searchQuery.toUpperCase());
    }
  };

  const currentCategory = CATEGORIES.find(c => c.id === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">Market Charts</h1>
            <p className="text-slate-400 text-sm">Stocks, Crypto, Commodities, Forex & more</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search symbol (e.g., AAPL, BTC)"
              className="bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white w-64 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            Go
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-800/50 rounded-xl p-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              category === cat.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Symbol Pills */}
      <div className="flex flex-wrap gap-2">
        {currentCategory?.symbols.map(s => (
          <button
            key={s.symbol}
            onClick={() => selectSymbol(s.symbol, s.name)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              symbol === s.symbol
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Current Symbol & Interval */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
        <div>
          <span className="text-2xl font-bold">{symbol}</span>
          <span className="text-slate-400 ml-2">{symbolName}</span>
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
          {[
            { v: '1', l: '1m' },
            { v: '5', l: '5m' },
            { v: '15', l: '15m' },
            { v: '60', l: '1H' },
            { v: 'D', l: '1D' },
            { v: 'W', l: '1W' },
            { v: 'M', l: '1M' },
          ].map(i => (
            <button
              key={i.v}
              onClick={() => setInterval(i.v)}
              className={`px-3 py-1 rounded text-sm transition ${
                interval === i.v ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {i.l}
            </button>
          ))}
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
        <iframe
          key={`${symbol}-${interval}`}
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${symbol}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1e293b&studies=RSI%40tv-basicstudies%2CMACD%40tv-basicstudies%2CVolume%40tv-basicstudies&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
          style={{ width: '100%', height: '650px' }}
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Market Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-slate-400 mb-2">🇺🇸 US Markets</h3>
          <p className="text-white">9:30 AM - 4:00 PM ET</p>
          <p className="text-xs text-slate-500 mt-1">Pre-market: 4:00 AM</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-slate-400 mb-2">🇬🇧 UK Markets</h3>
          <p className="text-white">8:00 AM - 4:30 PM GMT</p>
          <p className="text-xs text-slate-500 mt-1">LSE trading hours</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-slate-400 mb-2">🪙 Crypto</h3>
          <p className="text-white">24/7</p>
          <p className="text-xs text-slate-500 mt-1">Never closes</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-slate-400 mb-2">💱 Forex</h3>
          <p className="text-white">24/5</p>
          <p className="text-xs text-slate-500 mt-1">Sun 5PM - Fri 5PM ET</p>
        </div>
      </div>
    </div>
  );
}
