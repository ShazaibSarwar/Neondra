'use client';

import { formatPKR } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PersonBalance } from '@/hooks/use-balance';

interface PersonBalanceListProps {
  persons: PersonBalance[];
  title?: string;
  showRank?: boolean;
}

export function PersonBalanceList({ persons, title = 'Person Balances', showRank = false }: PersonBalanceListProps) {
  if (persons.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No balance data yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {persons.map((person, idx) => (
          <div
            key={person.person_id}
            className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50"
          >
            {showRank && (
              <span className="text-xs font-bold text-muted-foreground w-5 text-right">
                {idx + 1}.
              </span>
            )}
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-primary">
                {person.person_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{person.person_name}</p>
              {person.relation && (
                <p className="text-xs text-muted-foreground">{person.relation}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${person.net_balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {person.net_balance >= 0 ? '+' : ''}{formatPKR(person.net_balance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Gave {formatPKR(person.total_given)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}