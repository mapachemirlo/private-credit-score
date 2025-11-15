// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ScoreRegistry.sol";

/**
 * @title DeployLocal
 * @notice Deploy script for local Anvil network
 * @dev Uses Anvil's default account (no .env needed)
 */
contract DeployLocal is Script {
    function run() external {
        // Anvil default private key (account 0)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerPrivateKey);
        
        ScoreRegistry registry = new ScoreRegistry();
        
        console.log("===========================================");
        console.log("ScoreRegistry deployed at:", address(registry));
        console.log("Network: Anvil Local (Chain ID: 31337)");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("===========================================");
        
        vm.stopBroadcast();
    }
}
