import { HyperliquidClient } from '../hyperliquid-client.js';

export async function getMarketData(client: HyperliquidClient, args: { coin: string }) {
  try {
    const { coin } = args;

    if (!coin) {
      return {
        content: [{
          type: 'text',
          text: 'Error: coin parameter is required'
        }],
        isError: true
      };
    }

    // Get all market data
    const [metaAndAssetCtxs, allMids] = await Promise.all([
      client.getMetaAndAssetCtxs(),
      client.getAllMids()
    ]);

    // Find the asset in the universe
    const meta: any = metaAndAssetCtxs;
    const universe = meta[0].universe;
    const assetIndex = universe.findIndex((asset: any) => asset.name === coin);

    if (assetIndex === -1) {
      return {
        content: [{
          type: 'text',
          text: `Asset ${coin} not found. Please check the coin symbol.`
        }],
        isError: true
      };
    }

    const assetInfo = universe[assetIndex];
    const assetCtx = meta[1][assetIndex];

    // Get mid price for this asset
    const midPrice = (allMids as any)[coin] || 'N/A';

    // Build response
    const response = [
      `**Market Data for ${coin}**`,
      ``,
      `**Price Information:**`,
      `  Current Mid Price: $${midPrice}`,
      `  Mark Price: $${assetCtx.markPx || 'N/A'}`,
      `  Oracle Price: $${assetCtx.oraclePx || 'N/A'}`,
      ``,
      `**Asset Details:**`,
      `  Name: ${assetInfo.name}`,
      `  Sz Decimals: ${assetInfo.szDecimals}`,
      ``,
      `**Market Stats:**`,
      `  24h Volume: $${assetCtx.dayNtlVlm || 'N/A'}`,
      `  Open Interest: ${assetCtx.openInterest || 'N/A'}`,
      `  Funding Rate: ${assetCtx.funding || 'N/A'}`,
      `  Premium: ${assetCtx.premium || 'N/A'}`,
      ``,
      `**Price Bands:**`,
      `  Previous Day Px: $${assetCtx.prevDayPx || 'N/A'}`,
      ``,
      `**Liquidity:**`,
      `  Max Leverage: ${assetInfo.maxLeverage || 'N/A'}x`,
      `  Only Isolated: ${assetInfo.onlyIsolated || false}`
    ];

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
        text: `Error fetching market data: ${error.message}`
      }],
      isError: true
    };
  }
}
