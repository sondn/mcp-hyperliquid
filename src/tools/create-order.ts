import { HyperliquidClient } from '../hyperliquid-client.js';

interface CreateOrderArgs {
  coin: string;
  is_buy: boolean;
  size: number;
  price?: number;
  order_type?: 'Gtc' | 'Ioc' | 'Alo';
  reduce_only?: boolean;
  slippage?: number;
}

export async function createOrder(client: HyperliquidClient, args: CreateOrderArgs) {
  try {
    const {
      coin,
      is_buy,
      size,
      price,
      order_type,
      reduce_only = false,
      slippage = 0.05
    } = args;

    // Validate inputs
    if (!coin || typeof coin !== 'string') {
      throw new Error('Invalid coin symbol');
    }
    if (typeof is_buy !== 'boolean') {
      throw new Error('is_buy must be a boolean');
    }
    if (size <= 0) {
      throw new Error('Size must be greater than 0');
    }

    let finalPrice: number;
    let finalOrderType: 'Gtc' | 'Ioc' | 'Alo';
    let isMarketOrder = false;

    // Market order: no price provided
    if (price === undefined || price === null) {
      isMarketOrder = true;

      // Get current mid price from Hyperliquid
      const allMids = await client.getAllMids();
      const marketPrice = parseFloat(allMids[coin]);

      if (!marketPrice) {
        throw new Error(`Cannot get market price for ${coin}`);
      }

      // Apply 5% price adjustment for market order (buy 5% higher, sell 5% lower)
      finalPrice = is_buy
        ? marketPrice * (1 + slippage)
        : marketPrice * (1 - slippage);

      finalPrice = parseFloat(finalPrice.toFixed(2));
      // Market orders should use IOC (Immediate or Cancel)
      finalOrderType = 'Ioc';
    } else {
      // Limit order: price provided
      if (price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      finalPrice = price;
      finalOrderType = order_type || 'Gtc';
    }

    const result = await client.placeOrder({
      coin,
      is_buy,
      sz: size,
      limit_px: finalPrice,
      order_type: { limit: { tif: finalOrderType } },
      reduce_only
    });

    const orderTypeText = isMarketOrder ? 'MARKET' : `LIMIT (${finalOrderType})`;

    return {
      content: [{
        type: 'text',
        text: `✅ Order created successfully\n\n` +
          `**Details:**\n` +
          `  Coin: ${coin}\n` +
          `  Side: ${is_buy ? 'BUY' : 'SELL'}\n` +
          `  Size: ${size}\n` +
          `  Type: ${orderTypeText}\n` +
          `  Price: $${finalPrice.toFixed(2)}${isMarketOrder ? ' (with slippage)' : ''}\n` +
          `  Reduce Only: ${reduce_only ? 'Yes' : 'No'}\n\n` +
          `Result: ${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error creating order: ${error.message}`
      }],
      isError: true
    };
  }
}
