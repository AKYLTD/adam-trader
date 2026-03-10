import './globals.css';
import { Inter } from 'next/font/google';
import MobileNav from '@/components/MobileNav';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Adam Trader',
  description: 'AI-Powered Trading Assistant',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Adam Trader',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <div className="min-h-screen main-content">
          {/* Desktop Header */}
          <header className="hidden md:block sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#262626]">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00d632] rounded-2xl flex items-center justify-center">
                  <span className="text-black font-bold text-xl">A</span>
                </div>
                <span className="font-semibold text-lg tracking-tight">Adam Trader</span>
              </div>
              <nav className="flex items-center gap-1">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/charts', label: 'Charts' },
                  { href: '/positions', label: 'Portfolio' },
                  { href: '/brokers', label: 'Brokers' },
                  { href: '/learn', label: 'Learn' },
                  { href: '/settings', label: 'Settings' },
                ].map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 rounded-xl text-sm text-[#8e8e93] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#262626] safe-top">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#00d632] rounded-xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">A</span>
                </div>
                <span className="font-semibold text-lg tracking-tight">Adam Trader</span>
              </div>
              <a href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] active:bg-[#262626] transition-colors">
                <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            </div>
          </header>

          <main className="max-w-5xl mx-auto px-4 py-4 md:px-6 md:py-6">
            {children}
          </main>

          <MobileNav />
        </div>
      </body>
    </html>
  );
}
