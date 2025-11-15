#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Deploying to Anvil Local Network  ${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if Anvil is running
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Anvil is not running!${NC}"
    echo -e "   Start it first with: ${GREEN}./dev-local.sh${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Anvil is running${NC}"
echo ""

# Deploy contract
cd contracts
echo "Deploying ScoreRegistry.sol..."
echo ""

forge script script/DeployLocal.s.sol:DeployLocal \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast \
    -vvv

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Copy the contract address from above"
echo "  2. Update frontend/.env.local with the address"
echo "  3. Start frontend: cd frontend && npm run dev"
echo ""
