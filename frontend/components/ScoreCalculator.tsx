'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, useSwitchChain } from 'wagmi';
import { contracts } from '@/lib/contracts';
import { saveCreditScoreToArkiv, getTTLDays, getScoreTier, queryCreditScoresByAddress, getCreditScoreFromArkiv, type ArkivCreditScore } from '@/lib/arkiv';
import { mendoza } from '@/lib/wagmi';

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
  const { address, chain } = useAccount();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<CreditScore | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<CreditScore | null>(null);
  const [onChainScore, setOnChainScore] = useState<OnChainScore | null>(null);
  const [isValid, setIsValid] = useState(false);
  
  // Arkiv state
  const [arkivScore, setArkivScore] = useState<ArkivCreditScore | null>(null);
  const [isSavingToArkiv, setIsSavingToArkiv] = useState(false);
  const [isLoadingFromArkiv, setIsLoadingFromArkiv] = useState(false);
  const [arkivEntityKey, setArkivEntityKey] = useState<string | null>(null);
  const [arkivTxHash, setArkivTxHash] = useState<string | null>(null);
  const [arkivError, setArkivError] = useState<string | null>(null);
  
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
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

  const saveScoreToArkiv = async () => {
    if (!calculatedScore || !address) return;

    setIsSavingToArkiv(true);
    setArkivError(null);

    try {
      const arkivScoreData: ArkivCreditScore = {
        address,
        overall: calculatedScore.overall,
        breakdown: calculatedScore.breakdown,
        timestamp: 0, // Will be set by Arkiv function
        expiresAt: 0, // Will be set by Arkiv function
      };

      // Note: Using demo account for hackathon due to Mendoza RPC restrictions
      // In production, this would use user's wallet signature
      const result = await saveCreditScoreToArkiv(address, arkivScoreData);
      
      setArkivEntityKey(result.entityKey);
      setArkivTxHash(result.txHash);
      setScore(calculatedScore);
      setCalculatedScore(null);
      
      console.log('Score saved to Arkiv:', result);
    } catch (error) {
      console.error('Error saving score to Arkiv:', error);
      setArkivError(error instanceof Error ? error.message : 'Failed to save score to Arkiv');
    } finally {
      setIsSavingToArkiv(false);
    }
  };

  const loadScoreFromArkiv = async () => {
    if (!arkivEntityKey) return;

    setIsLoadingFromArkiv(true);
    setArkivError(null);

    try {
      const scoreData = await getCreditScoreFromArkiv(arkivEntityKey);
      
      if (scoreData) {
        console.log('Score loaded from Arkiv:', scoreData);
        // Convert to display format
        const displayScore: CreditScore = {
          overall: scoreData.overall,
          breakdown: scoreData.breakdown,
          chains: [], // We don't store chain data in Arkiv
        };
        setScore(displayScore);
        setArkivScore(scoreData);
      } else {
        setArkivError('Score not found in Arkiv');
      }
    } catch (error) {
      console.error('Error loading score from Arkiv:', error);
      setArkivError(error instanceof Error ? error.message : 'Failed to load score from Arkiv');
    } finally {
      setIsLoadingFromArkiv(false);
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
              disabled={loading || isWritePending || isConfirming || isSavingToArkiv}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Score'}
            </button>
            {calculatedScore && (
              <button
                onClick={saveScoreToArkiv}
                disabled={isSavingToArkiv}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {isSavingToArkiv ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving to Arkiv...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save to Arkiv (TTL: {getTTLDays(calculatedScore.overall)}d)
                  </>
                )}
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

        {/* Info Banner about Arkiv Demo Account */}
        {calculatedScore && !arkivEntityKey && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h5 className="text-blue-200 font-semibold mb-1">Arkiv Testnet Demo</h5>
                <p className="text-sm text-blue-200/80">
                  Your score will be saved to Arkiv Mendoza testnet with dynamic TTL ({getTTLDays(calculatedScore.overall)} days).
                  Using shared demo account for hackathon - in production, you'd sign with your own wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Arkiv Status Messages */}
        {arkivEntityKey && arkivTxHash && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-green-200 font-semibold mb-1">Score Saved to Arkiv!</h5>
                    <p className="text-sm text-green-200/80">
                      Your score has been saved with dynamic TTL ({calculatedScore ? getTTLDays(calculatedScore.overall) : score ? getTTLDays(score.overall) : 90} days)
                      based on your risk tier: <span className="font-bold">{calculatedScore ? getScoreTier(calculatedScore.overall) : score ? getScoreTier(score.overall) : ''}</span>
                    </p>
                  </div>
                  <button
                    onClick={loadScoreFromArkiv}
                    disabled={isLoadingFromArkiv}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isLoadingFromArkiv ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Verify on Arkiv'
                    )}
                  </button>
                </div>
                <div className="text-xs text-green-200/60 font-mono space-y-1">
                  <div>
                    Entity Key:{' '}
                    <button
                      onClick={() => navigator.clipboard.writeText(arkivEntityKey)}
                      className="hover:text-green-200 underline"
                      title="Click to copy"
                    >
                      {arkivEntityKey.slice(0, 20)}...{arkivEntityKey.slice(-18)}
                    </button>
                  </div>
                  <div>
                    TX Hash:{' '}
                    <a
                      href={`https://mendoza.hoodi.arkiv.network/tx/${arkivTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-200 underline"
                    >
                      {arkivTxHash.slice(0, 10)}...{arkivTxHash.slice(-8)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {arkivError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h5 className="text-red-200 font-semibold mb-1">Arkiv Error</h5>
                <p className="text-sm text-red-200/80">{arkivError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {calculatedScore && !score && !arkivEntityKey && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h5 className="text-yellow-200 font-semibold mb-1">Score Calculated - Not Saved Yet</h5>
                <p className="text-sm text-yellow-200/80">
                  Click "Save to Arkiv" to store your score with dynamic TTL ({getTTLDays(calculatedScore.overall)} days for {getScoreTier(calculatedScore.overall)} tier). Preview below:
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
              <div className="flex-1">
                  <h5 className="text-white font-semibold mb-2">Arkiv Integration - Dynamic TTL</h5>
                  
                  {arkivScore ? (
                    // Show verified data from Arkiv
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="text-xs text-green-200/80 font-semibold mb-2">✅ VERIFIED DATA FROM ARKIV MENDOZA L3</div>
                        <ul className="text-sm text-green-200 space-y-1">
                          <li>• <span className="font-semibold">Score:</span> {arkivScore.overall} ({getScoreTier(arkivScore.overall)} Tier)</li>
                          <li>• <span className="font-semibold">TTL:</span> {getTTLDays(arkivScore.overall)} days (expires {new Date(arkivScore.expiresAt).toLocaleDateString()})</li>
                          <li>• <span className="font-semibold">Saved:</span> {new Date(arkivScore.timestamp).toLocaleString()}</li>
                          <li>• <span className="font-semibold">Owner:</span> <span className="font-mono text-xs">{arkivScore.address.slice(0, 10)}...{arkivScore.address.slice(-8)}</span></li>
                        </ul>
                      </div>
                      <ul className="text-sm text-blue-200 space-y-1">
                        <li>• <span className="font-semibold">Dynamic Expiration:</span> Scores expire based on risk tier</li>
                        <li>• <span className="font-semibold">High Risk (&lt;500):</span> 30 days TTL</li>
                        <li>• <span className="font-semibold">Medium Risk (500-700):</span> 60 days TTL</li>
                        <li>• <span className="font-semibold">Low Risk (700+):</span> 90 days TTL</li>
                      </ul>
                    </div>
                  ) : (
                    // Show general info when no score is verified yet
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• <span className="font-semibold">Dynamic Expiration:</span> Scores expire based on risk tier</li>
                      <li>• <span className="font-semibold">High Risk (&lt;500):</span> 30 days TTL</li>
                      <li>• <span className="font-semibold">Medium Risk (500-700):</span> 60 days TTL</li>
                      <li>• <span className="font-semibold">Low Risk (700+):</span> 90 days TTL</li>
                      <li>• Stored on Arkiv Mendoza L3 with automatic expiration</li>
                      <li>• You control your data - saved with your wallet signature</li>
                    </ul>
                  )}
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
