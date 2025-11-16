# Architecture & Integration Guide

## System Overview

The Private Cross-Chain Credit Score system combines multiple Web3 technologies to create a privacy-preserving, verifiable credit scoring system.

```
┌─────────────┐
│   User      │
│  (Wallet)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│     Frontend (Next.js)          │
│  - Wallet Connection            │
│  - Score Display                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Score Engine (API Route)      │
│  - Data Aggregation             │
│  - Score Calculation            │
└───┬─────────────────────────┬───┘
    │                         │
    ▼                         ▼
┌──────────────┐      ┌──────────────┐
│  The Graph   │      │ Hyperbridge  │
│  (DeFi Data) │      │ (Cross-Chain)│
└──────────────┘      └──────────────┘
    │                         │
    └────────┬────────────────┘
             ▼
    ┌────────────────┐
    │  xx.network    │
    │ (Privacy Layer)│
    └────────┬───────┘
             ▼
    ┌────────────────┐
    │     Arkiv      │
    │ (Time-scoped   │
    │    Storage)    │
    └────────────────┘
             ▼
    ┌────────────────┐
    │ ScoreRegistry  │
    │   (On-chain)   │
    └────────────────┘
```

## Technology Integration

### 1. Hyperbridge (Cross-Chain Verification)

**Purpose**: Aggregate and verify DeFi activity across multiple chains.

**Integration Points**:
- Verify user activity on Ethereum, Arbitrum, Optimism, Base
- Cryptographic proof of cross-chain data integrity
- Use ISMP SDK for cross-chain messaging

**Implementation Status**: Planned
- [ ] Install Hyperbridge ISMP SDK
- [ ] Configure cross-chain RPC endpoints
- [ ] Implement data aggregation logic
- [ ] Verify proofs on-chain

**Code Location**: `backend/hyperbridge-integration.ts` (to be created)

**Resources**:
- SDK: https://docs.hyperbridge.network/developers/ismp-sdk
- Testnet endpoints: https://docs.hyperbridge.network/networks

---

### 2. xx.network (Privacy Layer)

