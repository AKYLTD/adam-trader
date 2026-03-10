import { NextResponse } from 'next/server';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets/v2';

export async function GET() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }

    const account = await response.json();
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        status: account.status,
        currency: account.currency,
        cash: parseFloat(account.cash),
        portfolioValue: parseFloat(account.portfolio_value),
        buyingPower: parseFloat(account.buying_power),
        daytradeCount: account.daytrade_count,
        patternDayTrader: account.pattern_day_trader,
        tradingBlocked: account.trading_blocked,
        transfersBlocked: account.transfers_blocked,
        accountBlocked: account.account_blocked,
        equity: parseFloat(account.equity),
        lastEquity: parseFloat(account.last_equity),
        longMarketValue: parseFloat(account.long_market_value),
        shortMarketValue: parseFloat(account.short_market_value),
      }
    });
  } catch (error: any) {
    console.error('Alpaca account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
