import { NextResponse } from 'next/server';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets/v2';

export async function GET() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/clock`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }

    const clock = await response.json();
    
    return NextResponse.json({
      success: true,
      clock: {
        timestamp: clock.timestamp,
        isOpen: clock.is_open,
        nextOpen: clock.next_open,
        nextClose: clock.next_close,
      }
    });
  } catch (error: any) {
    console.error('Alpaca clock error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
