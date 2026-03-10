'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TradingModeToggle, useTradingMode } from '@/components/TradingMode';
import { executeBuy, executeSell, getPrice, updatePrice } from '@/lib/tradingEngine';

interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'index' | 'forex' | 'commodity';
  sector?: string;
}

// Sectors for dropdown
const SECTORS = [
  { id: 'all', label: '🌍 All Assets' },
  { id: 'tech', label: '💻 Technology' },
  { id: 'finance', label: '🏦 Finance' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'consumer', label: '🛒 Consumer' },
  { id: 'energy', label: '⚡ Energy' },
  { id: 'crypto', label: '₿ Crypto' },
  { id: 'forex', label: '💱 Forex' },
  { id: 'commodity', label: '🛢️ Commodities' },
  { id: 'index', label: '📊 Indices' },
];

const ALL_ASSETS: Asset[] = [
  // Tech
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', sector: 'tech' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', sector: 'tech' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', sector: 'tech' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', sector: 'tech' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stock', sector: 'tech' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', sector: 'tech' },
  { symbol: 'NFLX', name: 'Netflix', type: 'stock', sector: 'tech' },
  { symbol: 'AMD', name: 'AMD', type: 'stock', sector: 'tech' },
  { symbol: 'INTC', name: 'Intel Corp.', type: 'stock', sector: 'tech' },
  { symbol: 'PYPL', name: 'PayPal', type: 'stock', sector: 'tech' },
  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock', sector: 'finance' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', sector: 'finance' },
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
  { symbol: 'AMZN', name: 'Amazon.com', type: 'stock', sector: 'consumer' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', sector: 'consumer' },
  { symbol: 'HD', name: 'Home Depot', type: 'stock', sector: 'consumer' },
  { symbol: 'PG', name: 'Procter & Gamble', type: 'stock', sector: 'consumer' },
  { symbol: 'DIS', name: 'Walt Disney', type: 'stock', sector: 'consumer' },
  { symbol: 'NKE', name: 'Nike', type: 'stock', sector: 'consumer' },
  { symbol: 'MCD', name: 'McDonalds', type: 'stock', sector: 'consumer' },
  { symbol: 'SBUX', name: 'Starbucks', type: 'stock', sector: 'consumer' },
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil', type: 'stock', sector: 'energy' },
  { symbol: 'CVX', name: 'Chevron', type: 'stock', sector: 'energy' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'stock', sector: 'energy' },
  { symbol: 'SLB', name: 'Schlumberger', type: 'stock', sector: 'energy' },
  { symbol: 'OXY', name: 'Occidental Petroleum', type: 'stock', sector: 'energy' },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto', sector: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto', sector: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'crypto', sector: 'crypto' },
  { symbol: 'BNBUSD', name: 'BNB', type: 'crypto', sector: 'crypto' },
  { symbol: 'XRPUSD', name: 'XRP', type: 'crypto', sector: 'crypto' },
  { symbol: 'ADAUSD', name: 'Cardano', type: 'crypto', sector: 'crypto' },
  { symbol: 'DOGEUSD', name: 'Dogecoin', type: 'crypto', sector: 'crypto' },
  // Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'index', sector: 'index' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'index', sector: 'index' },
  { symbol: 'DIA', name: 'Dow Jones ETF', type: 'index', sector: 'index' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', type: 'index', sector: 'index' },
  { symbol: 'VTI', name: 'Total Stock Market', type: 'index', sector: 'index' },
  // Forex
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'forex', sector: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', type: 'forex', sector: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', type: 'forex', sector: 'forex' },
  { symbol: 'AUDUSD', name: 'Australian Dollar', type: 'forex', sector: 'forex' },
  { symbol: 'USDCAD', name: 'USD / Canadian Dollar', type: 'forex', sector: 'forex' },
  // Commodities
  { symbol: 'GC1!', name: 'Gold Futures', type: 'commodity', sector: 'commodity' },
  { symbol: 'CL1!', name: 'Crude Oil', type: 'commodity', sector: 'commodity' },
  { symbol: 'SI1!', name: 'Silver Futures', type: 'commodity', sector: 'commodity' },
  { symbol: 'NG1!', name: 'Natural Gas', type: 'commodity', sector: 'commodity' },
];

