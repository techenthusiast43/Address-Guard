import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient } from '@tanstack/react-query';
import { botChain, localhostChain } from './chain';

// Get or fallback to a standard public Reown projectId
const rawProjectId = import.meta.env.VITE_REOWN_PROJECT_ID;
export const projectId =
  rawProjectId && rawProjectId.trim() !== ''
    ? rawProjectId.trim()
    : 'b56e18d47c72ab683b10814fe9495694';

export const metadata = {
  name: 'AddressGuard',
  description: 'Personal Trusted Wallet Address Manager on BOT Chain',
  url: 'https://addressguard.local',
  icons: ['https://scan.botchain.ai/favicon.ico'],
};

// BOT Chain is default, Localhost is available for local testing
export const networks = [botChain, localhostChain];

// Initialize Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: false,
});

// Initialize Reown AppKit Modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: botChain,
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#14b8a6',
    '--w3m-border-radius-master': '8px',
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});

export const queryClient = new QueryClient();
