'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { executeBuy, executeSell, getPrice, updatePrice } from '@/lib/tradingEngine';

interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'index' | 'forex' | 'commodity';
}

const ALL_ASSETS: Asset[] = [
  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock' },
  { symbol: 'MA', name: 'Mastercard', type: 'stock' },
  { symbol: 'PG', name: 'Procter & Gamble', type: 'stock' },
  { symbol: 'UNH', name: 'UnitedHealth', type: 'stock' },
  { symbol: 'HD', name: 'Home Depot', type: 'stock' },
  { symbol: 'DIS', name: 'Walt Disney', type: 'stock' },
  { symbol: 'NFLX', name: 'Netflix', type: 'stock' },
  { symbol: 'PYPL', name: 'PayPal', type: 'stock' },
  { symbol: 'INTC', name: 'Intel Corp.', type: 'stock' },
  { symbol: 'AMD', name: 'AMD', type: 'stock' },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'crypto' },
  { symbol: 'BNBUSD', name: 'BNB', type: 'crypto' },
  { symbol: 'XRPUSD', name: 'XRP', type: 'crypto' },
  { symbol: 'ADAUSD', name: 'Cardano', type: 'crypto' },
  { symbol: 'DOGEUSD', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'DOTUSD', name: 'Polkadot', type: 'crypto' },
  // Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'index' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'index' },
  { symbol: 'DIA', name: 'Dow Jones ETF', type: 'index' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', type: 'index' },
  { symbol: 'VTI', name: 'Total Stock Market', type: 'index' },
  // Forex
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', type: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', type: 'forex' },
  { symbol: 'AUDUSD', name: 'Australian Dollar', type: 'forex' },
  { symbol: 'USDCAD', name: 'USD / Canadian Dollar', type: 'forex' },
  // Commodities
  { symbol: 'GC1!', name: 'Gold Futures', type: 'commodity' },
  { symbol: 'CL1!', name: 'Crude Oil', type: 'commodity' },
  { symbol: 'SI1!', name: 'Silver Futures', type: 'commodity' },
  { symbol: 'NG1!', name: 'Natural Gas', type: 'commodity' },
];

const TYPE_CONFIG = {
  stock: { color: '#007aff', bg: 'bg-[#007aff]', label: '📈 Stocks', emoji: '📈' },
  crypto: { color: '#ff9500', bg: 'bg-[#ff9500]', label: '₿ Crypto', emoji: '₿' },
  index: { color: '#5856d6', bg: 'bg-[#5856d6]', label: '📊 Indices', emoji: '📊' },
  forex: { color: '#00d632', bg: 'bg-[#00d632]', label: '💱 Forex', emoji: '💱' },
  commodity: { color: '#ff3b30', bg: 'bg-[#ff3b30]', label: '🛢️ Commodities', emoji: '🛢️' },
};

