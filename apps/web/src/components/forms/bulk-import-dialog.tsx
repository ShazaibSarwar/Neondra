import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload } from 'lucide-react';
import { useImportTransactions, useTransactionTemplate } from '@/hooks/use-transactions';
import { showAlert } from '@/lib/swal';

interface BulkImportDialogProps {
  familyId: string;
  weddingId: string;
  eventId: string;
  children: React.ReactNode;
}

export function BulkImportDialog({ familyId, weddingId, eventId, children }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const downloadTemplate = useTransactionTemplate(familyId, weddingId, eventId);
  const importTransactions = useImportTransactions(familyId, weddingId, eventId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      await importTransactions.mutateAsync(file);
      setFile(null);
      setOpen(false);
      showAlert('Transactions imported successfully!', 'success');
    } catch (err) {
      showAlert('Import Failed', 'error', 'Failed to import transactions. Please check the CSV format.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing transactions. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md border border-dashed border-muted-foreground/30">
            <span className="text-sm font-medium">CSV Template</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate.mutate()}
              disabled={downloadTemplate.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadTemplate.isPending ? 'Downloading...' : 'Download'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || importTransactions.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importTransactions.isPending ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
