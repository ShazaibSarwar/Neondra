'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventBalance, PersonBalance } from '@/hooks/use-balance';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

interface EventBarChartProps {
  events: EventBalance[];
}

export function EventBarChart({ events }: EventBarChartProps) {
  const data = events.map((e) => ({
    name: e.custom_label || e.event_type.charAt(0).toUpperCase() + e.event_type.slice(1),
    amount: e.total_collected,
  }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Amount per Event</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Amount']} />
            <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ContributorPieChartProps {
  contributors: PersonBalance[];
}

export function ContributorPieChart({ contributors }: ContributorPieChartProps) {
  const top5 = contributors.slice(0, 5);
  const data = top5.map((c) => ({
    name: c.person_name,
    value: c.total_given,
  }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`PKR ${value.toLocaleString()}`]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {data.map((entry, idx) => (
            <div key={entry.name} className="flex items-center gap-1 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface TransactionTimelineProps {
  transactions: { date: string; amount: number }[];
}

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  if (transactions.length === 0) return null;

  // Group by date
  const grouped = new Map<string, number>();
  for (const tx of transactions) {
    const date = tx.date;
    grouped.set(date, (grouped.get(date) || 0) + tx.amount);
  }

  const data = Array.from(grouped.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Transaction Volume Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Total']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
            <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}