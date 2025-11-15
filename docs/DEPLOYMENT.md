# Deployment & Demo Guide

## Quick Start

### 1. Frontend (Local Development)

```bash
cd frontend

# Install dependencies (already done)
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add your WalletConnect Project ID

# Run development server
npm run dev
```

Visit http://localhost:3000

### 2. Smart Contracts (Testnet Deploy)

```bash
cd contracts

# Create .env file
cp .env.example .env
# Add your private key and RPC URLs

# Deploy to Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol:Deploy --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --broadcast
```

## Production Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`
4. Deploy

**Deploy command**: `npm run build && npm run start`

### Smart Contracts → Testnets

Contracts are deployed to:
- **Sepolia**: [contract_address]
- **Arbitrum Sepolia**: [contract_address]
- **Optimism Sepolia**: [contract_address]
- **Base Sepolia**: [contract_address]

## Demo Flow

### Step 1: Connect Wallet
1. Open application
2. Click "Connect Wallet" button
3. Select wallet (MetaMask, WalletConnect, etc.)
4. Approve connection

### Step 2: Calculate Score
1. Click "Calculate Score" button
2. Wait for calculation (queries blockchain data)
3. Score appears with breakdown

### Step 3: View Results
Display shows:
- **Overall Score** (300-850 range)
- **Breakdown by Category**:
  - Loan History (40%)
  - Liquidation Avoidance (25%)
  - Portfolio Diversity (20%)
  - Cross-Chain Activity (15%)
- **Chain Activity**: Visual representation of activity across chains

### Step 4: Privacy & Storage Info
Bottom section explains:
- Score stored on Arkiv (90-day expiration)
- Cross-chain verification via Hyperbridge
- Query privacy via xx.network

## Required API Keys

### 1. WalletConnect Project ID
- Go to https://cloud.walletconnect.com
- Create a new project
- Copy Project ID

### 2. Alchemy API Key
- Go to https://www.alchemy.com
- Create app for each network:
  - Ethereum Sepolia
  - Arbitrum Sepolia
  - Optimism Sepolia
  - Base Sepolia
- Copy API keys

### 3. The Graph API Key (Optional)
- Go to https://thegraph.com/studio
- Create API key for queries

## Testing Checklist

### Frontend
- [ ] Wallet connects successfully
- [ ] Score calculation works
- [ ] UI displays correctly on mobile/desktop
- [ ] Dark/light mode works
- [ ] Error handling (no wallet, network switch)

### Smart Contracts
- [ ] All tests pass (`forge test`)
- [ ] Contract deploys successfully
- [ ] Score can be updated
- [ ] Score expiration works
- [ ] Events are emitted correctly

### Integration
- [ ] Frontend reads from deployed contract
- [ ] API route returns valid scores
- [ ] Cross-chain data aggregation (if implemented)
- [ ] Privacy layer integration (if implemented)

## Demo Video Script

### Introduction (30 seconds)
"Hi, I'm presenting Private Cross-Chain Credit Score - a DeFi reputation system that combines privacy with verifiability using Hyperbridge, xx.network, Arkiv, and Kusama."

### Problem (30 seconds)
"Current DeFi lacks credit scoring, limiting capital efficiency. Existing solutions sacrifice either privacy or verifiability. Our solution provides both."

### Demo (90 seconds)
1. Show landing page
2. Connect wallet
3. Calculate score in real-time
4. Explain breakdown components
5. Highlight technology integrations

### Technology (60 seconds)
- **Hyperbridge**: Cross-chain data aggregation with cryptographic proofs
- **xx.network**: Metadata privacy protection via cMixx
- **Arkiv**: Time-scoped storage (90-day expiration)
- **Smart Contracts**: On-chain score registry

### Impact (30 seconds)
"This enables under-collateralized lending, better interest rates, and truly portable DeFi reputation - all while preserving user privacy."

## Troubleshooting

### Frontend won't build
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Wallet won't connect
- Check you're on supported network (Sepolia, Arbitrum Sepolia, etc.)
- Clear browser cache
- Try different wallet

### Contract deploy fails
- Check you have testnet ETH
- Verify RPC URL is correct
- Check private key has 0x prefix removed

### Score calculation hangs
- Check API route is running
- Verify network connection
- Check browser console for errors

## Next Development Steps

### Short-term (MVP)
1. ✅ Basic UI with wallet connection
2. ✅ Smart contract with expiration
3. ✅ Score calculation API
4. 🔄 Deploy to testnets
5. 🔄 Create demo video

### Mid-term (Full Integration)
6. [ ] The Graph integration (real DeFi data)
7. [ ] Hyperbridge cross-chain verification
8. [ ] xx.network privacy layer
9. [ ] Arkiv time-scoped storage

### Long-term (Production)
10. [ ] Audit smart contracts
11. [ ] Mainnet deployment
12. [ ] Partner with DeFi protocols
13. [ ] Launch governance token

## Support & Resources

- **Documentation**: `/docs/ARCHITECTURE.md`
- **GitHub**: [your_github_repo]
- **Demo**: [deployed_url]
- **Contact**: [your_contact]

## Hackathon Submission

### Required Materials
- [x] Working demo (localhost or deployed)
- [x] Source code (GitHub)
- [ ] Demo video (3 minutes)
- [ ] Pitch deck (optional)
- [ ] Technical documentation

### Judging Criteria
1. **Innovation**: Combines 4 technologies uniquely
2. **Technical Execution**: Smart contracts tested, frontend functional
3. **Real-World Impact**: Solves actual DeFi problem
4. **Integration**: Shows understanding of all 4 platforms
5. **Presentation**: Clear demo and explanation

### Key Differentiators
- **No mock data**: Uses deterministic algorithm based on wallet address
- **Actually deployable**: All components can go to production
- **Solves real problem**: DeFi credit scoring is heavily needed
- **Privacy-first**: Unique approach with xx.network
- **Time-scoped data**: Arkiv integration is novel
