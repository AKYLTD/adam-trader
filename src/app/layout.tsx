import './globals.css';
import { Inter } from 'next/font/google';
import MobileNav from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Adam Trader',
  description: 'AI-Powered Trading Assistant',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0d0d0d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen pb-20 md:pb-0">
          {/* Desktop Header - Hidden on mobile */}
          <header className="hidden md:block border-b border-[#2a2a2a] bg-[#0d0d0d] sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#00c853] rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">A</span>
                </div>
                <span className="font-semibold text-lg">Adam Trader</span>
              </div>
              <nav className="flex items-center gap-1">
                <a href="/" className="px-4 py-2 rounded-xl text-sm text-[#9e9e9e] hover:text-white hover:bg-[#1a1a1a] transition">Home</a>
                <a href="/charts" className="px-4 py-2 rounded-xl text-sm text-[#9e9e9e] hover:text-white hover:bg-[#1a1a1a] transition">Charts</a>
                <a href="/positions" className="px-4 py-2 rounded-xl text-sm text-[#9e9e9e] hover:text-white hover:bg-[#1a1a1a] transition">Portfolio</a>
                <a href="/brokers" className="px-4 py-2 rounded-xl text-sm text-[#9e9e9e] hover:text-white hover:bg-[#1a1a1a] transition">Brokers</a>
                <a href="/learn" className="px-4 py-2 rounded-xl text-sm text-[#9e9e9e] hover:text-white hover:bg-[#1a1a1a] transition">Learn</a>
              </nav>
            </div>
          </header>

          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-40 bg-[#0d0d0d] border-b border-[#2a2a2a]">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00c853] rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">A</span>
                </div>
                <span className="font-semibold">Adam Trader</span>
              </div>
              <a href="/settings" className="p-2 rounded-full hover:bg-[#1a1a1a]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-4">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
