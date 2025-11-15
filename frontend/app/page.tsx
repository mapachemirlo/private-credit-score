'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ScoreCalculator } from '@/components/ScoreCalculator';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Logo SVG */}
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
              >
                {/* Shield base */}
                <path 
                  d="M16 2L4 7V14C4 21.5 9.5 28 16 30C22.5 28 28 21.5 28 14V7L16 2Z" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Score bars inside shield */}
                <path 
                  d="M11 18V14M16 18V11M21 18V16" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                {/* Chain link accent */}
                <circle 
                  cx="16" 
                  cy="22" 
                  r="1.5" 
                  fill="white"
                />
              </svg>
              
              <h1 className="text-xl font-bold text-white">
                Private Credit Score
              </h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Título con estética Arkiv */}
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            Cross‑Chain Credit
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
              Reputation System
            </span>
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Calculate your DeFi reputation across multiple chains with privacy-preserving technology.
            Powered by{' '}
            <a 
              href="https://arkiv.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-100 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors font-medium"
            >
              Arkiv
            </a>
            {' '}Hyperbridge y xx.network.
          </p>
        </div>

        {isConnected ? (
          <ScoreCalculator />
        ) : (
          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            {/* Animated glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-gradient" />
            
            <div className="text-center relative z-10">
              {/* Wallet Icon SVG */}
              <div className="flex justify-center mb-6 animate-float-wallet">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white/40 animate-pulse-glow"
                >
                  {/* Wallet body */}
                  <rect
                    x="8"
                    y="16"
                    width="48"
                    height="36"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  {/* Wallet flap */}
                  <path
                    d="M8 24H56V20C56 17.7909 54.2091 16 52 16H12C9.79086 16 8 17.7909 8 20V24Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  {/* Card slot indicator */}
                  <line
                    x1="16"
                    y1="32"
                    x2="32"
                    y2="32"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  {/* Wallet closure/button */}
                  <circle
                    cx="48"
                    cy="36"
                    r="3"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-purple-200 mb-2">
                Connect your wallet to calculate your cross-chain credit score
              </p>
              <p className="text-sm text-purple-300/80 mb-6">
                Please ensure you have the{' '}
                <a
                  href="https://mendoza.hoodi.arkiv.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-200 hover:text-white underline decoration-purple-400/50 hover:decoration-purple-200 transition-colors font-medium"
                >
                  Mendoza network
                </a>
                {' '}added to your wallet
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-purple-300 text-sm">
            <p>Hackathon MVP - Combining Hyperbridge + xx.network + Arkiv + Kusama</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
