# Private Credit Score

MVP for hackathon combining Hyperbridge, xx.network, Arkiv, and Kusama.

## Architecture

```
┌─────────────────┐
│   Frontend      │ Next.js + wagmi + RainbowKit
│   (Next.js)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Score Engine   │ Aggregates on-chain DeFi activity
│   (Node.js)     │ from multiple chains
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬─────────────┐
    │         │              │             │
┌───▼────┐ ┌─▼─────────┐ ┌──▼──────┐ ┌───▼────────┐
│Hyperb. │ │xx.network │ │ Arkiv   │ │  Ethereum  │
│Cross-  │ │ cMixx     │ │Time-    │ │  Sepolia   │
│Chain   │ │ Privacy   │ │scoped   │ │  + Arb     │
└────────┘ └───────────┘ └─────────┘ └────────────┘
```

## Features

- **Cross-Chain Reputation**: Aggregates DeFi activity from Ethereum, Arbitrum, Optimism, Base
- **Privacy-Preserving**: xx.network protects metadata when querying scores
- **Time-Scoped Data**: Scores expire automatically via Arkiv (90-day validity)
- **Verifiable**: Hyperbridge ensures cryptographic proof of cross-chain data

## Tech Stack

- **Smart Contracts**: Foundry (Solidity)
- **Frontend**: Next.js 14 + TypeScript
- **Web3**: wagmi v2 + viem + RainbowKit
- **Backend**: Node.js API routes
- **Interoperability**: Hyperbridge ISMP SDK
- **Privacy**: xx.network cMixx
- **Storage**: Arkiv DB-chains

## Project Structure

```
├── contracts/          # Foundry smart contracts
├── backend/           # Score calculation engine
├── frontend/          # Next.js application
└── docs/             # Architecture & integration docs
```

## Getting Started

See individual README files in each directory.

## Scoring Algorithm

Score is calculated based on:
1. **Loan History** (40%): Repayment ratio, total borrowed
2. **Liquidation Avoidance** (25%): Zero liquidations = bonus
3. **Portfolio Diversity** (20%): Assets across multiple protocols
4. **Cross-Chain Activity** (15%): Active on 2+ chains

Score range: 300-850 (traditional credit score model)

## License

MIT
