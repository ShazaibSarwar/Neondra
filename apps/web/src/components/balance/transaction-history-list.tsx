import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPKR } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TransactionHistoryListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionHistoryList({ transactions, isLoading }: TransactionHistoryListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No transactions found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => {
            const familyId = tx.event?.wedding?.family_id || tx.sender?.family_id || tx.receiver?.family_id;
            const linkHref = familyId && tx.event?.wedding_id && tx.event_id
              ? `/families/${familyId}/weddings/${tx.event.wedding_id}/events/${tx.event_id}`
              : '#';

            return (
              <Link key={tx.id} href={linkHref} className="block group">
                <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card/50 transition-all hover:bg-muted/80 hover:shadow-md hover:border-primary/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                        <span className="font-semibold text-sm">{tx.sender?.name}</span>
                        <span className="text-xs text-muted-foreground">gave to</span>
                        <span className="font-semibold text-sm">{tx.receiver?.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        {tx.event?.wedding?.title ? `${tx.event.wedding.title} - ` : ''}
                        {tx.event?.custom_label || tx.event?.event_type || 'Unknown Event'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground">{formatPKR(tx.amount)}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  {(tx.gift_description || tx.note) && (
                    <div className="text-xs bg-muted/50 p-2 rounded flex flex-col gap-1 mt-1 group-hover:bg-background transition-colors">
                      {tx.gift_description && <span className="font-medium">Gift: {tx.gift_description}</span>}
                      {tx.note && <span className="text-muted-foreground italic">Note: {tx.note}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
