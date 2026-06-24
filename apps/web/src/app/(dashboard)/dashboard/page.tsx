'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Users, Heart, Activity, Wallet, Calendar, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const isPositive = stats && stats.total_global_balance >= 0;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome & Global Balance Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-emerald-600 text-white p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
        
        <div className="relative z-10">
          <h2 className="text-primary-foreground/80 font-medium mb-1">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">Global Overview</p>
          
          <div className="space-y-1">
            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Overall Net Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black">PKR {Math.abs(stats?.total_global_balance || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={`border-none ${isPositive ? 'bg-white/20 text-white' : 'bg-red-500/30 text-white'}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {isPositive ? 'Net Positive' : 'Net Negative'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="glass-card border-none shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Families</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_families || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active memberships</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weddings</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_weddings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tracked events</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none shadow-sm hover:shadow-md transition-all col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total exchanges</p>
          </CardContent>
        </Card>
      </div>

      {/* Given vs Received Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Received</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">PKR {stats?.total_received?.toLocaleString() || 0}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowDownRight className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Total Given</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">PKR {stats?.total_given?.toLocaleString() || 0}</p>
          </div>
          <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {stats?.total_families === 0 && (
        <Card className="glass-card border-none shadow-md overflow-hidden bg-primary/5 dark:bg-primary/10 relative">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Heart className="h-40 w-40" />
          </div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              Getting Started with Neondra
            </CardTitle>
            <CardDescription className="text-base">
              Follow these simple steps to start tracking your family finances perfectly.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4 md:gap-2">
              <div className="flex-1 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-3 shadow-sm">1</div>
                <h4 className="font-semibold mb-1">Create a Family</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Form your workspace. This acts as the central hub for all your events and members.</p>
                <Link href="/families" className="inline-flex items-center text-xs font-medium text-primary mt-3 hover:underline">
                  Go to Families <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>

              <div className="hidden md:flex items-center justify-center text-primary/30">
                <ChevronRight className="h-6 w-6" />
              </div>

              <div className="flex-1 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors opacity-80 hover:opacity-100">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm mb-3">2</div>
                <h4 className="font-semibold mb-1">Add Members</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Invite relatives to collaborate or simply add them as contacts in the People tab.</p>
              </div>

              <div className="hidden md:flex items-center justify-center text-primary/30">
                <ChevronRight className="h-6 w-6" />
              </div>

              <div className="flex-1 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors opacity-80 hover:opacity-100">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm mb-3">3</div>
                <h4 className="font-semibold mb-1">Create Wedding</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Start an event (like a Wedding) and log transactions against it to track Neondra.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="glass-card shadow-sm border-none overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Recent Global Activity
          </CardTitle>
          <CardDescription>Latest transactions across all your families</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!stats?.recent_transactions?.length ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Activity className="h-10 w-10 mb-3 opacity-20" />
              <p>No recent activity found.</p>
              <p className="text-sm mt-1">Add transactions to see them here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recent_transactions.map((tx: any) => {
                // Determine if user's family received or gave. 
                // Since this is a global view, we'll just show Sender -> Receiver.
                return (
                  <div key={tx.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          <span className="text-orange-600 dark:text-orange-400">{tx.sender?.name}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{tx.receiver?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            {tx.event?.custom_label || tx.event?.event_type}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tx.transaction_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">PKR {(Number(tx.amount) + (Number(tx.wife_amount) || 0)).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Action Hints */}
      <div className="flex justify-center gap-4 pt-2">
        <Link href="/families">
          <Button variant="outline" className="rounded-full shadow-sm hover:border-primary">
            Manage Families <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        <Link href="/guide">
          <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
            <Info className="h-4 w-4 mr-2" />
            How it works
          </Button>
        </Link>
      </div>
    </div>
  );
}
