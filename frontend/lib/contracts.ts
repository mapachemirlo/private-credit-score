import ScoreRegistryABI from './ScoreRegistryABI.json';

// Contract address will be set from environment variable
// Update .env.local after deploying to Anvil
export const SCORE_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS || 
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

export const SCORE_REGISTRY_ABI = ScoreRegistryABI;

export const contracts = {
  scoreRegistry: {
    address: SCORE_REGISTRY_ADDRESS,
    abi: SCORE_REGISTRY_ABI,
  },
} as const;
