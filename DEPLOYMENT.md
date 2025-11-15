# Deployment Guide

## Deploy Frontend to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click "Add New" → "Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=0x... (your deployed contract)
   NEXT_PUBLIC_CHAIN_ID=11155111 (Sepolia) or 31337 (local)
   ```

7. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Follow prompts:
# - Set root directory to: frontend
# - Use default settings for Next.js
```

### Post-Deployment Checklist

- [ ] Verify Mendoza network is accessible
- [ ] Test wallet connection
- [ ] Test score calculation
- [ ] Test Arkiv integration (save & verify)
- [ ] Check all links work (Arkiv website, Mendoza network)

### Environment Variables for Production

If deploying to mainnet or public testnet:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id

# Smart Contract Address (deploy to Sepolia first)
NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=0x... 

# Chain ID (Sepolia testnet)
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Updating After Deployment

Every push to `main` branch will trigger automatic deployment.

For manual redeployment:
```bash
vercel --prod
```

### Custom Domain (Optional)

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Troubleshooting

**Build fails:**
- Check that `frontend/package.json` has all dependencies
- Verify Node.js version compatibility (18+)

**Environment variables not working:**
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding new variables

**Wallet connection issues:**
- Verify WalletConnect Project ID is correct
- Check that Mendoza network is configured in wagmi.ts

### Performance Optimization

Vercel automatically optimizes:
- Image optimization
- Edge caching
- Compression
- Code splitting

No additional configuration needed!

## Deploy Smart Contracts to Testnet

See [contracts/README.md](contracts/README.md) for instructions on deploying smart contracts to Sepolia or other testnets.

Quick reference:
```bash
cd contracts

# Deploy to Sepolia
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

Update `NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS` in Vercel after deployment.
