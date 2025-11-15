'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { contracts } from '@/lib/contracts';

interface CreditScore {
  overall: number;
  breakdown: {
    loanHistory: number;
    liquidationAvoidance: number;
    portfolioDiversity: number;
    crossChainActivity: number;
  };
  chains: {
    name: string;
    activity: number;
  }[];
}

interface OnChainScore {
  overall: bigint;
  loanHistory: bigint;
  liquidationAvoidance: bigint;
  portfolioDiversity: bigint;
  crossChainActivity: bigint;
  timestamp: bigint;
  expiresAt: bigint;
  exists: boolean;
}

export function ScoreCalculator() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<CreditScore | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<CreditScore | null>(null);
  const [onChainScore, setOnChainScore] = useState<OnChainScore | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Read score from contract
  const { data: scoreData, refetch: refetchScore } = useReadContract({
    address: contracts.scoreRegistry.address,
    abi: contracts.scoreRegistry.abi,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const calculateScore = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setCalculatedScore(data);
      setScore(null); // Clear previous on-chain score
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScoreOnChain = async () => {
    if (!calculatedScore || !address) return;

    try {
      writeContract({
        address: contracts.scoreRegistry.address,
        abi: contracts.scoreRegistry.abi,
        functionName: 'updateScore',
        args: [
          address,
          BigInt(calculatedScore.overall),
          BigInt(calculatedScore.breakdown.loanHistory),
          BigInt(calculatedScore.breakdown.liquidationAvoidance),
          BigInt(calculatedScore.breakdown.portfolioDiversity),
          BigInt(calculatedScore.breakdown.crossChainActivity),
        ],
      });
    } catch (error) {
      console.error('Error saving score on-chain:', error);
    }
  };

  // Process on-chain score data
  useEffect(() => {
    if (scoreData) {
      const [scoreStruct, valid] = scoreData as [OnChainScore, boolean];
      setOnChainScore(scoreStruct);
      setIsValid(valid && scoreStruct.exists);
    }
  }, [scoreData]);

  // When transaction is confirmed, update the displayed score and refetch
  useEffect(() => {
    if (isConfirmed && calculatedScore && !score) {
      setScore(calculatedScore);
      setCalculatedScore(null);
      // Refetch on-chain score after saving
      setTimeout(() => refetchScore(), 1000);
    }
  }, [isConfirmed, calculatedScore, score, refetchScore]);

  const loadExistingScore = () => {
    refetchScore();
  };

  const convertOnChainToDisplay = (onChain: OnChainScore): CreditScore => {
    return {
      overall: Number(onChain.overall),
      breakdown: {
        loanHistory: Number(onChain.loanHistory),
        liquidationAvoidance: Number(onChain.liquidationAvoidance),
        portfolioDiversity: Number(onChain.portfolioDiversity),
        crossChainActivity: Number(onChain.crossChainActivity),
      },
      chains: [], // We don't store chain data on-chain
    };
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Your Address</h3>
            <p className="text-purple-200 font-mono text-sm">{address}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={loadExistingScore}
              disabled={!address}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              Check Existing Score
            </button>
            <button
              onClick={calculateScore}
              disabled={loading || isWritePending || isConfirming}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Score'}
            </button>
            {calculatedScore && (
              <button
                onClick={saveScoreOnChain}
                disabled={isWritePending || isConfirming}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
              >
                {isWritePending ? 'Confirm in Wallet...' : isConfirming ? 'Saving...' : 'Save On-Chain'}
              </button>
            )}
          </div>
        </div>

        {/* Existing On-Chain Score Info */}
        {onChainScore && onChainScore.exists && (
          <div className={`mb-4 p-4 rounded-xl ${
            isValid 
              ? 'bg-blue-500/10 border border-blue-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isValid ? '📊' : '⏰'}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className={`font-semibold mb-1 ${
                      isValid ? 'text-blue-200' : 'text-red-200'
                    }`}>
                      {isValid ? 'Valid Score Found On-Chain' : 'Expired Score Found'}
                    </h5>
                    <p className={`text-sm ${
                      isValid ? 'text-blue-200/80' : 'text-red-200/80'
                    }`}>
                      Score: <span className="font-bold">{Number(onChainScore.overall)}</span>
                      {' • '}
                      Saved: {formatDate(onChainScore.timestamp)}
                      {' • '}
                      {isValid 
                        ? `Expires: ${formatDate(onChainScore.expiresAt)}`
                        : `Expired: ${formatDate(onChainScore.expiresAt)}`
                      }
                    </p>
                  </div>
                  {isValid && (
                    <button
                      onClick={() => setScore(convertOnChainToDisplay(onChainScore))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
                {!isValid && (
                  <p className="text-sm text-red-200/60 mt-2">
                    This score has expired. Calculate a new score to update your record.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {calculatedScore && !score && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h5 className="text-yellow-200 font-semibold mb-1">Score Calculated - Not Saved Yet</h5>
                <p className="text-sm text-yellow-200/80">
                  Click "Save On-Chain" to store your score on the blockchain. Preview below:
                </p>
              </div>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h5 className="text-green-200 font-semibold mb-1">Score Saved On-Chain!</h5>
                <p className="text-sm text-green-200/80 font-mono">
                  Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                </p>
              </div>
            </div>
          </div>
        )}

        {writeError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h5 className="text-red-200 font-semibold mb-1">Transaction Failed</h5>
                <p className="text-sm text-red-200/80">
                  {writeError.message.split('\n')[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {(score || calculatedScore) && (
          <div className="space-y-6 mt-8">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <div className="text-sm text-purple-200 mb-2">
                {calculatedScore && !score ? 'Calculated Score (Preview)' : 'Your Credit Score (On-Chain)'}
              </div>
              <div className="text-6xl font-bold text-white mb-2">{(score || calculatedScore)!.overall}</div>
              <div className="text-sm text-purple-200">
                {(score || calculatedScore)!.overall >= 750 ? 'Excellent' : (score || calculatedScore)!.overall >= 650 ? 'Good' : 'Fair'}
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <ScoreBreakdownItem
                label="Loan History"
                value={(score || calculatedScore)!.breakdown.loanHistory}
                weight="40%"
              />
              <ScoreBreakdownItem
                label="Liquidation Avoidance"
                value={(score || calculatedScore)!.breakdown.liquidationAvoidance}
                weight="25%"
              />
              <ScoreBreakdownItem
                label="Portfolio Diversity"
                value={(score || calculatedScore)!.breakdown.portfolioDiversity}
                weight="20%"
              />
              <ScoreBreakdownItem
                label="Cross-Chain Activity"
                value={(score || calculatedScore)!.breakdown.crossChainActivity}
                weight="15%"
              />
            </div>

            {/* Chain Activity - Only show if we have chain data */}
            {((score || calculatedScore)!.chains.length > 0) && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Chain Activity</h4>
                <div className="space-y-3">
                  {(score || calculatedScore)!.chains.map((chain) => (
                    <div key={chain.name} className="flex items-center justify-between">
                      <span className="text-purple-200">{chain.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${chain.activity}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">
                          {chain.activity}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technology Stack Info */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h5 className="text-white font-semibold mb-2">Privacy & Verification</h5>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Score stored on Arkiv with 90-day expiration</li>
                    <li>• Cross-chain verification via Hyperbridge</li>
                    <li>• Query metadata protected by xx.network cMixx</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBreakdownItem({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-purple-200 text-sm">{label}</span>
        <span className="text-purple-300 text-xs">{weight}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
