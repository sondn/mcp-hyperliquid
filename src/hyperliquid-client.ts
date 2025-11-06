import { InfoClient, ExchangeClient, HttpTransport } from '@nktkas/hyperliquid';

export class HyperliquidClient {
  private info: InfoClient;
  private exchange: ExchangeClient;
  private walletAddress: string;
  private isTestnet: boolean;

  constructor(privateKey: string, isTestnet: boolean = false) {
    this.isTestnet = isTestnet;

    // Initialize HTTP transport
    const transport = new HttpTransport({
      isTestnet,
    });

    // Initialize APIs
    this.info = new InfoClient({ transport });
    this.exchange = new ExchangeClient({
      transport,
      wallet: privateKey,
    });

    // Get wallet address from private key
    this.walletAddress = (this.exchange.wallet as any).address;
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  getIsTestnet(): boolean {
    return this.isTestnet;
  }

  // Query methods
  async getUserState() {
    return await this.info.clearinghouseState({ user: this.walletAddress });
  }

  async getOpenOrders() {
    return await this.info.openOrders({ user: this.walletAddress });
  }

  async getAllMids() {
    return await this.info.allMids();
  }

  async getMetaAndAssetCtxs() {
    return await this.info.metaAndAssetCtxs();
  }

  // Helper method to get asset ID from coin symbol
  private async getAssetId(coin: string): Promise<number> {
    const meta: any = await this.getMetaAndAssetCtxs();
    const assetIndex = meta[0].universe.findIndex((asset: any) => asset.name === coin);
    if (assetIndex === -1) {
      throw new Error(`Asset ${coin} not found`);
    }
    return assetIndex;
  }

  // Trading methods
  async placeOrder(params: {
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: { limit: { tif: 'Gtc' | 'Ioc' | 'Alo' } } | { trigger: { triggerPx: number; isMarket: boolean; tpsl: 'tp' | 'sl' } };
    reduce_only: boolean;
  }) {
    console.error('placeOrder', params);
    const assetId = await this.getAssetId(params.coin);

    return await this.exchange.order({
      orders: [{
        a: assetId,
        b: params.is_buy,
        p: params.limit_px.toString(),
        s: params.sz.toString(),
        r: params.reduce_only,
        t: params.order_type,
      }],
    });
  }

  async cancelOrder(params: {
    coin: string;
    oid: number;
  }) {
    const assetId = await this.getAssetId(params.coin);

    return await this.exchange.cancel({
      cancels: [{
        a: assetId,
        o: params.oid,
      }],
    });
  }

  async cancelAllOrders(coin?: string) {
    const orders = await this.getOpenOrders();
    const cancelPromises = orders.map((order: any) =>
      this.cancelOrder({ coin: order.coin, oid: order.oid })
    );
    return await Promise.all(cancelPromises);
  }

  async modifyOrder(params: {
    coin: string;
    oid: number;
    order: {
      limit_px: number;
      sz: number;
      order_type: { limit: { tif: 'Gtc' | 'Ioc' | 'Alo' } };
      reduce_only: boolean;
    };
  }) {
    const assetId = await this.getAssetId(params.coin);

    return await this.exchange.modify({
      oid: params.oid,
      order: {
        a: assetId,
        b: true, // This should be determined from existing order
        p: params.order.limit_px.toString(),
        s: params.order.sz.toString(),
        r: params.order.reduce_only,
        t: params.order.order_type,
      },
    });
  }
}
