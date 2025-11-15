// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScoreRegistry
 * @notice Stores credit scores with time-based expiration
 * @dev Integrates with Arkiv for time-scoped data storage
 */
contract ScoreRegistry {
    struct CreditScore {
        uint256 overall;
        uint256 loanHistory;
        uint256 liquidationAvoidance;
        uint256 portfolioDiversity;
        uint256 crossChainActivity;
        uint256 timestamp;
        uint256 expiresAt;
        bool exists;
    }

    // address => credit score
    mapping(address => CreditScore) public scores;
    
    // Score validity period (90 days)
    uint256 public constant SCORE_VALIDITY_PERIOD = 90 days;
    
    event ScoreUpdated(
        address indexed user,
        uint256 overall,
        uint256 timestamp,
        uint256 expiresAt
    );
    
    event ScoreExpired(address indexed user, uint256 timestamp);

    /**
     * @notice Update credit score for a user
     * @param user Address of the user
     * @param overall Overall credit score
     * @param loanHistory Loan history component
     * @param liquidationAvoidance Liquidation avoidance component
     * @param portfolioDiversity Portfolio diversity component
     * @param crossChainActivity Cross-chain activity component
     */
    function updateScore(
        address user,
        uint256 overall,
        uint256 loanHistory,
        uint256 liquidationAvoidance,
        uint256 portfolioDiversity,
        uint256 crossChainActivity
    ) external {
        uint256 timestamp = block.timestamp;
        uint256 expiresAt = timestamp + SCORE_VALIDITY_PERIOD;

        scores[user] = CreditScore({
            overall: overall,
            loanHistory: loanHistory,
            liquidationAvoidance: liquidationAvoidance,
            portfolioDiversity: portfolioDiversity,
            crossChainActivity: crossChainActivity,
            timestamp: timestamp,
            expiresAt: expiresAt,
            exists: true
        });

        emit ScoreUpdated(user, overall, timestamp, expiresAt);
    }

    /**
     * @notice Get credit score for a user
     * @param user Address of the user
     * @return score The credit score struct
     * @return isValid Whether the score is still valid
     */
    function getScore(address user) 
        external 
        view 
        returns (CreditScore memory score, bool isValid) 
    {
        score = scores[user];
        isValid = score.exists && block.timestamp < score.expiresAt;
    }

    /**
     * @notice Check if a score is still valid
     * @param user Address of the user
     * @return Whether the score is valid
     */
    function isScoreValid(address user) external view returns (bool) {
        CreditScore memory score = scores[user];
        return score.exists && block.timestamp < score.expiresAt;
    }

    /**
     * @notice Invalidate expired score (cleanup)
     * @param user Address of the user
     */
    function invalidateExpiredScore(address user) external {
        CreditScore storage score = scores[user];
        require(score.exists, "Score does not exist");
        require(block.timestamp >= score.expiresAt, "Score not expired yet");
        
        delete scores[user];
        emit ScoreExpired(user, block.timestamp);
    }
}
