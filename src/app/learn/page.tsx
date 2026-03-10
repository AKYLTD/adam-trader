'use client';

import { useState } from 'react';

interface Term {
  term: string;
  definition: string;
  example?: string;
  videoUrl?: string;
  category: string;
}

const DICTIONARY: Term[] = [
  // Basics
  { term: 'Stock', definition: 'A share of ownership in a company. When you buy a stock, you own a small piece of that company.', example: 'Buying 10 shares of Apple makes you a part-owner of Apple Inc.', videoUrl: 'https://www.youtube.com/watch?v=p7HKvqRI_Bo', category: 'Basics' },
  { term: 'Portfolio', definition: 'Your collection of all investments including stocks, bonds, crypto, etc.', example: 'My portfolio contains Apple, Microsoft, and Bitcoin.', category: 'Basics' },
  { term: 'Dividend', definition: 'A payment made by a company to its shareholders, usually from profits.', example: 'Coca-Cola pays quarterly dividends to shareholders.', category: 'Basics' },
  { term: 'Market Cap', definition: 'Total value of a company. Share price × number of shares.', example: 'Apple has a market cap of $3 trillion.', category: 'Basics' },
  { term: 'Bull Market', definition: 'Rising prices, optimistic sentiment.', videoUrl: 'https://www.youtube.com/watch?v=lXCgLWRfuJc', category: 'Basics' },
  { term: 'Bear Market', definition: 'Falling prices (20%+ decline), pessimistic sentiment.', category: 'Basics' },
  { term: 'Volatility', definition: 'How much prices change. High volatility = big swings.', example: 'Crypto is more volatile than stocks.', category: 'Basics' },
  // Orders
  { term: 'Market Order', definition: 'Buy/sell immediately at current price.', example: 'Buy 10 AAPL now.', videoUrl: 'https://www.youtube.com/watch?v=oYHvzpRr6r0', category: 'Orders' },
  { term: 'Limit Order', definition: 'Buy/sell at a specific price or better.', example: 'Buy AAPL only if it drops to $170.', category: 'Orders' },
  { term: 'Stop Loss', definition: 'Auto-sell when price falls to limit losses.', example: 'Bought at $100, stop loss at $95.', videoUrl: 'https://www.youtube.com/watch?v=TI6980X-RmE', category: 'Orders' },
  { term: 'Take Profit', definition: 'Auto-sell when price rises to lock in gains.', example: 'Bought at $100, take profit at $120.', category: 'Orders' },
  // Technical
  { term: 'Support', definition: 'Price level where buying prevents further decline.', videoUrl: 'https://www.youtube.com/watch?v=5lKMBPKHcDs', category: 'Technical' },
  { term: 'Resistance', definition: 'Price level where selling prevents further rise.', category: 'Technical' },
  { term: 'Moving Average', definition: 'Average price over a period, smoothing price action.', videoUrl: 'https://www.youtube.com/watch?v=4R2CDbw4g88', category: 'Technical' },
  { term: 'RSI', definition: '0-100 momentum indicator. >70 overbought, <30 oversold.', videoUrl: 'https://www.youtube.com/watch?v=wYfKVxNsUzI', category: 'Technical' },
  { term: 'Volume', definition: 'Shares traded. High volume = strong conviction.', category: 'Technical' },
  // Risk
  { term: 'Position Size', definition: 'Capital allocated to one trade.', videoUrl: 'https://www.youtube.com/watch?v=8Z7rrQ3t0A8', category: 'Risk' },
  { term: 'Risk/Reward', definition: 'Potential profit vs loss. Aim for 2:1+.', videoUrl: 'https://www.youtube.com/watch?v=jqEZ5ShLdWk', category: 'Risk' },
  { term: 'Diversification', definition: 'Spread investments to reduce risk.', category: 'Risk' },
  { term: 'Leverage', definition: 'Borrowed money to amplify returns (and risks).', category: 'Risk' },
  // Trading
  { term: 'Day Trading', definition: 'Buying and selling within the same day.', videoUrl: 'https://www.youtube.com/watch?v=3a8IVl2Xt_E', category: 'Trading' },
  { term: 'Swing Trading', definition: 'Holding for days to weeks.', category: 'Trading' },
  { term: 'Long', definition: 'Buying, expecting price to rise.', category: 'Trading' },
  { term: 'Short', definition: 'Selling borrowed shares, expecting price to fall.', videoUrl: 'https://www.youtube.com/watch?v=Dyt_NPT1GsY', category: 'Trading' },
  { term: 'ETF', definition: 'Fund that trades like a stock, holds multiple assets.', example: 'SPY tracks S&P 500.', videoUrl: 'https://www.youtube.com/watch?v=OwpFBi-jZVg', category: 'Trading' },
  // Crypto
  { term: 'Blockchain', definition: 'Decentralized ledger recording all transactions.', videoUrl: 'https://www.youtube.com/watch?v=SSo_EIwHSd4', category: 'Crypto' },
  { term: 'Wallet', definition: 'Software/hardware storing your crypto keys.', category: 'Crypto' },
  { term: 'DeFi', definition: 'Decentralized Finance - financial services on blockchain.', category: 'Crypto' },
  { term: 'Staking', definition: 'Locking crypto to earn rewards.', category: 'Crypto' },
];

