import { HyperliquidClient } from '../hyperliquid-client.js';

export async function getOrders(client: HyperliquidClient) {
  try {
    const orders = await client.getOpenOrders();

    if (!orders || orders.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No open orders'
        }]
      };
    }

    const formattedOrders = orders.map((order: any) =>
      `**Order ID: ${order.oid}**\n` +
      `  Coin: ${order.coin}\n` +
      `  Side: ${order.side}\n` +
      `  Size: ${order.sz}\n` +
      `  Limit Price: $${order.limitPx}\n` +
      `  Reduce Only: ${order.reduceOnly ? 'Yes' : 'No'}\n` +
      `  Order Type: ${order.orderType}\n` +
      `  Timestamp: ${new Date(order.timestamp).toLocaleString()}`
    ).join('\n\n');

    return {
      content: [{
        type: 'text',
        text: `**Open Orders (${orders.length})**\n\n${formattedOrders}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error fetching orders: ${error.message}`
      }],
      isError: true
    };
  }
}
