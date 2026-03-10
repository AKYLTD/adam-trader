// Watchlist - Track followed assets

export interface WatchedAsset {
  symbol: string;
  followedAt: number;
  priceAtFollow: number;
}

const STORAGE_KEY = 'watchlist';

export function getWatchlist(): WatchedAsset[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveWatchlist(watchlist: WatchedAsset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
}

export function followAsset(symbol: string, currentPrice: number): void {
  const watchlist = getWatchlist();
  if (!watchlist.find(w => w.symbol === symbol)) {
    watchlist.push({
      symbol,
      followedAt: Date.now(),
      priceAtFollow: currentPrice,
    });
    saveWatchlist(watchlist);
  }
}

export function unfollowAsset(symbol: string): void {
  const watchlist = getWatchlist().filter(w => w.symbol !== symbol);
  saveWatchlist(watchlist);
}

export function isFollowing(symbol: string): boolean {
  return getWatchlist().some(w => w.symbol === symbol);
}

export function getFollowedAsset(symbol: string): WatchedAsset | undefined {
  return getWatchlist().find(w => w.symbol === symbol);
}
