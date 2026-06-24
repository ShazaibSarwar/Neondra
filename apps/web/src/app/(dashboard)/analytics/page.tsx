'use client';

import { Suspense } from 'react';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Heart } from 'lucide-react';
import { useFamilies } from '@/hooks/use-families';
import { useWeddings } from '@/hooks/use-weddings';
import { useFamilySummary, useWeddingBalance } from '@/hooks/use-balance';
import { formatPKR } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BalanceSummaryCard } from '@/components/balance/balance-summary-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonBalanceList } from '@/components/balance/person-balance-list';
import { EventBarChart, ContributorPieChart } from '@/components/balance/charts';
import { TransactionHistoryList } from '@/components/balance/transaction-history-list';
import { useFamilyTransactions } from '@/hooks/use-transactions';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const defaultFamily = searchParams.get('family');
  const { data: families, isLoading: familiesLoading } = useFamilies();
  const [selectedFamily, setSelectedFamily] = useState(defaultFamily || '');
  const [selectedWedding, setSelectedWedding] = useState('');

  useEffect(() => {
    if (defaultFamily && !selectedFamily) {
      setSelectedFamily(defaultFamily);
    }
  }, [defaultFamily, selectedFamily]);

  const familyId = selectedFamily || families?.[0]?.id || '';
  const { data: summary, isLoading: summaryLoading } = useFamilySummary(familyId);
  const { data: weddings } = useWeddings(familyId);
  const { data: weddingBalance } = useWeddingBalance(familyId, selectedWedding === 'all' ? '' : selectedWedding);
  const { data: familyTransactions, isLoading: transactionsLoading } = useFamilyTransactions(familyId);

  const filteredTransactions = selectedWedding && selectedWedding !== 'all'
    ? familyTransactions?.filter(tx => tx.event?.wedding_id === selectedWedding || tx.event?.wedding?.id === selectedWedding)
    : familyTransactions;

  if (familiesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!families || families.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Create a family and add transactions to see analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with selectors */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {families.length > 1 && (
            <div className="flex-1">
              <Select
                value={selectedFamily}
                onValueChange={(val) => { setSelectedFamily(val); setSelectedWedding(''); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Family" />
                </SelectTrigger>
                <SelectContent>
                  {families.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {weddings && weddings.length > 0 && (
            <div className="flex-1">
              <Select
                value={selectedWedding}
                onValueChange={(val) => setSelectedWedding(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Weddings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weddings</SelectItem>
                  {weddings.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {summaryLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : selectedWedding && selectedWedding !== 'all' && weddingBalance ? (
        <>
          <BalanceSummaryCard
            totalGiven={weddingBalance.total_collected}
            totalReceived={weddingBalance.total_collected}
            netBalance={0}
            totalTransactions={weddingBalance.total_transactions}
          />
          <EventBarChart events={weddingBalance.event_balances} />
          <ContributorPieChart contributors={weddingBalance.person_balances} />
          <PersonBalanceList persons={weddingBalance.person_balances} title="Person Balances" showRank />
          
          <TransactionHistoryList 
            transactions={filteredTransactions || []} 
            isLoading={transactionsLoading} 
          />
        </>
      ) : summary ? (
        <>
          <BalanceSummaryCard
            totalGiven={summary.grand_total_given}
            totalReceived={summary.grand_total_received}
            netBalance={summary.overall_net}
            totalTransactions={summary.total_transactions}
          />

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="py-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{summary.total_transactions}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <Heart className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{summary.total_weddings}</p>
                <p className="text-xs text-muted-foreground">Weddings</p>
              </CardContent>
            </Card>
          </div>

          {summary.top_contributors.length > 0 && (
            <>
              <ContributorPieChart contributors={summary.top_contributors} />
              <PersonBalanceList persons={summary.top_contributors} title="Top Contributors" showRank />
            </>
          )}

          <TransactionHistoryList 
            transactions={familyTransactions || []} 
            isLoading={transactionsLoading} 
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No transaction data yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}