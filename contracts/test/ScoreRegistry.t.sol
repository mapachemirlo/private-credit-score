// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ScoreRegistry.sol";

contract ScoreRegistryTest is Test {
    ScoreRegistry public registry;
    address public user = address(0x1);

    function setUp() public {
        registry = new ScoreRegistry();
    }

    function testUpdateScore() public {
        registry.updateScore(user, 750, 300, 212, 170, 68);
        
        (ScoreRegistry.CreditScore memory score, bool isValid) = registry.getScore(user);
        
        assertEq(score.overall, 750);
        assertEq(score.loanHistory, 300);
        assertEq(score.liquidationAvoidance, 212);
        assertEq(score.portfolioDiversity, 170);
        assertEq(score.crossChainActivity, 68);
        assertTrue(isValid);
    }

    function testScoreExpiration() public {
        registry.updateScore(user, 750, 300, 212, 170, 68);
        
        // Fast forward 91 days
        vm.warp(block.timestamp + 91 days);
        
        (ScoreRegistry.CreditScore memory score, bool isValid) = registry.getScore(user);
        
        assertFalse(isValid);
        assertTrue(score.exists); // Score still exists but invalid
    }

    function testIsScoreValid() public {
        registry.updateScore(user, 750, 300, 212, 170, 68);
        
        assertTrue(registry.isScoreValid(user));
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 91 days);
        
        assertFalse(registry.isScoreValid(user));
    }

    function testInvalidateExpiredScore() public {
        registry.updateScore(user, 750, 300, 212, 170, 68);
        
        // Fast forward past expiration
        vm.warp(block.timestamp + 91 days);
        
        registry.invalidateExpiredScore(user);
        
        (ScoreRegistry.CreditScore memory score, bool isValid) = registry.getScore(user);
        
        assertFalse(score.exists);
        assertFalse(isValid);
    }

    function testCannotInvalidateValidScore() public {
        registry.updateScore(user, 750, 300, 212, 170, 68);
        
        vm.expectRevert("Score not expired yet");
        registry.invalidateExpiredScore(user);
    }

    function testScoreUpdateEvent() public {
        vm.expectEmit(true, false, false, true);
        emit ScoreRegistry.ScoreUpdated(
            user,
            750,
            block.timestamp,
            block.timestamp + 90 days
        );
        
        registry.updateScore(user, 750, 300, 212, 170, 68);
    }
}
