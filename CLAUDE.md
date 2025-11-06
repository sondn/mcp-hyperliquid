# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for Hyperliquid - a decentralized perpetual futures exchange. This server exposes Hyperliquid trading APIs as MCP tools for AI assistants, enabling programmatic interaction with the exchange through natural language.

**Key Features:**
- Query positions, orders, and account information from Hyperliquid accounts
- Create, cancel, and modify orders programmatically
- Real-time market data queries (prices, order books, candles)
- Position management and risk monitoring
- Leverage control and margin tracking
- Authentication via Ed25519 private key signatures
- Support for both mainnet and testnet environments

## Installation via npx

This package is published to npm and can be used directly with Claude Desktop without manual installation:

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

The `-y` flag automatically accepts the package execution without prompting.

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build project (outputs to build/)
npm run dev          # Development mode with watch
npm test             # Run tests
npm run prepare      # Build before publishing
```

## Architecture

**MCP Server Pattern:**
- Entry point: `src/index.ts` (compiled to `build/index.js`)
- Runs as a standalone Node.js process invoked by Claude Desktop via npx
- Communicates via stdio using MCP protocol
- Environment variables for configuration (private key, testnet flag)
- Stateless request/response model

**Hyperliquid Integration:**
- REST API (`https://api.hyperliquid.xyz`) for account queries and order management
- WebSocket API for real-time market data subscriptions
- Ed25519 cryptographic signatures for authenticated requests
- Supports both mainnet and testnet (`https://api.hyperliquid-testnet.xyz`)
- Rate limiting and error handling built-in

**Tool Structure:**
MCP tools are organized by functionality:

*Query Tools:*
- `get_positions` - Retrieve open positions with P&L
- `get_orders` - Get open/historical orders
- `get_account_info` - Fetch account state
- `get_market_data` - Query prices and market stats

*Trading Tools:*
- `create_order` - Place limit/market orders
- `cancel_order` - Cancel specific orders
- `cancel_all_orders` - Bulk cancel
- `modify_order` - Update order parameters
- `close_position` - Market close positions

Each tool:
- Validates input parameters
- Handles API requests with proper error handling
- Generates Ed25519 signatures for authenticated requests
- Returns structured responses with clear error messages

## Configuration

### Environment Variables

- `HYPERLIQUID_PRIVATE_KEY` (required): Hexadecimal private key for wallet authentication
- `HYPERLIQUID_TESTNET` (optional): Set to `"true"` for testnet, `"false"` or omit for mainnet

### Claude Desktop Integration

Private key is configured in `claude_desktop_config.json`:

**File locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

**Configuration example:**
```json
{
  "mcpServers": {
    "hyperliquid": {
      "command": "npx",
      "args": ["-y", "@sondn.contact/mcp-hyperliquid"],
      "env": {
        "HYPERLIQUID_PRIVATE_KEY": "0x1234567890abcdef...",
        "HYPERLIQUID_TESTNET": "false"
      }
    }
  }
}
```

**Important:** Restart Claude Desktop after modifying the configuration.

## Code Structure

```
src/
├── index.ts           # MCP server entry point
├── tools/             # Tool implementations
│   ├── account.ts     # Account/position queries
│   ├── trading.ts     # Order management
│   └── market.ts      # Market data queries
├── hyperliquid/       # API client
│   ├── client.ts      # HTTP client wrapper
│   ├── auth.ts        # Signature generation
│   └── types.ts       # Type definitions
└── utils/             # Helper functions

build/                 # Compiled output (gitignored)
```

## Security Considerations

⚠️ **Critical Security Practices:**

- **Private keys are passed via environment variables** (never hardcoded in source)
- `.env` files are gitignored to prevent accidental commits
- **Always use testnet for development and testing** before mainnet
- Validate all trading parameters before execution (price, size, symbol)
- Handle API rate limits appropriately (429 responses)
- Never log or expose private keys in error messages
- Sanitize user inputs to prevent injection attacks
- Use read-only operations when possible to minimize risk

**For Development:**
1. Use testnet during development (`HYPERLIQUID_TESTNET=true`)
2. Test with small amounts first
3. Implement dry-run modes for testing order logic
4. Add parameter validation before API calls
5. Handle network errors gracefully

## Testing

**Manual Testing with Testnet:**
1. Set `HYPERLIQUID_TESTNET=true` in config
2. Use testnet private key with test funds
3. Test all trading operations before mainnet deployment

**Automated Testing:**
- Unit tests for signature generation and parameter validation
- Integration tests with testnet (when keys provided)
- Mock tests for API responses

## Common Development Tasks

**Adding a new tool:**
1. Define the tool schema in `src/index.ts`
2. Implement the handler function in appropriate file under `src/tools/`
3. Add type definitions in `src/hyperliquid/types.ts` if needed
4. Update documentation in README.md
5. Add tests

**Updating API integration:**
1. Modify client methods in `src/hyperliquid/client.ts`
2. Update type definitions if API response changed
3. Test with testnet first
4. Update tool implementations that use the API

## Publishing

The package is published to npm as `@sondn.contact/mcp-hyperliquid`:

```bash
npm run build        # Build before publishing
npm publish          # Publish to npm
```

Users can then use it directly with `npx -y @sondn.contact/mcp-hyperliquid`.

## Troubleshooting

**Signature errors:**
- Verify private key format (hexadecimal, 64 chars without 0x prefix)
- Ensure timestamp is synchronized
- Check API endpoint (mainnet vs testnet)

**Connection issues:**
- Verify network connectivity
- Check if Hyperliquid API is operational
- Validate MCP protocol communication (stdio)

**Tool not available:**
- Confirm Claude Desktop config is correct
- Restart Claude Desktop after config changes
- Check Node.js version (>= 18 required)

## Resources

- [Hyperliquid API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/download)