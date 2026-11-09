import { defineChain } from 'viem';

/**
 * BOT Chain Mainnet Definition
 * Chain ID: 677
 * RPC: https://rpc.botchain.ai
 * Native Token: BOT
 * Total Supply: 150 Million
 * Explorer: https://scan.botchain.ai
 */
export const botChain = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotScan',
      url: 'https://scan.botchain.ai',
    },
  },
});

/**
 * Localhost Testing Chain (Hardhat Node)
 * Chain ID: 31337
 * RPC: http://127.0.0.1:8545
 */
export const localhostChain = defineChain({
  id: 31337,
  name: 'Localhost (Hardhat)',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
});

export const defaultChain = botChain;
