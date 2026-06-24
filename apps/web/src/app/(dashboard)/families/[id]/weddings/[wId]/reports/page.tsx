'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Table, Printer } from 'lucide-react';
import { useWedding } from '@/hooks/use-weddings';
import { useWeddingBalance } from '@/hooks/use-balance';
import { formatPKR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const { id, wId } = useParams<{ id: string; wId: string }>();
  const { data: wedding, isLoading } = useWedding(id, wId);
  const { data: balance } = useWeddingBalance(id, wId);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const downloadPdf = () => {
    const token = localStorage.getItem('access_token');
    window.open(`${apiBase}/api/v1/families/${id}/weddings/${wId}/report/pdf?token=${token}`, '_blank');
  };

  const downloadExcel = () => {
    const token = localStorage.getItem('access_token');
    window.open(`${apiBase}/api/v1/families/${id}/weddings/${wId}/report/excel?token=${token}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}/weddings/${wId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">{wedding?.title}</p>
        </div>
      </div>

      {/* Stats */}
      {balance && (
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{formatPKR(balance.total_collected)}</p>
                <p className="text-xs text-muted-foreground">Total Collected</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{balance.total_transactions}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Download Reports</h2>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={downloadPdf}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">PDF Report</p>
              <p className="text-xs text-muted-foreground">
                Full report with cover page, transaction log, and balance summary. A4 formatted.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={downloadExcel}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Table className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Excel Export</p>
              <p className="text-xs text-muted-foreground">
                Three worksheets: All Transactions, Person Summary, Event Summary.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.print()}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Printer className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Print Summary</p>
              <p className="text-xs text-muted-foreground">
                Print-optimized one-page event summary for quick reference.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-optimized content (hidden on screen, shown on print) */}
      <div className="hidden print:block">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{wedding?.title}</h1>
          {wedding?.subjects && wedding.subjects.length > 0 && (
            <p>{wedding.subjects.map(s => s.person?.name).join(' & ')}</p>
          )}
          <p className="text-sm text-gray-500">Date: {wedding?.wedding_date} | Location: {wedding?.location}</p>
        </div>

        {balance && (
          <>
            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Event</th>
                  <th className="text-right py-1">Transactions</th>
                  <th className="text-right py-1">Total (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {balance.event_balances.map((eb) => (
                  <tr key={eb.event_id} className="border-b">
                    <td className="py-1">{eb.custom_label || eb.event_type}</td>
                    <td className="text-right py-1">{eb.total_transactions}</td>
                    <td className="text-right py-1">{eb.total_collected.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="py-1">Grand Total</td>
                  <td className="text-right py-1">{balance.total_transactions}</td>
                  <td className="text-right py-1">{balance.total_collected.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <h3 className="font-bold mt-4 mb-2">Person Balances</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Person</th>
                  <th className="text-right py-1">Given</th>
                  <th className="text-right py-1">Received</th>
                  <th className="text-right py-1">Net</th>
                </tr>
              </thead>
              <tbody>
                {balance.person_balances.map((pb) => (
                  <tr key={pb.person_id} className="border-b">
                    <td className="py-1">{pb.person_name}</td>
                    <td className="text-right py-1">{pb.total_given.toLocaleString()}</td>
                    <td className="text-right py-1">{pb.total_received.toLocaleString()}</td>
                    <td className="text-right py-1">{(pb.net_balance >= 0 ? '+' : '') + pb.net_balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}