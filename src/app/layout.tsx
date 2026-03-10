import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Adam Trader',
  description: 'AI-Powered Trading Assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
          <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Adam Trader</h1>
                  <p className="text-xs text-slate-400">AI Trading Assistant</p>
                </div>
              </div>
              <nav className="flex items-center gap-4">
                <a href="/" className="text-sm text-slate-300 hover:text-white transition">Dashboard</a>
                <a href="/charts" className="text-sm text-slate-300 hover:text-white transition">📈 Charts</a>
                <a href="/positions" className="text-sm text-slate-300 hover:text-white transition">Positions</a>
                <a href="/journal" className="text-sm text-slate-300 hover:text-white transition">Journal</a>
                <a href="/brokers" className="text-sm text-blue-400 hover:text-blue-300 transition">🔗 Brokers</a>
                <a href="/learn" className="text-sm text-yellow-400 hover:text-yellow-300 transition">📚 Learn</a>
                <a href="/settings" className="text-sm text-emerald-400 hover:text-emerald-300 transition">⚙️</a>
              </nav>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
