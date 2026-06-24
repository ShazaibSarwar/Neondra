'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Heart, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { FAB } from '@/components/layout/fab';
import { QuickAddTransaction } from '@/components/forms/quick-add-transaction';
import { UserProfileModal } from '@/components/layout/user-profile-modal';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/families', label: 'Families', icon: Users },
  { href: '/weddings', label: 'Weddings', icon: Heart },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-16 md:pb-0">
        {/* Top Header - Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-40 glass border-b-0 mb-4 rounded-b-2xl shadow-sm mx-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent tracking-tight">Neondra System</h1>
            <nav className="flex gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setProfileOpen(true)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {user?.name}
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40 glass border-b-0 mb-2 rounded-b-2xl shadow-sm mx-2">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent truncate pr-4">Neondra System</h1>
          <button 
            onClick={() => setProfileOpen(true)}
            className="text-sm font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary/80 hover:text-foreground transition-colors px-3 py-1.5 rounded-full flex items-center gap-2"
          >
            {user?.name}
          </button>
        </header>

        <main className="container mx-auto max-w-lg md:max-w-4xl px-4 py-6 md:py-8">
          {children}
        </main>

        {/* Bottom Navigation - Mobile */}
        <nav className="fixed bottom-4 left-4 right-4 glass rounded-2xl md:hidden z-50 overflow-hidden border-white/10 shadow-lg">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-full touch-target',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        {/* FAB - Quick Add Transaction */}
        <FAB onClick={() => setQuickAddOpen(true)} />
        <QuickAddTransaction open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
        <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
      </div>
    </ProtectedRoute>
  );
}