const TYPE_COLORS: Record<string, string> = {
  stock: '#007aff',
  crypto: '#ff9500',
  index: '#5856d6',
  forex: '#00d632',
  commodity: '#ff3b30',
};

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

  const selectedAsset = ALL_ASSETS.find(a => a.symbol === selectedSymbol);
  
  // Filter assets by sector and search
  const filteredAssets = ALL_ASSETS.filter(asset => {
    const matchesSector = selectedSector === 'all' || asset.sector === selectedSector;
    const matchesSearch = !searchQuery || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

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
    const interval = setInterval(() => fetchPrice(selectedSymbol), 15000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

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
        message: `${showTradeModal === 'buy' ? 'Bought' : 'Sold'} ${qty} ${selectedSymbol} @ $${currentPrice.toFixed(2)}`
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
    <div className="space-y-3 animate-slide-up safe-bottom pb-4">
      <TradingModeToggle />

      {/* Sector Dropdown + Search */}
      <div className="flex gap-2">
        <select
          value={selectedSector}
          onChange={e => setSelectedSector(e.target.value)}
          className="bg-[#1a1a1a] rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007aff] appearance-none cursor-pointer"
          style={{ minWidth: '160px' }}
        >
          {SECTORS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-xl py-3 px-4 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366]">✕</button>
          )}
        </div>
      </div>

      {/* Asset List */}
      <div className="card max-h-40 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {filteredAssets.slice(0, 15).map(asset => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={`p-2 rounded-lg text-center transition-all ${
                selectedSymbol === asset.symbol 
                  ? 'bg-[#007aff] text-white' 
                  : 'bg-[#0d0d0d] hover:bg-[#262626]'
              }`}
            >
              <p className="font-bold text-sm">{asset.symbol}</p>
              <p className="text-[10px] text-[#8e8e93] truncate">{asset.name}</p>
            </button>
          ))}
        </div>
        {filteredAssets.length > 15 && (
          <p className="text-xs text-[#636366] text-center mt-2">+{filteredAssets.length - 15} more</p>
        )}
      </div>

      {/* Selected Asset Header */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: (TYPE_COLORS[selectedAsset?.type || 'stock']) + '30' }}
          >
            {selectedSymbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-bold">{selectedSymbol}</p>
            <p className="text-xs text-[#8e8e93]">{selectedAsset?.name}</p>
          </div>
        </div>
        <div className="text-right">
          {priceLoading ? (
            <div className="animate-pulse bg-[#262626] h-6 w-20 rounded" />
          ) : (
            <>
              <p className="font-bold text-lg">${currentPrice.toFixed(2)}</p>
              <div className="flex items-center justify-end gap-1">
                <span className={`text-xs font-bold ${priceChange >= 0 ? 'text-[#00d632]' : 'text-[#ff3b30]'}`}>
                  {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                </span>
                <span className="w-2 h-2 bg-[#00d632] rounded-full animate-pulse" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* TradingView Chart - Original Working Version */}
      <div className="card !p-0 overflow-hidden">
        <iframe
          key={selectedSymbol}
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=000000&studies=RSI%40tv-basicstudies&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1&locale=en`}
          style={{ width: '100%', height: '500px' }}
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    showTradeModal === 'buy' ? 'bg-[#00d632]' : 'bg-[#ff3b30]'
                  }`}>
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
                  <div className={`text-center py-2 rounded-xl text-sm font-medium ${
                    mode === 'paper' ? 'bg-[#007aff]/15 text-[#007aff]' : 'bg-[#ff3b30]/15 text-[#ff3b30]'
                  }`}>
                    {mode === 'paper' ? '📄 Paper Trade' : '⚠️ Real Money!'}
                  </div>

                  <div>
                    <p className="text-xs text-[#636366] mb-2">Quantity</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(String(Math.max(1, parseInt(quantity) - 1)))} className="w-12 h-12 bg-[#262626] rounded-xl text-2xl">-</button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        min="1"
                        className="flex-1 bg-[#0d0d0d] rounded-xl p-3 text-2xl font-bold text-center focus:outline-none"
                      />
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

                  <button
                    onClick={handleTrade}
                    className={`w-full py-4 rounded-xl font-bold text-lg ${
                      showTradeModal === 'buy' ? 'bg-[#00d632] text-black' : 'bg-[#ff3b30] text-white'
                    }`}
                  >
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
