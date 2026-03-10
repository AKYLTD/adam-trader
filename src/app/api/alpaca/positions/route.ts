import { NextResponse } from 'next/server';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets/v2';

export async function GET() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/positions`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }

    const positions = await response.json();
    
    return NextResponse.json({
      success: true,
      positions: positions.map((pos: any) => ({
        symbol: pos.symbol,
        qty: parseFloat(pos.qty),
        avgEntryPrice: parseFloat(pos.avg_entry_price),
        currentPrice: parseFloat(pos.current_price),
        marketValue: parseFloat(pos.market_value),
        costBasis: parseFloat(pos.cost_basis),
        unrealizedPl: parseFloat(pos.unrealized_pl),
        unrealizedPlpc: parseFloat(pos.unrealized_plpc),
        side: pos.side,
      }))
    });
  } catch (error: any) {
    console.error('Alpaca positions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
