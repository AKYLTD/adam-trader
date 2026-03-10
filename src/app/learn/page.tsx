'use client';

import { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Play, TrendingUp, BarChart2, Shield, DollarSign, Activity, Target } from 'lucide-react';

interface Term {
  term: string;
  definition: string;
  example?: string;
  videoUrl?: string;
  category: string;
}

const DICTIONARY: Term[] = [
  // Basic Terms
  { term: 'Stock', definition: 'A share of ownership in a company. When you buy a stock, you own a small piece of that company.', example: 'Buying 10 shares of Apple (AAPL) makes you a part-owner of Apple Inc.', videoUrl: 'https://www.youtube.com/watch?v=p7HKvqRI_Bo', category: 'Basics' },
  { term: 'Share', definition: 'A single unit of ownership in a company or fund. Same as "stock" when referring to companies.', example: 'You own 100 shares of Tesla.', category: 'Basics' },
  { term: 'Portfolio', definition: 'Your collection of all investments including stocks, bonds, crypto, etc.', example: 'My portfolio contains Apple, Microsoft, and Bitcoin.', category: 'Basics' },
  { term: 'Dividend', definition: 'A payment made by a company to its shareholders, usually from profits.', example: 'Coca-Cola pays a quarterly dividend of $0.46 per share.', videoUrl: 'https://www.youtube.com/watch?v=f5j9v9dfinQ', category: 'Basics' },
  { term: 'Market Cap', definition: 'The total value of a company\'s shares. Calculated as share price × number of shares.', example: 'Apple has a market cap of $3 trillion.', category: 'Basics' },
  { term: 'Bull Market', definition: 'A market where prices are rising or expected to rise. Optimistic sentiment.', example: 'The 2020-2021 period was a bull market for tech stocks.', videoUrl: 'https://www.youtube.com/watch?v=lXCgLWRfuJc', category: 'Basics' },
  { term: 'Bear Market', definition: 'A market where prices are falling or expected to fall. Pessimistic sentiment. Usually defined as a 20%+ decline.', example: 'The 2022 crypto crash was a bear market.', category: 'Basics' },
  { term: 'Volatility', definition: 'How much and how quickly prices change. High volatility = big price swings.', example: 'Crypto is more volatile than blue-chip stocks.', category: 'Basics' },
  { term: 'Liquidity', definition: 'How easily an asset can be bought or sold without affecting its price.', example: 'Apple stock is highly liquid; a small penny stock is not.', category: 'Basics' },
  
  // Order Types
  { term: 'Market Order', definition: 'An order to buy or sell immediately at the current market price.', example: 'Buy 10 AAPL at market price (executes instantly).', videoUrl: 'https://www.youtube.com/watch?v=oYHvzpRr6r0', category: 'Orders' },
  { term: 'Limit Order', definition: 'An order to buy or sell at a specific price or better. May not execute if price isn\'t reached.', example: 'Buy AAPL if price drops to $170 (limit order at $170).', category: 'Orders' },
  { term: 'Stop Loss', definition: 'An order to sell when price falls to a certain level, limiting your losses.', example: 'Bought at $100, set stop loss at $95 to limit loss to 5%.', videoUrl: 'https://www.youtube.com/watch?v=TI6980X-RmE', category: 'Orders' },
  { term: 'Take Profit', definition: 'An order to sell when price rises to a certain level, securing your gains.', example: 'Bought at $100, set take profit at $120 for 20% gain.', category: 'Orders' },
  { term: 'Day Order', definition: 'An order that expires at the end of the trading day if not filled.', example: 'Most orders are day orders by default.', category: 'Orders' },
  { term: 'GTC (Good Till Canceled)', definition: 'An order that stays active until filled or manually canceled.', example: 'Set a limit buy at $150 GTC - will wait days/weeks until price hits.', category: 'Orders' },
  
  // Technical Analysis
  { term: 'Support', definition: 'A price level where buying pressure is strong enough to prevent further decline.', example: 'AAPL has support at $170 - it bounces up every time it hits that price.', videoUrl: 'https://www.youtube.com/watch?v=5lKMBPKHcDs', category: 'Technical' },
  { term: 'Resistance', definition: 'A price level where selling pressure is strong enough to prevent further rise.', example: 'BTC has resistance at $70,000 - struggles to break above it.', category: 'Technical' },
  { term: 'Moving Average (MA)', definition: 'The average price over a specific period, smoothing out price action.', example: '50-day MA shows the average price over the last 50 days.', videoUrl: 'https://www.youtube.com/watch?v=4R2CDbw4g88', category: 'Technical' },
  { term: 'RSI (Relative Strength Index)', definition: 'Measures momentum on a scale of 0-100. Above 70 = overbought, below 30 = oversold.', example: 'RSI at 25 suggests the stock might be oversold and due for a bounce.', videoUrl: 'https://www.youtube.com/watch?v=wYfKVxNsUzI', category: 'Technical' },
  { term: 'MACD', definition: 'Moving Average Convergence Divergence - shows trend direction and momentum.', example: 'MACD crossing above signal line = bullish signal.', videoUrl: 'https://www.youtube.com/watch?v=lAq3ypq4Mx4', category: 'Technical' },
  { term: 'Volume', definition: 'The number of shares traded in a given period. High volume = strong conviction.', example: 'Price rising on high volume is more meaningful than on low volume.', category: 'Technical' },
  { term: 'Breakout', definition: 'When price moves above resistance or below support with strong momentum.', example: 'AAPL broke out above $180 resistance on high volume.', category: 'Technical' },
  { term: 'Trend', definition: 'The general direction of price movement - up (bullish), down (bearish), or sideways.', example: 'The overall trend is up, so buy the dips.', category: 'Technical' },
  
  // Risk Management
  { term: 'Position Size', definition: 'The amount of capital allocated to a single trade, expressed in shares or dollars.', example: 'With $10,000 and 2% risk, position size is $200 max risk per trade.', videoUrl: 'https://www.youtube.com/watch?v=8Z7rrQ3t0A8', category: 'Risk' },
  { term: 'Risk/Reward Ratio', definition: 'The potential profit compared to potential loss. Aim for at least 2:1.', example: 'Risking $100 to make $300 = 3:1 risk/reward ratio.', videoUrl: 'https://www.youtube.com/watch?v=jqEZ5ShLdWk', category: 'Risk' },
  { term: 'Drawdown', definition: 'The decline from peak to trough in your portfolio value.', example: 'Portfolio dropped from $10,000 to $8,000 = 20% drawdown.', category: 'Risk' },
  { term: 'Diversification', definition: 'Spreading investments across different assets to reduce risk.', example: 'Don\'t put all your money in one stock - diversify across sectors.', category: 'Risk' },
  { term: 'Leverage', definition: 'Using borrowed money to increase potential returns (and risks).', example: '2x leverage means $1,000 controls $2,000 worth of assets.', category: 'Risk' },
  { term: 'Margin', definition: 'Borrowed money from your broker to trade larger positions.', example: 'Trading on margin amplifies both gains and losses.', category: 'Risk' },
  
  // Trading Styles
  { term: 'Day Trading', definition: 'Buying and selling within the same day. No positions held overnight.', example: 'Buy AAPL at 10am, sell at 2pm for a quick profit.', videoUrl: 'https://www.youtube.com/watch?v=GsVTH8F0QPA', category: 'Styles' },
  { term: 'Swing Trading', definition: 'Holding positions for days to weeks, capturing medium-term moves.', example: 'Buy the dip, hold for 2 weeks until resistance, then sell.', category: 'Styles' },
  { term: 'Scalping', definition: 'Making many small trades for tiny profits, often within minutes.', example: 'Make 50 trades per day, each targeting $10-20 profit.', category: 'Styles' },
  { term: 'Position Trading', definition: 'Holding for months to years based on long-term trends.', example: 'Buy and hold Amazon for 5 years through market cycles.', category: 'Styles' },
  { term: 'Paper Trading', definition: 'Practicing trading with fake money to learn without risk.', example: 'Use a simulator to test strategies before using real money.', category: 'Styles' },
  
  // Market Terms
  { term: 'Bid', definition: 'The highest price a buyer is willing to pay for an asset.', example: 'AAPL bid at $174.50 means buyers will pay up to that price.', category: 'Market' },
  { term: 'Ask', definition: 'The lowest price a seller is willing to accept for an asset.', example: 'AAPL ask at $174.55 means sellers want at least that price.', category: 'Market' },
  { term: 'Spread', definition: 'The difference between bid and ask price. Tighter spread = more liquid.', example: 'Bid $174.50, Ask $174.55 = $0.05 spread.', category: 'Market' },
  { term: 'IPO', definition: 'Initial Public Offering - when a company first sells shares to the public.', example: 'Facebook IPO was in 2012 at $38 per share.', category: 'Market' },
  { term: 'ETF', definition: 'Exchange Traded Fund - a basket of stocks/assets traded as one unit.', example: 'SPY is an ETF that tracks the S&P 500 index.', videoUrl: 'https://www.youtube.com/watch?v=OwpFBi-jNPM', category: 'Market' },
  { term: 'Index', definition: 'A measurement of a section of the market (e.g., S&P 500, FTSE 100).', example: 'The S&P 500 tracks the 500 largest US companies.', category: 'Market' },
  
  // Crypto Specific
  { term: 'Wallet', definition: 'A digital place to store cryptocurrency, either online (hot) or offline (cold).', example: 'Keep long-term holdings in a cold wallet for security.', category: 'Crypto' },
  { term: 'Gas Fees', definition: 'Transaction fees paid to process operations on a blockchain (especially Ethereum).', example: 'High gas fees during peak times can make small trades unprofitable.', category: 'Crypto' },
  { term: 'DeFi', definition: 'Decentralized Finance - financial services built on blockchain without intermediaries.', example: 'Uniswap is a DeFi exchange for swapping tokens.', category: 'Crypto' },
  { term: 'HODL', definition: 'Hold On for Dear Life - slang for holding crypto through volatility, not selling.', example: 'Bitcoin down 50%? HODL and wait for recovery.', category: 'Crypto' },
  { term: 'Altcoin', definition: 'Any cryptocurrency other than Bitcoin.', example: 'Ethereum, Solana, and Cardano are altcoins.', category: 'Crypto' },
];

