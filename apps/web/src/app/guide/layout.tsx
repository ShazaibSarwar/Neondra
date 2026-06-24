'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-slate-50 dark:bg-slate-950">
      {/* Top Header - Desktop */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-40 glass border-b-0 mb-4 rounded-b-2xl shadow-sm mx-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent tracking-tight">Neondra System</h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted">
             <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40 glass border-b-0 mb-2 rounded-b-2xl shadow-sm mx-2">
        <Link href="/">
           <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent truncate pr-4">Neondra System</h1>
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary/80 hover:text-foreground transition-colors px-3 py-1.5 rounded-full flex items-center gap-2">
          Dashboard
        </Link>
      </header>

      <main className="container mx-auto max-w-lg md:max-w-4xl px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
