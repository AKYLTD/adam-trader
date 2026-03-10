import { NextRequest, NextResponse } from 'next/server';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets/v2';

// Get orders
export async function GET() {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/orders?status=all&limit=50`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }

    const orders = await response.json();
    
    return NextResponse.json({
      success: true,
      orders: orders.map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        qty: parseFloat(order.qty),
        filledQty: parseFloat(order.filled_qty || 0),
        type: order.type,
        side: order.side,
        status: order.status,
        limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
        stopPrice: order.stop_price ? parseFloat(order.stop_price) : null,
        filledAvgPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
        createdAt: order.created_at,
        filledAt: order.filled_at,
      }))
    });
  } catch (error: any) {
    console.error('Alpaca orders error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Place order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, qty, side, type = 'market', timeInForce = 'day', limitPrice, stopPrice } = body;

    if (!symbol || !qty || !side) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const orderData: any = {
      symbol,
      qty: qty.toString(),
      side,
      type,
      time_in_force: timeInForce,
    };

    if (limitPrice) orderData.limit_price = limitPrice.toString();
    if (stopPrice) orderData.stop_price = stopPrice.toString();

    const response = await fetch(`${ALPACA_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: result.message || 'Failed to place order' 
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        symbol: result.symbol,
        qty: parseFloat(result.qty),
        side: result.side,
        type: result.type,
        status: result.status,
      }
    });
  } catch (error: any) {
    console.error('Alpaca order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
