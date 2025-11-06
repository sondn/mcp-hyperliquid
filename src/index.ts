#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HyperliquidClient } from './hyperliquid-client.js';
import { getPositions } from './tools/get-positions.js';
import { getOrders } from './tools/get-orders.js';
import { createOrder } from './tools/create-order.js';
import { cancelOrder, cancelAllOrders } from './tools/cancel-order.js';

// Validate environment variables
const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: HYPERLIQUID_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

const isTestnet = process.env.HYPERLIQUID_TESTNET === 'true';

// Initialize Hyperliquid client
const hyperliquidClient = new HyperliquidClient(privateKey, isTestnet);

// Create MCP server
const server = new Server(
  {
    name: 'mcp-hyperliquid',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_positions',
        description: 'Get all current open positions on Hyperliquid',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_orders',
        description: 'Get all open orders on Hyperliquid',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_order',
        description: 'Create a new order on Hyperliquid. Using for create new order or cancel position. If coin is in position, cancel position means create new order with opposite side and size to close the position.',
        inputSchema: {
          type: 'object',
          properties: {
            coin: {
              type: 'string',
              description: 'Trading pair symbol (e.g., BTC, ETH)',
            },
            is_buy: {
              type: 'boolean',
              description: 'True for buy order, false for sell order',
            },
            size: {
              type: 'number',
              description: 'Order size/quantity',
            },
            price: {
              type: 'number',
              description: 'Limit price for the order. Never get price from chat history, only from user input, if not provided, ignore this field.',
            },
            order_type: {
              type: 'string',
              enum: ['Gtc', 'Ioc', 'Alo'],
              description: 'Order type: Gtc (Good til canceled), Ioc (Immediate or cancel), Alo (Add liquidity only). For market orders, this is automatically set to Ioc.',
            },
            reduce_only: {
              type: 'boolean',
              description: 'Whether this is a reduce-only order',
              default: false,
            },
            slippage: {
              type: 'number',
              description: 'Slippage tolerance for market orders (e.g., 0.01 for 1%). Default is 0.01.',
              default: 0.01,
            },
          },
          required: ['coin', 'is_buy', 'size'],
        },
      },
      {
        name: 'cancel_order',
        description: `Cancel order(s) on Hyperliquid. If order_id is provided, cancels that specific order. If order_id is not provided, cancels all orders for the specified coin.
        If coin is in position, cancel position means create new order with opposite side and size to close the position.`,
        inputSchema: {
          type: 'object',
          properties: {
            coin: {
              type: 'string',
              description: 'Trading pair symbol (e.g., BTC, ETH)',
            },
            order_id: {
              type: 'number',
              description: 'Order ID to cancel. If not provided, all orders for this coin will be cancelled.',
            },
          },
          required: ['coin'],
        },
      },
      {
        name: 'cancel_all_orders',
        description: 'Cancel all open orders',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_positions':
        return await getPositions(hyperliquidClient);

      case 'get_orders':
        return await getOrders(hyperliquidClient);

      case 'create_order':
        return await createOrder(hyperliquidClient, args as any);

      case 'cancel_order':
        return await cancelOrder(hyperliquidClient, args as any);

      case 'cancel_all_orders':
        return await cancelAllOrders(hyperliquidClient);

      default:
        return {
          content: [{
            type: 'text',
            text: `Unknown tool: ${name}`,
          }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error executing ${name}: ${error.message}`,
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Hyperliquid server running on stdio');
  console.error(`Wallet: ${hyperliquidClient.getWalletAddress()}`);
  console.error(`Network: ${isTestnet ? 'Testnet' : 'Mainnet'}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
