# MCP Hyperliquid Server

A Model Context Protocol (MCP) server that integrates with Hyperliquid, a decentralized perpetual futures exchange. This server exposes Hyperliquid's trading APIs as MCP tools, allowing AI assistants like Claude to interact with the exchange programmatically.

## Features

### Account & Position Management
- **Query Positions**: View all current open positions with real-time P&L
- **Query Orders**: Access open orders and historical order data
- **Account Information**: Get account balance, margin, and leverage details

### Market Data
- **Real-time Prices**: Fetch current market prices for any perpetual contract
- **Order Book**: View bid/ask depths and spreads
- **Market Statistics**: Access 24h volume, funding rates, and open interest
- **Historical Data**: Query candles/OHLCV data for technical analysis

### Trading Operations
- **Create Orders**: Place limit, market, and stop orders
- **Cancel Orders**: Cancel individual or all open orders
- **Modify Orders**: Update price and size for existing orders
- **Position Management**: Close positions with market orders

### Risk Management
- **Leverage Control**: Adjust leverage for different assets
- **Position Monitoring**: Track unrealized P&L and liquidation prices
- **Order Validation**: Pre-execution checks for price and size parameters

## Installation & Setup

### Prerequisites
- Node.js >= 18
- Claude Desktop App
- Hyperliquid wallet private key

### Integration with Claude Desktop

Add the following configuration to your `claude_desktop_config.json` file:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "hyperliquid": {
      "command": "npx",
      "args": ["-y", "@sondn.contact/mcp-hyperliquid"],
      "env": {
        "HYPERLIQUID_PRIVATE_KEY": "your_private_key_here",
        "HYPERLIQUID_TESTNET": "false"
      }
    }
  }
}
```

**Configuration Parameters:**
- `HYPERLIQUID_PRIVATE_KEY`: Your Hyperliquid wallet private key (required)
- `HYPERLIQUID_TESTNET`: Set to `"true"` for testnet, `"false"` or omit for mainnet

**Restart Claude Desktop** after updating the configuration file.

## Usage Examples

Once configured, you can interact with Hyperliquid through Claude Desktop using natural language:

### Query Examples
```
- "Show all my current positions on Hyperliquid"
- "What are my open orders?"
- "What's the current price of BTC-PERP?"
- "Show me the order book for ETH-PERP"
- "What's my account balance and margin usage?"
```

### Trading Examples
```
- "Create a limit buy order for 0.1 BTC-PERP at $50,000"
- "Place a market sell order for 1 ETH-PERP"
- "Cancel all my open orders"
- "Close my SOL-PERP position"
- "Set leverage to 5x for BTC-PERP"
```

### Analysis Examples
```
- "What's my total unrealized P&L?"
- "Show me the funding rate for all my positions"
- "What's the 24h volume for BTC-PERP?"
- "Get 1-hour candles for ETH-PERP from the last 24 hours"
```

## Security

⚠️ **Important Security Considerations:**
- **Never commit your private key to version control**
- Private keys are configured only in Claude Desktop's config file
- **Always use testnet for development and testing** before trading with real funds
- Validate all trading parameters (price, size, symbol) before execution
- Be aware of slippage on market orders
- Monitor your positions and account balance regularly

## Development

For local development and contributing:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## How It Works

This MCP server acts as a bridge between Claude (or any MCP client) and Hyperliquid:

1. **MCP Protocol**: Communicates with Claude Desktop via stdio using the Model Context Protocol
2. **Hyperliquid APIs**: Integrates with both REST and WebSocket APIs
3. **Authentication**: Uses Ed25519 cryptographic signatures for authenticated requests
4. **Environment Support**: Works with both Hyperliquid mainnet and testnet

**Technology Stack:**
- TypeScript for type-safe development
- MCP SDK for protocol implementation
- Hyperliquid REST API for trading operations
- Hyperliquid WebSocket API for real-time data
- Ed25519 signatures for authentication

## Available MCP Tools

The server exposes the following tools to Claude:

- `get_positions` - Retrieve all open positions
- `get_orders` - Get open and historical orders
- `get_account_info` - Fetch account balance and margin details
- `get_market_data` - Query real-time market data
- `create_order` - Place new orders
- `cancel_order` - Cancel specific orders
- `cancel_all_orders` - Cancel all open orders
- `modify_order` - Update existing orders
- `close_position` - Close positions with market orders

## Troubleshooting

**Server not connecting:**
- Verify the config file path and JSON syntax
- Check that Node.js 18+ is installed: `node --version`
- Restart Claude Desktop after config changes

**Authentication errors:**
- Ensure your private key is correct and properly formatted
- Verify you're using the correct network (mainnet vs testnet)

**Trading errors:**
- Check that you have sufficient balance and margin
- Verify symbol format (e.g., "BTC-PERP" not "BTCUSD")
- Ensure price and size meet exchange requirements

## Resources

- [Hyperliquid Documentation](https://hyperliquid.gitbook.io/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Contact

For inquiries about developing AI Tools or custom MCP Servers, please contact:

**Email:** sondn.5442@gmail.com

Whether you need custom integrations, new MCP server development, or AI tool consulting, feel free to reach out.

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Trading cryptocurrencies carries significant financial risk. Always test on testnet first and never trade with funds you cannot afford to lose.
