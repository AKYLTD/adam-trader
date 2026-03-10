'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'index' | 'forex' | 'commodity';
}

const DEFAULT_ASSETS: Asset[] = [
  { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
];

const BROWSE_ASSETS: Asset[] = [
  // US Stocks
  { symbol: 'AAPL', name: 'Apple', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
  { symbol: 'META', name: 'Meta', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan', type: 'stock' },
  { symbol: 'V', name: 'Visa', type: 'stock' },
  { symbol: 'WMT', name: 'Walmart', type: 'stock' },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'crypto' },
  { symbol: 'BNBUSD', name: 'BNB', type: 'crypto' },
  { symbol: 'XRPUSD', name: 'XRP', type: 'crypto' },
  // Indices
  { symbol: 'SPY', name: 'S&P 500', type: 'index' },
  { symbol: 'QQQ', name: 'Nasdaq 100', type: 'index' },
  { symbol: 'DIA', name: 'Dow Jones', type: 'index' },
  { symbol: 'IWM', name: 'Russell 2000', type: 'index' },
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex' },
  { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex' },
  // Commodities
  { symbol: 'GC1!', name: 'Gold', type: 'commodity' },
  { symbol: 'CL1!', name: 'Crude Oil', type: 'commodity' },
  { symbol: 'SI1!', name: 'Silver', type: 'commodity' },
];

const TYPE_COLORS = {
  stock: '#007aff',
  crypto: '#ff9500',
  index: '#5856d6',
  forex: '#00d632',
  commodity: '#ff3b30',
};

const TYPE_LABELS = {
  stock: 'Stocks',
  crypto: 'Crypto',
  index: 'Indices',
  forex: 'Forex',
  commodity: 'Commodities',
};

function ChartsContent() {
  const searchParams = useSearchParams();
  const [watchlist, setWatchlist] = useState<Asset[]>(DEFAULT_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredAssets = BROWSE_ASSETS.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || asset.type === activeFilter;
    const notInWatchlist = !watchlist.find(w => w.symbol === asset.symbol);
    return matchesSearch && matchesFilter && notInWatchlist;
  });

  const addToWatchlist = (asset: Asset) => {
    setWatchlist([...watchlist, asset]);
    setShowAddModal(false);
    setSelectedSymbol(asset.symbol);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(a => a.symbol !== symbol));
    if (selectedSymbol === symbol && watchlist.length > 1) {
      setSelectedSymbol(watchlist[0].symbol);
    }
  };

  const selectedAsset = watchlist.find(a => a.symbol === selectedSymbol) || 
                        BROWSE_ASSETS.find(a => a.symbol === selectedSymbol);

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Charts</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00d632] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="animate-slide-down">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#00d632]/50"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[#636366]"
              >
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {watchlist.map((asset, i) => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedSymbol(asset.symbol)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all active:scale-95 ${
              selectedSymbol === asset.symbol
                ? 'bg-white text-black'
                : 'bg-[#1a1a1a] text-white'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {asset.symbol}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: TYPE_COLORS[selectedAsset?.type || 'stock'] + '20', color: TYPE_COLORS[selectedAsset?.type || 'stock'] }}
            >
              {selectedSymbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold">{selectedSymbol}</p>
              <p className="text-xs text-[#8e8e93]">{selectedAsset?.name}</p>
            </div>
          </div>
          <span 
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: TYPE_COLORS[selectedAsset?.type || 'stock'] + '20', color: TYPE_COLORS[selectedAsset?.type || 'stock'] }}
          >
            {TYPE_LABELS[selectedAsset?.type || 'stock']}
          </span>
        </div>
        <div className="aspect-[4/3] md:aspect-[16/9]">
          <iframe
            key={selectedSymbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_widget&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=000000&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=0&allow_symbol_change=0&hide_top_toolbar=0&hide_legend=0&backgroundColor=000000`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buy
        </button>
        <button className="btn btn-secondary border border-[#ff3b30] text-[#ff3b30]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Sell
        </button>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-[#1a1a1a] w-full md:w-[480px] md:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <h2 className="text-lg font-semibold">Add to Watchlist</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626] active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[#262626]">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d0d0d] rounded-xl py-3 pl-12 pr-4 text-white placeholder-[#636366] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              <button
                onClick={() => setActiveFilter(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !activeFilter ? 'bg-white text-black' : 'bg-[#262626] text-white'
                }`}
              >
                All
              </button>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === key ? 'text-black' : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: activeFilter === key ? TYPE_COLORS[key as keyof typeof TYPE_COLORS] : '#262626'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-4 pt-0">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-8 text-[#8e8e93]">
                  No assets found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredAssets.map(asset => (
                    <button
                      key={asset.symbol}
                      onClick={() => addToWatchlist(asset)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#262626] active:bg-[#333] transition-colors"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: TYPE_COLORS[asset.type] + '20', color: TYPE_COLORS[asset.type] }}
                      >
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{asset.symbol}</p>
                        <p className="text-xs text-[#8e8e93]">{asset.name}</p>
                      </div>
                      <svg className="w-5 h-5 text-[#00d632]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChartsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse p-4"><div className="skeleton h-10 w-32 mb-4" /><div className="skeleton h-64 w-full" /></div>}>
      <ChartsContent />
    </Suspense>
  );
}
