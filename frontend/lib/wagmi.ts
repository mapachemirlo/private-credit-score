import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia, localhost } from 'wagmi/chains';
import { defineChain } from 'viem';

// Mendoza - Arkiv's L3 testnet for hackathons
export const mendoza = defineChain({
  id: 60138453056,
  name: 'Mendoza (Arkiv)',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mendoza.hoodi.arkiv.network/rpc'],
      webSocket: ['wss://mendoza.hoodi.arkiv.network/rpc/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mendoza Explorer',
      url: 'https://mendoza.hoodi.arkiv.network',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Private Cross-Chain Credit Score',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    mendoza, // Arkiv L3 for score storage with TTL
    localhost, // Anvil local network (chain ID 31337)
    sepolia, 
    arbitrumSepolia, 
    optimismSepolia, 
    baseSepolia
  ],
  ssr: true,
});