**Purpose**: Protect metadata when querying credit scores (who's checking whose score).

**Integration Points**:
- Proxy score queries through cMixx mixnet
- Quantum-resistant encryption for sensitive data
- Anonymize relationship between scorer and score requester

**Implementation Status**: Planned
- [ ] Set up xx.network client
- [ ] Implement cMixx query proxy
- [ ] Test metadata protection
- [ ] Document privacy guarantees

**Code Location**: `backend/xx-network-proxy.ts` (to be created)

**Resources**:
- cMixx Docs: https://xx.network/developers/cmix
- SDK: https://git.xx.network/

---

### 3. Arkiv (Time-Scoped Storage)

**Purpose**: Store scores with automatic expiration based on risk tier.

**Integration Points**:
- Store credit scores on Arkiv L3 DB-chains (Mendoza testnet)
- Programmable expiration (30/60/90 days based on risk)
- CRUD operations via SDK
- Demo account for hackathon (Mendoza RPC restrictions)

**Implementation Status**: **Completed**
- [x] Set up Arkiv SDK integration
- [x] Implement save/retrieve operations
- [x] Configure dynamic TTL based on score
- [x] Frontend integration with UI

**Code Location**: `frontend/lib/arkiv.ts`

**Key Features Implemented**:
- Dynamic TTL calculation: High risk (30d), Medium (60d), Low (90d)
- Entity creation with structured payload and attributes
- Score verification with entityKey
- Mendoza L3 network configuration

**Resources**:
- Quickstart: https://docs.arkiv.network/quickstart
- TypeScript SDK: https://github.com/arkivnetwork/arkiv-sdk

---

### 4. Kusama (Optional ZK Enhancement)

**Purpose**: Deploy experimental ZK-based scoring logic.

**Integration Points**:
- Deploy ZK circuit for privacy-preserving score calculation
- Use Kusama's experimental ZK infrastructure
- Generate proofs that score was calculated correctly without revealing data

**Implementation Status**: Optional (Advanced)
- [ ] Research Kusama ZK primitives
- [ ] Design ZK circuit for scoring
- [ ] Deploy to Kusama testnet
- [ ] Integrate proofs into main flow

**Resources**:
- Kusama ZK Grants: https://kusama.network
- Polkadot SDK: https://github.com/paritytech/polkadot-sdk

---

## Data Flow

### Score Calculation Flow

1. **User Connects Wallet** → Frontend (wagmi + RainbowKit)

2. **Request Score Calculation** → API Route `/api/calculate-score`

3. **Fetch DeFi Activity**:
   - Query The Graph subgraphs (Aave, Compound)
   - Get transactions from multiple chains via Alchemy/Infura
   
4. **Aggregate Cross-Chain** → Hyperbridge
   - Verify activity on Sepolia, Arbitrum, Optimism, Base
   - Generate cryptographic proof of aggregation
   
5. **Calculate Score**:
   - Loan History (40%): Total borrowed, repayment ratio
   - Liquidation Avoidance (25%): No liquidations = bonus
   - Portfolio Diversity (20%): Different protocols used
   - Cross-Chain Activity (15%): Active on multiple chains

6. **Store with Privacy**:
   - Proxy through xx.network cMixx (protect query metadata)
   - Store on Arkiv with 90-day expiration
   - Update ScoreRegistry contract on-chain

7. **Display to User** → Frontend Dashboard

---

## Smart Contracts

### ScoreRegistry.sol

**Location**: `contracts/src/ScoreRegistry.sol`

**Functions**:
- `updateScore()`: Store new credit score
- `getScore()`: Retrieve score and validity status
- `isScoreValid()`: Check if score is still valid
- `invalidateExpiredScore()`: Clean up expired scores

**Deployment**:
```bash
# Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC_URL --broadcast

# Arbitrum Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --broadcast
```

---

## API Endpoints

### POST `/api/calculate-score`

**Request**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response**:
```json
{
  "overall": 750,
  "breakdown": {
    "loanHistory": 300,
    "liquidationAvoidance": 212,
    "portfolioDiversity": 170,
    "crossChainActivity": 68
  },
  "chains": [
    { "name": "Ethereum Sepolia", "activity": 85 },
    { "name": "Arbitrum Sepolia", "activity": 60 },
    { "name": "Optimism Sepolia", "activity": 40 },
    { "name": "Base Sepolia", "activity": 25 }
  ]
}
```

---

## Next Steps for Full Integration

### Phase 1: Data Layer (Current)
- Basic UI with wallet connection
- Smart contract with time expiration
- API route structure

### Phase 2: Real Data (Priority)
- [ ] Integrate The Graph for Aave/Compound data
- [ ] Query real on-chain transactions
- [ ] Calculate actual scores from DeFi activity

### Phase 3: Cross-Chain (Hyperbridge)
- [ ] Set up Hyperbridge SDK
- [ ] Implement cross-chain data aggregation
- [ ] Verify data integrity with proofs

### Phase 4: Privacy (xx.network)
- [ ] Integrate cMixx for query privacy
- [ ] Implement metadata protection
- [ ] Test anonymization

### Phase 5: Storage (Arkiv)
- [ ] Deploy Arkiv DB-chain
- [ ] Store scores with expiration
- [ ] Handle GLM token payments

### Phase 6: Demo & Polish
- [ ] Create demo video
- [ ] Prepare pitch deck
- [ ] Deploy to production (Vercel + testnets)

---

## Testing Strategy

### Smart Contracts
```bash
cd contracts
forge test -vvv
```

### Frontend
```bash
cd frontend
npm run dev
# Manual testing with MetaMask on Sepolia
```

### Integration
1. Deploy contracts to Sepolia
2. Update contract address in frontend config
3. Test full flow: connect wallet → calculate score → view results
4. Verify score stored on-chain

---

## Security Considerations

1. **Private Keys**: Never commit to git, use environment variables
2. **API Keys**: Use .env.local for sensitive keys
3. **Rate Limiting**: Add rate limits to API routes in production
4. **Score Validation**: Verify score calculations are deterministic
5. **Smart Contract Audits**: Required before mainnet deployment
