import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Private Cross-Chain Credit Score',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    localhost, // Anvil local network (chain ID 31337)
    sepolia, 
    arbitrumSepolia, 
    optimismSepolia, 
    baseSepolia
  ],
  ssr: true,
});
