'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

interface ImportTransactionsProps {
  familyId: string;
  weddingId: string;
  eventId: string;
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export function ImportTransactionsDialog({
  familyId, weddingId, eventId, open, onClose,
}: ImportTransactionsProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions/template`,
      '_blank',
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(
        `/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions/import`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setResult(res.data);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setResult(data);
      } else {
        setError(data?.message || 'Import failed');
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import transactions. Download the template first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Template */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">1. Download template</p>
              <p className="text-xs text-muted-foreground">Get the CSV format with headers</p>
            </div>
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Template
            </Button>
          </div>

          {/* Step 2: Upload */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">2. Upload filled CSV</p>
              <p className="text-xs text-muted-foreground">Max 20% error rate allowed</p>
            </div>
            <Button size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-3 rounded-md text-sm ${result.imported > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-2 mb-2">
                {result.imported > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {result.imported} of {result.total} imported
                </span>
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}