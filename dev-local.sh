#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Private Credit Score - Local Dev  ${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if Anvil is already running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Anvil is already running on port 8545${NC}"
    echo ""
else
    echo -e "${GREEN}Starting Anvil...${NC}"
    echo -e "${YELLOW}Keep this terminal open!${NC}"
    echo ""
    echo "Default accounts available:"
    echo "  Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo ""
    anvil
fi
