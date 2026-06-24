'use client';

import { ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPKR } from '@/lib/utils';

interface BalanceSummaryCardProps {
  totalGiven: number;
  totalReceived: number;
  netBalance: number;
  totalTransactions?: number;
}

export function BalanceSummaryCard({
  totalGiven,
  totalReceived,
  netBalance,
  totalTransactions,
}: BalanceSummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="py-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">Given</span>
            </div>
            <p className="text-sm font-semibold text-green-700">{formatPKR(totalGiven)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowDownLeft className="h-3.5 w-3.5 text-red-600" />
              <span className="text-xs text-muted-foreground">Received</span>
            </div>
            <p className="text-sm font-semibold text-red-700">{formatPKR(totalReceived)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Minus className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-muted-foreground">Net</span>
            </div>
            <p className={`text-sm font-semibold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {netBalance >= 0 ? '+' : ''}{formatPKR(netBalance)}
            </p>
          </div>
        </div>
        {totalTransactions !== undefined && (
          <p className="text-xs text-muted-foreground text-center mt-3 pt-2 border-t">
            {totalTransactions} total transactions
          </p>
        )}
      </CardContent>
    </Card>
  );
}