const CATEGORIES = ['All', 'Basics', 'Orders', 'Technical', 'Risk', 'Styles', 'Market', 'Crypto'];

export default function LearnPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DICTIONARY.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(search.toLowerCase()) ||
                          term.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || term.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              Trading Dictionary
            </h1>
            <p className="text-slate-400 text-sm">Learn the language of trading</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full bg-slate-800 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              category === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terms List */}
      <div className="space-y-3">
        {filtered.map(term => (
          <div
            key={term.term}
            className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === term.term ? null : term.term)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">{term.term}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">{term.category}</span>
              </div>
              <span className="text-slate-400">{expanded === term.term ? '−' : '+'}</span>
            </button>
            
            {expanded === term.term && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-slate-300">{term.definition}</p>
                
                {term.example && (
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Example:</p>
                    <p className="text-sm text-emerald-400">{term.example}</p>
                  </div>
                )}
                
                {term.videoUrl && (
                  <a
                    href={term.videoUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    <Play className="w-4 h-4" />
                    Watch explanation video
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No terms found. Try a different search.
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">📚 Quick Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">RSI Oversold</p>
            <p className="text-white font-mono">Below 30</p>
          </div>
          <div>
            <p className="text-slate-400">RSI Overbought</p>
            <p className="text-white font-mono">Above 70</p>
          </div>
          <div>
            <p className="text-slate-400">Good Risk/Reward</p>
            <p className="text-white font-mono">2:1 or better</p>
          </div>
          <div>
            <p className="text-slate-400">Max Risk/Trade</p>
            <p className="text-white font-mono">1-2% of capital</p>
          </div>
        </div>
      </div>
    </div>
  );
}
