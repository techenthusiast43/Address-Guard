import { defineChain } from 'viem';

/**
 * BOT Chain Testnet (Bohr) Network Definition
 * Chain ID: 968
 * RPC: https://rpc.bohr.life
 * Native Token: BOT
 * Total Supply: 150 Million
 * Explorer: https://scan.bohr.life/
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

