import { HyperliquidClient } from '../hyperliquid-client.js';

export async function getPositions(client: HyperliquidClient) {
  try {
    const userState = await client.getUserState();

    if (!userState || !userState.assetPositions) {
      return {
        content: [{
          type: 'text',
          text: 'No positions found'
        }]
      };
    }

    const positions = userState.assetPositions
      .filter((pos: any) => parseFloat(pos.position.szi) !== 0)
      .map((pos: any) => ({
        coin: pos.position.coin,
        size: pos.position.szi,
        entryPrice: pos.position.entryPx,
        unrealizedPnl: pos.position.unrealizedPnl,
        returnOnEquity: pos.position.returnOnEquity,
        leverage: pos.position.leverage?.value || 'N/A',
        liquidationPrice: pos.position.liquidationPx || 'N/A',
        marginUsed: pos.position.marginUsed
      }));

    if (positions.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No open positions'
        }]
      };
    }

    const formattedPositions = positions.map((pos: any) =>
      `**${pos.coin}**\n` +
      `  Size: ${pos.size}\n` +
      `  Entry Price: $${pos.entryPrice}\n` +
      `  Unrealized PnL: $${pos.unrealizedPnl}\n` +
      `  ROE: ${pos.returnOnEquity}\n` +
      `  Leverage: ${pos.leverage}\n` +
      `  Liquidation Price: ${pos.liquidationPrice}\n` +
      `  Margin Used: $${pos.marginUsed}`
    ).join('\n\n');

    return {
      content: [{
        type: 'text',
        text: `**Current Positions (${positions.length})**\n\n${formattedPositions}`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error fetching positions: ${error.message}`
      }],
      isError: true
    };
  }
}
