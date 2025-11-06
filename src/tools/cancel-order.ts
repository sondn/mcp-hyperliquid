import { HyperliquidClient } from '../hyperliquid-client.js';

interface CancelOrderArgs {
  coin: string;
  order_id?: number;
}

export async function cancelOrder(client: HyperliquidClient, args: CancelOrderArgs) {
  try {
    const { coin, order_id } = args;

    // Validate inputs
    if (!coin || typeof coin !== 'string') {
      throw new Error('Invalid coin symbol');
    }

    // If order_id is provided, cancel specific order
    if (order_id !== undefined && order_id !== null) {
      if (typeof order_id !== 'number') {
        throw new Error('Invalid order_id');
      }

      const result = await client.cancelOrder({
        coin,
        oid: order_id
      });

      return {
        content: [{
          type: 'text',
          text: `✅ Order cancelled successfully\n\n` +
            `**Details:**\n` +
            `  Coin: ${coin}\n` +
            `  Order ID: ${order_id}\n\n` +
            `Result: ${JSON.stringify(result, null, 2)}`
        }]
      };
    }

    // If order_id is not provided, cancel all orders for the coin
    const allOrders = await client.getOpenOrders();
    const coinOrders = allOrders.filter((order: any) => order.coin === coin);

    if (coinOrders.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No open orders found for ${coin}`
        }]
      };
    }

    const cancelPromises = coinOrders.map((order: any) =>
      client.cancelOrder({ coin, oid: order.oid })
    );

    const results = await Promise.all(cancelPromises);

    return {
      content: [{
        type: 'text',
        text: `✅ Cancelled ${coinOrders.length} order(s) for ${coin} successfully\n\n` +
          `Result: ${JSON.stringify(results, null, 2)}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error cancelling order(s): ${error.message}`
      }],
      isError: true
    };
  }
}

export async function cancelAllOrders(client: HyperliquidClient) {
  try {
    const orders = await client.getOpenOrders();

    if (!orders || orders.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No open orders to cancel'
        }]
      };
    }

    const results = await client.cancelAllOrders();

    return {
      content: [{
        type: 'text',
        text: `✅ Cancelled ${orders.length} order(s) successfully\n\n` +
          `Result: ${JSON.stringify(results, null, 2)}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error cancelling all orders: ${error.message}`
      }],
      isError: true
    };
  }
}