const CATEGORIES = ['All', 'Basics', 'Orders', 'Technical', 'Risk', 'Trading', 'Crypto'];

const CATEGORY_COLORS: Record<string, string> = {
  Basics: '#007aff',
  Orders: '#00d632',
  Technical: '#ff9500',
  Risk: '#ff3b30',
  Trading: '#5856d6',
  Crypto: '#ff2d55',
};

export default function LearnPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  const filtered = DICTIONARY.filter(t => {
    const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
                       t.definition.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || t.category === category;
    return matchSearch && matchCategory;
  });

  const getVideoId = (url: string) => {
    const match = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4 animate-slide-up safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Learn</h1>
        <span className="text-xs text-[#636366]">{DICTIONARY.length} terms</span>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-[#636366] focus:outline-none focus:ring-2 focus:ring-[#00d632]/50"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              category === cat ? 'bg-white text-black' : 'bg-[#1a1a1a] text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div className="space-y-2">
        {filtered.map(term => (
          <button
            key={term.term}
            onClick={() => setSelectedTerm(term)}
            className="card w-full text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[term.category] + '20', color: CATEGORY_COLORS[term.category] }}
              >
                {term.term[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{term.term}</p>
                  {term.videoUrl && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff3b30]/15 text-[#ff3b30] font-medium">Video</span>
                  )}
                </div>
                <p className="text-sm text-[#8e8e93] line-clamp-2">{term.definition}</p>
              </div>
              <svg className="w-5 h-5 text-[#636366] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-[#1a1a1a] w-full md:w-[500px] md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-[#1a1a1a] flex items-center justify-between p-4 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedTerm.category] + '20', color: CATEGORY_COLORS[selectedTerm.category] }}
                >
                  {selectedTerm.term[0]}
                </div>
                <div>
                  <p className="font-semibold">{selectedTerm.term}</p>
                  <p className="text-xs text-[#636366]">{selectedTerm.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTerm(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#262626] active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Video */}
              {selectedTerm.videoUrl && (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${getVideoId(selectedTerm.videoUrl)}?rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Definition */}
              <div>
                <p className="text-xs text-[#636366] mb-1">Definition</p>
                <p className="text-white">{selectedTerm.definition}</p>
              </div>

              {/* Example */}
              {selectedTerm.example && (
                <div className="bg-[#0d0d0d] rounded-xl p-4">
                  <p className="text-xs text-[#636366] mb-1">Example</p>
                  <p className="text-white text-sm">{selectedTerm.example}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