function ChartsContent() {
  const searchParams = useSearchParams();
  const mode = useTradingMode();
  const [selectedSymbol, setSelectedSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showTradeModal, setShowTradeModal] = useState<'buy' | 'sell' | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [tradeStatus, setTradeStatus] = useState<{success: boolean; message: string} | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceLoading, setPriceLoading] = useState(true);

  // Fetch real price from API
  const fetchPrice = async (symbol: string) => {
    setPriceLoading(true);
    try {
      const response = await fetch(`/api/prices?symbols=${symbol}`);
      const data = await response.json();
      if (data.prices && data.prices.length > 0) {
        const priceData = data.prices[0];
        setCurrentPrice(priceData.price);
        setPriceChange(priceData.changePercent);
        updatePrice(symbol, priceData.price);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
    }
    setPriceLoading(false);
  };

  useEffect(() => {
    fetchPrice(selectedSymbol);
    // Refresh price every 15 seconds
    const interval = setInterval(() => fetchPrice(selectedSymbol), 15000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const selectedAsset = ALL_ASSETS.find(a => a.symbol === selectedSymbol);
  
  // Filter assets based on search and category
  const filteredAssets = ALL_ASSETS.filter(asset => {
    const matchesSearch = !searchQuery || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || asset.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTrade = () => {
    const qty = Number(quantity);
    if (qty <= 0) {
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
      }, 1500);
    } else {
      setTradeStatus({ success: false, message: result.error || 'Trade failed' });
    }
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search stocks, crypto, forex..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#1a1a1a] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#636366] rounded-full flex items-center justify-center"
          >
            <span className="text-black text-xs font-bold">✕</span>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
            !activeCategory ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'
          }`}
        >
          All
        </button>
        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === key ? 'text-white' : 'bg-[#1a1a1a] text-white'
            }`}
            style={{ backgroundColor: activeCategory === key ? config.color : undefined }}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Asset List / Search Results */}
      {(searchQuery || activeCategory) && (
        <div className="card max-h-64 overflow-y-auto">
          <p className="text-xs text-[#636366] mb-2">{filteredAssets.length} results</p>
          <div className="space-y-1">
            {filteredAssets.map(asset => (
              <button
                key={asset.symbol}
                onClick={() => {
                  setSelectedSymbol(asset.symbol);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedSymbol === asset.symbol ? 'bg-[#007aff]/20 border border-[#007aff]' : 'hover:bg-[#262626]'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: TYPE_CONFIG[asset.type].color + '30' }}
                >
                  {TYPE_CONFIG[asset.type].emoji}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{asset.symbol}</p>
                  <p className="text-xs text-[#636366]">{asset.name}</p>
                </div>
                {selectedSymbol === asset.symbol && (
                  <span className="text-[#007aff]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Asset & Chart */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: TYPE_CONFIG[selectedAsset?.type || 'stock'].color + '30' }}
            >
              {selectedSymbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-lg">{selectedSymbol}</p>
              <p className="text-sm text-[#8e8e93]">{selectedAsset?.name}</p>
            </div>
          </div>
          <div className="text-right">
            {priceLoading ? (
              <div className="skeleton h-6 w-20 mb-1" />
            ) : (
              <>
                <p className="font-bold text-lg">${currentPrice.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-xs font-medium ${priceChange >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                  </span>
                  <span className="w-2 h-2 bg-[#00d632] rounded-full animate-pulse" title="Live" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="aspect-[4/3] md:aspect-[16/9] bg-[#0d0d0d] relative" style={{ minHeight: '280px' }}>
          <iframe
            key={selectedSymbol}
            src={`https://s.tradingview.com/embed-widget/symbol-overview/?symbols=${encodeURIComponent(selectedSymbol)}&chartOnly=true&width=100%25&height=100%25&locale=en&colorTheme=dark&autosize=true&showVolume=false&showMA=false&hideDateRanges=false&hideMarketStatus=true&hideSymbolLogo=true&scalePosition=right&scaleMode=Normal&fontFamily=-apple-system%2C%20BlinkMacSystemFont%2C%20Trebuchet%20MS%2C%20Roboto%2C%20Ubuntu%2C%20sans-serif&fontSize=10&noTimeScale=false&valuesTracking=1&changeMode=price-and-percent&chartType=area&lineWidth=2&lineType=0&dateRanges=1d%7C1m%7C3m%7C12m%7C60m%7Call&backgroundColor=rgba(0%2C%200%2C%200%2C%201)&gridLineColor=rgba(30%2C%2030%2C%2030%2C%201)&lineColor=rgba(0%2C%20122%2C%20255%2C%201)&topColor=rgba(0%2C%20122%2C%20255%2C%200.3)&bottomColor=rgba(0%2C%200%2C%200%2C%200)`}
            className="w-full h-full border-0"
            style={{ minHeight: '280px' }}
            allow="autoplay"
          />
        </div>
      </div>

      {/* Trading Mode */}
      <div className={`text-center py-2 rounded-xl text-sm font-medium ${
        mode === 'paper' ? 'bg-[#007aff]/15 text-[#007aff]' : 'bg-[#00d632]/15 text-[#00d632]'
      }`}>
        {mode === 'paper' ? '📄 Paper Trading' : '💰 Live Trading'}
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setShowTradeModal('buy')}
          className="py-5 rounded-2xl font-bold text-lg bg-[#00d632] text-black active:scale-95 transition-transform"
        >
          🛒 BUY
        </button>
        <button 
          onClick={() => setShowTradeModal('sell')}
          className="py-5 rounded-2xl font-bold text-lg bg-[#ff3b30] text-white active:scale-95 transition-transform"
        >
          💸 SELL
        </button>
      </div>

      {/* Quick Pick - Popular */}
      <div className="card">
        <p className="text-xs text-[#636366] font-medium mb-3">POPULAR</p>
        <div className="flex gap-2 overflow-x-auto">
          {['AAPL', 'MSFT', 'TSLA', 'NVDA', 'BTCUSD', 'ETHUSD'].map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                selectedSymbol === symbol ? 'bg-white text-black' : 'bg-[#262626] text-white'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-[#1a1a1a] w-full md:w-[400px] md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className={`p-4 border-b border-[#262626] ${showTradeModal === 'buy' ? 'bg-[#00d632]/10' : 'bg-[#ff3b30]/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    showTradeModal === 'buy' ? 'bg-[#00d632]' : 'bg-[#ff3b30]'
                  }`}>
                    {showTradeModal === 'buy' ? '🛒' : '💸'}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{showTradeModal === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}</p>
                    <p className="text-sm text-[#8e8e93]">{selectedAsset?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowTradeModal(null)} className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className={`text-center py-2 rounded-xl text-sm font-medium ${
                mode === 'paper' ? 'bg-[#007aff]/15 text-[#007aff]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'
              }`}>
                {mode === 'paper' ? '📄 Paper Trade' : '⚠️ Real Money!'}
              </div>

              <div>
                <p className="text-xs text-[#636366] mb-2">Quantity</p>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  min="1"
                  className="w-full bg-[#0d0d0d] rounded-xl p-4 text-3xl font-bold text-center focus:outline-none"
                />
                <div className="flex justify-center gap-2 mt-3">
                  {[1, 5, 10, 25, 50, 100].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuantity(String(n))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        quantity === String(n) ? 'bg-white text-black' : 'bg-[#262626]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d0d0d] rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#636366]">Price</span>
                  <span className="font-medium">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#636366]">Total</span>
                  <span className="font-bold">${(currentPrice * Number(quantity || 0)).toFixed(2)}</span>
                </div>
              </div>

              {tradeStatus && (
                <div className={`text-center py-3 rounded-xl font-medium ${
                  tradeStatus.success ? 'bg-[#00d632]/20 text-[#00d632]' : 'bg-[#ff3b30]/20 text-[#ff3b30]'
                }`}>
                  {tradeStatus.success ? '✓' : '✗'} {tradeStatus.message}
                </div>
              )}

              <button
                onClick={handleTrade}
                disabled={!!tradeStatus?.success}
                className={`w-full py-5 rounded-2xl font-bold text-xl disabled:opacity-50 ${
                  showTradeModal === 'buy' ? 'bg-[#00d632] text-black' : 'bg-[#ff3b30] text-white'
                }`}
              >
                {tradeStatus?.success ? '✓ Done!' : `${showTradeModal === 'buy' ? '🛒 BUY' : '💸 SELL'} ${quantity} ${selectedSymbol}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChartsPage() {
  return (
    <Suspense fallback={<div className="p-4"><div className="skeleton h-12 w-full mb-4" /><div className="skeleton h-64 w-full" /></div>}>
      <ChartsContent />
    </Suspense>
  );
}
