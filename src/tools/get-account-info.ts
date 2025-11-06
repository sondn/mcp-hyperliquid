import { HyperliquidClient } from '../hyperliquid-client.js';

export async function getAccountInfo(client: HyperliquidClient) {
  try {
    const userState = await client.getUserState();
    const openOrders = await client.getOpenOrders();

    if (!userState) {
      return {
        content: [{
          type: 'text',
          text: 'Unable to fetch account information'
        }],
        isError: true
      };
    }

    // Get wallet address
    const walletAddress = client.getWalletAddress();

    // Get total balances
    const crossMarginSummary = userState.crossMarginSummary;
    const accountValue = crossMarginSummary.accountValue || '0';
    const totalRawUsd = crossMarginSummary.totalRawUsd || '0';
    const totalMarginUsed = crossMarginSummary.totalMarginUsed || '0';
    const withdrawable = userState.withdrawable || '0';

    // Get current positions
    const positions = userState.assetPositions
      ?.filter((pos: any) => parseFloat(pos.position.szi) !== 0)
      .map((pos: any) => ({
        coin: pos.position.coin,
        size: pos.position.szi,
        entryPrice: pos.position.entryPx,
        unrealizedPnl: pos.position.unrealizedPnl,
        marginUsed: pos.position.marginUsed
      })) || [];

    // Format pending orders
    const pendingOrders = openOrders.map((order: any) => ({
      coin: order.coin,
      side: order.side,
      size: order.sz,
      price: order.limitPx,
      orderId: order.oid,
      orderType: order.orderType
    }));

    // Build response
    const response = [
      `**Account Information**`,
      ``,
      `**Wallet Address:** ${walletAddress}`,
      ``,
      `**Balances:**`,
      `  Account Value: $${accountValue}`,
      `  Total Raw USD: $${totalRawUsd}`,
      `  Total Margin Used: $${totalMarginUsed}`,
      `  Withdrawable: $${withdrawable}`,
      ``,
      `**Current Positions (${positions.length}):**`
    ];

    if (positions.length === 0) {
      response.push(`  No open positions`);
    } else {
      positions.forEach((pos: any) => {
        response.push(
          `  • ${pos.coin}: ${pos.size} @ $${pos.entryPrice}`,
          `    Unrealized PnL: $${pos.unrealizedPnl}`,
          `    Margin Used: $${pos.marginUsed}`
        );
      });
    }

    response.push(``);
    response.push(`**Pending Orders (${pendingOrders.length}):**`);

    if (pendingOrders.length === 0) {
      response.push(`  No pending orders`);
    } else {
      pendingOrders.forEach((order: any) => {
        response.push(
          `  • ${order.coin} ${order.side.toUpperCase()}: ${order.size} @ $${order.price}`,
          `    Order ID: ${order.orderId} | Type: ${order.orderType}`
        );
      });
    }

    return {
      content: [{
        type: 'text',
        text: response.join('\n')
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error fetching account information: ${error.message}`
      }],
      isError: true
    };
  }
}
