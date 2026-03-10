'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { executeBuy, executeSell, getPrice, updatePrice } from '@/lib/tradingEngine';
import { getPortfolio } from '@/lib/paperTrading';
import { getWatchlist, followAsset, unfollowAsset, isFollowing, getFollowedAsset, type WatchedAsset } from '@/lib/watchlist';

interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'index' | 'forex' | 'commodity';
  sector?: string;
}

const SECTORS = [
  { id: 'all', label: '🌍 All' },
  { id: 'owned', label: '💼 Owned' },
  { id: 'followed', label: '⭐ Following' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'finance', label: '🏦 Finance' },
  { id: 'healthcare', label: '🏥 Health' },
  { id: 'consumer', label: '🛒 Consumer' },
  { id: 'energy', label: '⚡ Energy' },
  { id: 'crypto', label: '₿ Crypto' },
  { id: 'forex', label: '💱 Forex' },
  { id: 'commodity', label: '🛢️ Commodities' },
];

const ALL_ASSETS: Asset[] = [
  // Tech
  { symbol: 'AAPL', name: 'Apple', type: 'stock', sector: 'tech' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', sector: 'tech' },
  { symbol: 'GOOGL', name: 'Google', type: 'stock', sector: 'tech' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', sector: 'tech' },
  { symbol: 'META', name: 'Meta', type: 'stock', sector: 'tech' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', sector: 'tech' },
  { symbol: 'NFLX', name: 'Netflix', type: 'stock', sector: 'tech' },
  { symbol: 'AMD', name: 'AMD', type: 'stock', sector: 'tech' },
  { symbol: 'INTC', name: 'Intel', type: 'stock', sector: 'tech' },
  { symbol: 'PYPL', name: 'PayPal', type: 'stock', sector: 'tech' },
  // Finance
  { symbol: 'JPM', name: 'JPMorgan', type: 'stock', sector: 'finance' },
  { symbol: 'V', name: 'Visa', type: 'stock', sector: 'finance' },
  { symbol: 'MA', name: 'Mastercard', type: 'stock', sector: 'finance' },
  { symbol: 'BAC', name: 'Bank of America', type: 'stock', sector: 'finance' },
  { symbol: 'GS', name: 'Goldman Sachs', type: 'stock', sector: 'finance' },
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', sector: 'healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', type: 'stock', sector: 'healthcare' },
  { symbol: 'PFE', name: 'Pfizer', type: 'stock', sector: 'healthcare' },
  { symbol: 'ABBV', name: 'AbbVie', type: 'stock', sector: 'healthcare' },
  { symbol: 'MRK', name: 'Merck', type: 'stock', sector: 'healthcare' },
  // Consumer
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', sector: 'consumer' },
  { symbol: 'WMT', name: 'Walmart', type: 'stock', sector: 'consumer' },
  { symbol: 'HD', name: 'Home Depot', type: 'stock', sector: 'consumer' },
  { symbol: 'PG', name: 'P&G', type: 'stock', sector: 'consumer' },
  { symbol: 'DIS', name: 'Disney', type: 'stock', sector: 'consumer' },
  { symbol: 'NKE', name: 'Nike', type: 'stock', sector: 'consumer' },
  { symbol: 'MCD', name: 'McDonalds', type: 'stock', sector: 'consumer' },
  { symbol: 'SBUX', name: 'Starbucks', type: 'stock', sector: 'consumer' },
  // Energy
  { symbol: 'XOM', name: 'Exxon', type: 'stock', sector: 'energy' },
  { symbol: 'CVX', name: 'Chevron', type: 'stock', sector: 'energy' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'stock', sector: 'energy' },
  { symbol: 'SLB', name: 'Schlumberger', type: 'stock', sector: 'energy' },
  { symbol: 'OXY', name: 'Occidental', type: 'stock', sector: 'energy' },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto', sector: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto', sector: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'crypto', sector: 'crypto' },
  { symbol: 'BNBUSD', name: 'BNB', type: 'crypto', sector: 'crypto' },
  { symbol: 'XRPUSD', name: 'XRP', type: 'crypto', sector: 'crypto' },
  { symbol: 'ADAUSD', name: 'Cardano', type: 'crypto', sector: 'crypto' },
  { symbol: 'DOGEUSD', name: 'Dogecoin', type: 'crypto', sector: 'crypto' },
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', sector: 'forex' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', sector: 'forex' },
  { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', sector: 'forex' },
  { symbol: 'AUDUSD', name: 'AUD/USD', type: 'forex', sector: 'forex' },
  { symbol: 'USDCAD', name: 'USD/CAD', type: 'forex', sector: 'forex' },
  // Commodities
  { symbol: 'GC1!', name: 'Gold', type: 'commodity', sector: 'commodity' },
  { symbol: 'CL1!', name: 'Crude Oil', type: 'commodity', sector: 'commodity' },
  { symbol: 'SI1!', name: 'Silver', type: 'commodity', sector: 'commodity' },
  { symbol: 'NG1!', name: 'Natural Gas', type: 'commodity', sector: 'commodity' },
];

function ChartsContent() {
  const searchParams = useSearchParams();
  const mode = useTradingMode();
  const [selectedSymbol, setSelectedSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [selectedSector, setSelectedSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTradeModal, setShowTradeModal] = useState<'buy' | 'sell' | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [tradeStatus, setTradeStatus] = useState<{success: boolean; message: string} | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchedAsset[]>([]);
  const [ownedSymbols, setOwnedSymbols] = useState<string[]>([]);
  const [prices, setPrices] = useState<Map<string, { price: number; change: number }>>(new Map());

  const selectedAsset = ALL_ASSETS.find(a => a.symbol === selectedSymbol);
  const isWatching = watchlist.some(w => w.symbol === selectedSymbol);
  const watchedData = watchlist.find(w => w.symbol === selectedSymbol);

  // Load watchlist and portfolio
  useEffect(() => {
    setWatchlist(getWatchlist());
    const portfolio = getPortfolio();
    setOwnedSymbols(portfolio.positions.map(p => p.symbol));
  }, []);

  // Filter and sort assets
  const getFilteredAssets = () => {
    let assets = ALL_ASSETS;
    
    // Filter by sector
    if (selectedSector === 'owned') {
      assets = assets.filter(a => ownedSymbols.includes(a.symbol));
    } else if (selectedSector === 'followed') {
      assets = assets.filter(a => watchlist.some(w => w.symbol === a.symbol));
    } else if (selectedSector !== 'all') {
      assets = assets.filter(a => a.sector === selectedSector);
    }
    
    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      assets = assets.filter(a => 
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      );
    }
    
    // Sort: owned first, then followed, then rest
    return assets.sort((a, b) => {
      const aOwned = ownedSymbols.includes(a.symbol) ? 0 : 1;
      const bOwned = ownedSymbols.includes(b.symbol) ? 0 : 1;
      if (aOwned !== bOwned) return aOwned - bOwned;
      
      const aFollowed = watchlist.some(w => w.symbol === a.symbol) ? 0 : 1;
      const bFollowed = watchlist.some(w => w.symbol === b.symbol) ? 0 : 1;
      return aFollowed - bFollowed;
    });
  };

  const filteredAssets = getFilteredAssets();

  // Fetch prices for visible assets
  const fetchPrices = async () => {
    const symbols = [selectedSymbol, ...watchlist.map(w => w.symbol), ...ownedSymbols];
    const uniqueSymbols = Array.from(new Set(symbols));
    
    try {
      const response = await fetch(`/api/prices?symbols=${uniqueSymbols.join(',')}`);
      const data = await response.json();
      
      if (data.prices) {
        const newPrices = new Map();
        for (const p of data.prices) {
          newPrices.set(p.symbol, { price: p.price, change: p.changePercent });
          updatePrice(p.symbol, p.price);
          
          if (p.symbol === selectedSymbol) {
            setCurrentPrice(p.price);
            setPriceChange(p.changePercent);
          }
        }
        setPrices(newPrices);
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
    setPriceLoading(false);
  };

  useEffect(() => {
    setPriceLoading(true);
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [selectedSymbol, watchlist.length]);

  const handleFollow = () => {
    if (isWatching) {
      unfollowAsset(selectedSymbol);
    } else {
      followAsset(selectedSymbol, currentPrice);
    }
    setWatchlist(getWatchlist());
  };

  const handleTrade = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setTradeStatus({ success: false, message: 'Invalid quantity' });
      return;
    }

    const result = showTradeModal === 'buy' 
      ? executeBuy(selectedSymbol, qty, selectedAsset?.type || 'stock')
      : executeSell(selectedSymbol, qty);

    if (result.success) {
      setTradeStatus({ 
        success: true, 
        message: `${showTradeModal === 'buy' ? 'Bought' : 'Sold'} ${qty} ${selectedSymbol}`
      });
      setTimeout(() => {
        setShowTradeModal(null);
        setTradeStatus(null);
        setQuantity('1');
        setOwnedSymbols(getPortfolio().positions.map(p => p.symbol));
      }, 1500);
    } else {
      setTradeStatus({ success: false, message: result.error || 'Trade failed' });
    }
  };

  const getChangeFromFollow = (symbol: string) => {
    const watched = watchlist.find(w => w.symbol === symbol);
    const priceData = prices.get(symbol);
    if (!watched || !priceData) return null;
    const change = ((priceData.price - watched.priceAtFollow) / watched.priceAtFollow) * 100;
    return change;
  };

  return (
    <div className="space-y-3 animate-slide-up safe-bottom pb-4">
      <TradingModeToggle />

      {/* Sector Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSector(s.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              selectedSector === s.id 
                ? 'bg-[#007aff] text-white' 
                : 'bg-[#1a1a1a] text-[#8e8e93]'
            }`}
          >
            {s.label}
            {s.id === 'owned' && ownedSymbols.length > 0 && (
              <span className="ml-1 text-xs">({ownedSymbols.length})</span>
            )}
            {s.id === 'followed' && watchlist.length > 0 && (
              <span className="ml-1 text-xs">({watchlist.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#1a1a1a] rounded-xl py-3 px-4 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366]">✕</button>
        )}
      </div>

      {/* Asset List */}
      <div className="card max-h-36 overflow-y-auto">
        <div className="space-y-1">
          {filteredAssets.slice(0, 20).map(asset => {
            const priceData = prices.get(asset.symbol);
            const isOwned = ownedSymbols.includes(asset.symbol);
            const isFollowed = watchlist.some(w => w.symbol === asset.symbol);
            const changeFromFollow = getChangeFromFollow(asset.symbol);
            
            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                  selectedSymbol === asset.symbol 
                    ? 'bg-[#007aff]/20 border border-[#007aff]' 
                    : 'bg-[#0d0d0d] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isOwned && <span className="text-xs">💼</span>}
                  {isFollowed && !isOwned && <span className="text-xs">⭐</span>}
                  <div className="text-left">
                    <p className="font-bold text-sm">{asset.symbol}</p>
                    <p className="text-[10px] text-[#636366]">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  {priceData && (
                    <>
                      <p className="text-sm font-medium">${priceData.price.toFixed(2)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className={`text-[10px] ${priceData.change >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                          {priceData.change >= 0 ? '▲' : '▼'}{Math.abs(priceData.change).toFixed(1)}%
                        </span>
                        {changeFromFollow !== null && (
                          <span className={`text-[10px] px-1 rounded ${changeFromFollow >= 0 ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'}`}>
                            {changeFromFollow >= 0 ? '+' : ''}{changeFromFollow.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Asset Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#007aff]/20 flex items-center justify-center text-lg font-bold">
              {selectedSymbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg">{selectedSymbol}</p>
                {ownedSymbols.includes(selectedSymbol) && <span className="text-xs bg-[#007aff]/20 text-[#007aff] px-2 py-0.5 rounded">💼 Owned</span>}
              </div>
              <p className="text-sm text-[#8e8e93]">{selectedAsset?.name}</p>
            </div>
          </div>
          <div className="text-right">
            {priceLoading ? (
              <div className="animate-pulse bg-[#262626] h-6 w-20 rounded" />
            ) : (
              <>
                <p className="font-bold text-xl">${currentPrice.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-sm font-bold ${priceChange >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                  </span>
                  <span className="w-2 h-2 bg-[#00d632] rounded-full animate-pulse" />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Change since following */}
        {watchedData && (
          <div className="mt-3 p-3 bg-[#0d0d0d] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8e8e93]">⭐ Following since {new Date(watchedData.followedAt).toLocaleDateString()}</span>
              {(() => {
                const change = ((currentPrice - watchedData.priceAtFollow) / watchedData.priceAtFollow) * 100;
                return (
                  <span className={`font-bold ${change >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}% (${((currentPrice - watchedData.priceAtFollow) * 100).toFixed(0)})
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-[#636366] mt-1">Entry: ${watchedData.priceAtFollow.toFixed(2)} → Now: ${currentPrice.toFixed(2)}</p>
          </div>
        )}
        
        {/* Follow Button */}
        <button
          onClick={handleFollow}
          className={`mt-3 w-full py-2 rounded-xl font-medium transition-all ${
            isWatching 
              ? 'bg-[#ff9500]/20 text-[#ff9500] border border-[#ff9500]/50' 
              : 'bg-[#1a1a1a] text-white'
          }`}
        >
          {isWatching ? '⭐ Following' : '☆ Follow Asset'}
        </button>
      </div>

      {/* TradingView Chart */}
      <div className="card !p-0 overflow-hidden">
        <iframe
          key={selectedSymbol}
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=000000&studies=RSI%40tv-basicstudies&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&locale=en`}
          style={{ width: '100%', height: '450px' }}
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setShowTradeModal('buy')}
          disabled={priceLoading || currentPrice <= 0}
          className="py-4 rounded-xl font-bold text-lg bg-[#00d632] text-black active:scale-95 transition-transform disabled:opacity-50"
        >
          🛒 BUY
        </button>
        <button 
          onClick={() => setShowTradeModal('sell')}
          disabled={priceLoading || currentPrice <= 0}
          className="py-4 rounded-xl font-bold text-lg bg-[#ff3b30] text-white active:scale-95 transition-transform disabled:opacity-50"
        >
          💸 SELL
        </button>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end md:items-center justify-center">
          <div className="bg-[#1a1a1a] w-full md:w-[400px] md:rounded-2xl rounded-t-2xl">
            <div className={`p-4 border-b border-[#262626] ${showTradeModal === 'buy' ? 'bg-[#00d632]/10' : 'bg-[#ff3b30]/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${showTradeModal === 'buy' ? 'bg-[#00d632]' : 'bg-[#ff3b30]'}`}>
                    {showTradeModal === 'buy' ? '🛒' : '💸'}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{showTradeModal === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}</p>
                    <p className="text-sm text-[#8e8e93]">${currentPrice.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={() => { setShowTradeModal(null); setTradeStatus(null); }} className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center">✕</button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {tradeStatus ? (
                <div className={`text-center py-8 ${tradeStatus.success ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                  <span className="text-5xl">{tradeStatus.success ? '✅' : '❌'}</span>
                  <p className="mt-2 font-medium">{tradeStatus.message}</p>
                </div>
              ) : (
                <>
                  <div className={`text-center py-2 rounded-xl text-sm font-medium ${mode === 'paper' ? 'bg-[#007aff]/15 text-[#007aff]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'}`}>
                    {mode === 'paper' ? '📄 Paper Trade' : '⚠️ Real Money!'}
                  </div>

                  <div>
                    <p className="text-xs text-[#636366] mb-2">Quantity</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(String(Math.max(1, parseInt(quantity) - 1)))} className="w-12 h-12 bg-[#262626] rounded-xl text-2xl">-</button>
                      <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="flex-1 bg-[#0d0d0d] rounded-xl p-3 text-2xl font-bold text-center focus:outline-none" />
                      <button onClick={() => setQuantity(String(parseInt(quantity) + 1))} className="w-12 h-12 bg-[#262626] rounded-xl text-2xl">+</button>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8e8e93]">Price</span>
                      <span>${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8e8e93]">Quantity</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="border-t border-[#262626] my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(currentPrice * parseInt(quantity || '0')).toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={handleTrade} className={`w-full py-4 rounded-xl font-bold text-lg ${showTradeModal === 'buy' ? 'bg-[#00d632] text-black' : 'bg-[#ff3b30] text-white'}`}>
                    {showTradeModal === 'buy' ? '🛒 Confirm Buy' : '💸 Confirm Sell'}
                  </button>
                </>
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
    <Suspense fallback={<div className="p-4"><div className="skeleton h-32 w-full" /></div>}>
      <ChartsContent />
    </Suspense>
  );
}
