import { defineChain } from 'viem';

/**
 * BOT Chain Mainnet Definition
 * Chain ID: 677
 * RPC: https://rpc.botchain.ai
 * Native Token: BOT
 * Total Supply: 150 Million
 * Explorer: https://scan.botchain.ai
 */
export const botChainMainnet = defineChain({
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
  testnet: false,
});

/**
 * BOT Chain Testnet (Bohr)
 * Chain ID: 968
 * RPC: https://rpc.bohr.life
 */
export const bohrTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// Primary default network is Mainnet
export const defaultChain = botChainMainnet;
