import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "PCS | Cross-Chain",
  description: "Private Cross-Chain Credit Score - DeFi credit scoring with dynamic TTL powered by Arkiv, Hyperbridge, and xx.network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Arkiv-style animated background */}
        <div className="animated-grid-bg" />
        <div className="glow-effect glow-1" />
        <div className="glow-effect glow-2" />
        
        {/* Main content */}
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
