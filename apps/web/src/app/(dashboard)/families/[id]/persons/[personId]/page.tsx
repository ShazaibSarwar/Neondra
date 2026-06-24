'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Phone, User } from 'lucide-react';
import { usePerson } from '@/hooks/use-persons';
import { usePersonBalanceCrossWedding } from '@/hooks/use-balance';
import { formatPKR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BalanceSummaryCard } from '@/components/balance/balance-summary-card';

export default function PersonDetailPage() {
  const { id, personId } = useParams<{ id: string; personId: string }>();
  const { data: person, isLoading: personLoading } = usePerson(id, personId);
  const { data: crossWedding, isLoading: balanceLoading } = usePersonBalanceCrossWedding(id, personId);

  if (personLoading || balanceLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!person) {
    return <p className="text-muted-foreground">Person not found.</p>;
  }

  const balance = crossWedding?.person;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}/persons`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{person.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {person.relation?.name && <span>{person.relation.name}</span>}
            {person.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />{person.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      {balance && (
        <BalanceSummaryCard
          totalGiven={balance.total_given}
          totalReceived={balance.total_received}
          netBalance={balance.net_balance}
        />
      )}

      {/* Cross-Wedding Breakdown */}
      {crossWedding && crossWedding.per_wedding.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Per-Wedding Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {crossWedding.per_wedding.map((w) => (
              <div key={w.wedding_id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{w.wedding_title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                      Gave {formatPKR(w.given)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDownLeft className="h-3 w-3 text-red-600" />
                      Received {formatPKR(w.received)}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${w.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {w.net >= 0 ? '+' : ''}{formatPKR(w.net)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {person.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{person.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {(!crossWedding || crossWedding.per_wedding.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No transaction history yet for this person.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}