'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Plus, Trash2, Filter, ArrowUpRight, ArrowDownLeft, Gift, Upload, FileText, Edit,
} from 'lucide-react';
import { useEventTransactions, useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { usePersons } from '@/hooks/use-persons';
import { useFamilies } from '@/hooks/use-families';
import { useWedding } from '@/hooks/use-weddings';
import { useEventPdfReport } from '@/hooks/use-reports';
import { showAlert, showConfirm } from '@/lib/swal';
import { BulkImportDialog } from '@/components/forms/bulk-import-dialog';
import { formatDate, formatPKR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionType, Transaction } from '@/types';

const txSchema = z.object({
  sender_id: z.string().min(1, 'Select sender'),
  receiver_id: z.string().min(1, 'Select receiver'),
  amount: z.number({ invalid_type_error: 'Enter amount' }).min(1).max(10000000),
  wife_amount: z.number({ invalid_type_error: 'Enter amount' }).min(1).max(10000000).optional().or(z.nan().transform(() => undefined)),
  type: z.nativeEnum(TransactionType),
  gift_description: z.string().max(255).optional(),
  note: z.string().max(200).optional(),
  transaction_date: z.string().optional(),
});

type TxForm = z.infer<typeof txSchema>;

export default function EventDetailPage() {
  const { id, wId, eId } = useParams<{ id: string; wId: string; eId: string }>();
  const { data: transactions, isLoading: txLoading } = useEventTransactions(id, wId, eId);
  const { data: persons } = usePersons(id);
  const { data: families } = useFamilies();
  const { data: wedding } = useWedding(id, wId);
  const createTx = useCreateTransaction(id, wId, eId);
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const exportPdf = useEventPdfReport(id, wId, eId);
  
  const [addOpen, setAddOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [filterPerson, setFilterPerson] = useState('');

  const { register, handleSubmit, watch, reset, setValue, control, formState: { errors } } = useForm<TxForm>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: TransactionType.CASH,
      amount: undefined as any,
      wife_amount: undefined as any,
      transaction_date: '', // Will be updated when event loads
      receiver_id: '',
    },
  });

  const txType = watch('type');
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const { data: senderPersons } = usePersons(selectedFamilyId);

  const selectedSenderId = watch('sender_id');
  const selectedSender = senderPersons?.find(p => p.id === selectedSenderId);

  const currentEvent = wedding?.events?.find(e => e.id === eId);

  const getAddDefaultValues = () => ({
    type: TransactionType.CASH as TransactionType,
    amount: undefined as any,
    wife_amount: undefined as any,
    transaction_date: currentEvent?.event_date || new Date().toISOString().split('T')[0],
    receiver_id: wedding?.subjects?.[0]?.person_id || '',
    sender_id: '',
    note: '',
    gift_description: '',
  });

  // Set default receiver and date when wedding data loads
  useEffect(() => {
    if (wedding && !editingTx && !addOpen) {
      if (wedding.subjects?.[0]?.person_id) {
        setValue('receiver_id', wedding.subjects[0].person_id);
      }
      const event = wedding.events?.find(e => e.id === eId);
      if (event?.event_date) {
        setValue('transaction_date', event.event_date);
      }
    }
  }, [wedding, editingTx, addOpen, setValue, eId]);

  const handleOpenChange = (open: boolean) => {
    setAddOpen(open);
    if (!open) {
      setEditingTx(null);
      reset(getAddDefaultValues());
    } else if (!editingTx) {
      reset(getAddDefaultValues());
    }
  };

  const onSubmit = async (data: TxForm) => {
    try {
      const submitData = {
        ...data,
        wife_amount: data.wife_amount && !isNaN(data.wife_amount) ? data.wife_amount : undefined,
      };
      if (editingTx) {
        await updateTx.mutateAsync({ txId: editingTx.id, data: submitData });
        showAlert('Transaction updated', 'success');
      } else {
        await createTx.mutateAsync(submitData);
        showAlert('Transaction added', 'success');
      }
      setEditingTx(null);
      reset({ type: TransactionType.CASH, amount: undefined as any, wife_amount: undefined as any });
      setAddOpen(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save transaction';
      showAlert('Error', 'error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const filteredTx = transactions?.filter((tx) => {
    if (!filterPerson) return true;
    return tx.sender_id === filterPerson || tx.receiver_id === filterPerson;
  });

  const totalAmount = filteredTx?.reduce((sum, tx) => sum + Number(tx.amount) + (Number(tx.wife_amount) || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}/weddings/${wId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Event Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTx?.length || 0} transactions &middot; {formatPKR(totalAmount)}
          </p>
        </div>
        
        <BulkImportDialog familyId={id} weddingId={wId} eventId={eId}>
          <Button size="sm" variant="outline" className="hidden sm:flex">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </BulkImportDialog>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="hidden sm:flex"
          onClick={() => exportPdf.mutate()} 
          disabled={exportPdf.isPending}
        >
          <FileText className="h-4 w-4 mr-1" />
          {exportPdf.isPending ? 'Exporting...' : 'Export'}
        </Button>

        <Dialog open={addOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTx ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              <DialogDescription>
                {editingTx ? 'Update transaction details.' : 'Record a cash gift or item exchange.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash (Salami)</SelectItem>
                        <SelectItem value="gift_item">Gift Item</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Giving Family</Label>
                <Select
                  value={selectedFamilyId || 'unassigned'}
                  onValueChange={(val) => {
                    setSelectedFamilyId(val === 'unassigned' ? '' : val);
                    setValue('sender_id', '', { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Select family...</SelectItem>
                    {families?.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Giving Member (Who gave) *</Label>
                <Controller
                  name="sender_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || 'unassigned'} disabled={!selectedFamilyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Select person...</SelectItem>
                        {senderPersons?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sender_id && <p className="text-sm text-destructive">{errors.sender_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Receiving Member (Who received) *</Label>
                <Controller
                  name="receiver_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || 'unassigned'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Select person...</SelectItem>
                        {persons?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.receiver_id && <p className="text-sm text-destructive">{errors.receiver_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Primary Amount *</Label>
                  <Input type="number" placeholder="0" {...register('amount', { valueAsNumber: true })} />
                  {txType === 'cash' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[500, 1000, 1500, 2000, 3000, 5000].map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[30%] h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-colors"
                          onClick={() => setValue('amount', amt, { shouldValidate: true })}
                        >
                          {amt}
                        </Button>
                      ))}
                    </div>
                  )}
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                {selectedSender?.wife_name && (
                  <div className="space-y-2">
                    <Label>{selectedSender.wife_name}'s Amount (Optional)</Label>
                    <Input type="number" placeholder="0" {...register('wife_amount', { valueAsNumber: true })} />
                    {errors.wife_amount && <p className="text-sm text-destructive">{errors.wife_amount.message}</p>}
                  </div>
                )}
              </div>

              {txType === TransactionType.GIFT_ITEM && (
                <div className="space-y-2">
                  <Label>Gift Description</Label>
                  <Input placeholder="e.g. Gold necklace set" {...register('gift_description')} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...register('transaction_date')} />
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Input placeholder="Optional" {...register('note')} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createTx.isPending || updateTx.isPending} className="w-full">
                  {createTx.isPending || updateTx.isPending ? 'Saving...' : 'Save Transaction'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <Select
            value={filterPerson || 'all'}
            onValueChange={(val) => setFilterPerson(val === 'all' ? '' : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All people" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              {persons?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile action buttons (shown only on small screens) */}
      <div className="flex sm:hidden gap-2">
        <BulkImportDialog familyId={id} weddingId={wId} eventId={eId}>
          <Button size="sm" variant="outline" className="flex-1">
            <Upload className="h-4 w-4 mr-1" />
            Import CSV
          </Button>
        </BulkImportDialog>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={() => exportPdf.mutate()} 
          disabled={exportPdf.isPending}
        >
          <FileText className="h-4 w-4 mr-1" />
          Export PDF
        </Button>
      </div>

      {/* Transaction List */}
      {txLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filteredTx?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No transactions yet. Tap &quot;Add&quot; to record one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTx?.map((tx) => (
            <Card key={tx.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="shrink-0">
                  {tx.type === 'gift_item' ? (
                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-purple-600" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.sender?.name} <span className="text-muted-foreground">→</span> {tx.receiver?.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(tx.transaction_date)}</span>
                    {tx.note && <span>&middot; {tx.note}</span>}
                    {tx.gift_description && <span>&middot; {tx.gift_description}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-1">
                  <div className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatPKR(Number(tx.amount) + (Number(tx.wife_amount) || 0))}
                    {tx.wife_amount && Number(tx.wife_amount) > 0 && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        ({formatPKR(Number(tx.amount))} + {formatPKR(Number(tx.wife_amount))} Spouse)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingTx(tx);
                      reset({
                        sender_id: tx.sender_id,
                        receiver_id: tx.receiver_id,
                        amount: Number(tx.amount),
                        wife_amount: tx.wife_amount ? Number(tx.wife_amount) : undefined as any,
                        type: tx.type as TransactionType,
                        gift_description: tx.gift_description || '',
                        note: tx.note || '',
                        transaction_date: tx.transaction_date ? new Date(tx.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                      });
                      setAddOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (await showConfirm('Delete Transaction?', 'Are you sure you want to delete this transaction?')) {
                        deleteTx.mutate(tx.id);
                        showAlert('Transaction deleted', 'success');
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}