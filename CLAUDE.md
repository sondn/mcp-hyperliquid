# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for Hyperliquid - a decentralized perpetual futures exchange. This server exposes Hyperliquid trading APIs as MCP tools for AI assistants.

**Key Features:**
- Query positions and orders from Hyperliquid accounts
- Create/cancel orders programmatically
- Market data queries
- Authentication via Ed25519 private key signatures

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build project
npm run dev          # Development mode
npm test             # Run tests
```

## Architecture

**MCP Server Pattern:**
- Entry point: `build/index.js` (compiled output)
- Runs as a standalone Node.js process invoked by Claude Desktop
- Communicates via stdio using MCP protocol
- Environment variables for configuration (private key, testnet flag)

**Hyperliquid Integration:**
- REST API for account queries and order management
- WebSocket API for real-time market data
- Ed25519 cryptographic signatures for authenticated requests
- Supports both mainnet and testnet environments

**Tool Structure:**
MCP tools should be organized by functionality:
- Query tools: get_positions, get_orders, get_market_data
- Trading tools: create_order, cancel_order, modify_order
- Each tool handles API requests, signature generation, and error handling

## Configuration

Private key is configured in `claude_desktop_config.json` as an environment variable:
```json
{
  "mcpServers": {
    "hyperliquid": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "HYPERLIQUID_PRIVATE_KEY": "...",
        "HYPERLIQUID_TESTNET": "false"
      }
    }
  }
}
```

## Security Considerations

- Private keys are passed via environment variables (never hardcoded)
- `.env` files are gitignored
- Always use testnet for development and testing
- Validate all trading parameters before execution (price, size, symbol)
- Handle API rate limits appropriately
