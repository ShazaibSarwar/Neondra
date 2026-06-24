'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateTransaction } from '@/hooks/use-transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilies } from '@/hooks/use-families';
import { usePersons } from '@/hooks/use-persons';
import type { Transaction, Person, Family } from '@/types';
import { TransactionType } from '@/types';

const editSchema = z.object({
  sender_id: z.string().min(1),
  receiver_id: z.string().min(1),
  amount: z.number().min(1).max(10000000),
  wife_amount: z.number({ invalid_type_error: 'Enter amount' }).min(1).max(10000000).optional().or(z.nan().transform(() => undefined)),
  type: z.nativeEnum(TransactionType),
  gift_description: z.string().max(255).optional(),
  note: z.string().max(200).optional(),
  transaction_date: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

interface EditTransactionProps {
  transaction: Transaction | null;
  persons: Person[];
  open: boolean;
  onClose: () => void;
}

export function EditTransactionDialog({ transaction, persons, open, onClose }: EditTransactionProps) {
  const updateTx = useUpdateTransaction();
  const { data: families } = useFamilies();
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const { data: senderPersons } = usePersons(selectedFamilyId);

  const { register, handleSubmit, watch, reset, control, setValue, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const selectedSenderId = watch('sender_id');
  const selectedSender = senderPersons?.find(p => p.id === selectedSenderId);

  useEffect(() => {
    if (transaction) {
      reset({
        sender_id: transaction.sender_id,
        receiver_id: transaction.receiver_id,
        amount: Number(transaction.amount),
        wife_amount: transaction.wife_amount ? Number(transaction.wife_amount) : undefined as any,
        type: transaction.type as TransactionType,
        gift_description: transaction.gift_description || '',
        note: transaction.note || '',
        transaction_date: transaction.transaction_date,
      });
      if (transaction.sender && transaction.sender.family_id) {
        setSelectedFamilyId(transaction.sender.family_id);
      } else {
        setSelectedFamilyId('');
      }
    }
  }, [transaction, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!transaction) return;
    const submitData = {
      ...data,
      wife_amount: data.wife_amount && !isNaN(data.wife_amount) ? data.wife_amount : undefined,
    };
    await updateTx.mutateAsync({ txId: transaction.id, data: submitData });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Sender Family</Label>
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
            <Label>Sender</Label>
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
                    {senderPersons?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Receiver</Label>
            <Controller
              name="receiver_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || 'unassigned'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select receiver..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Select receiver...</SelectItem>
                    {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Primary Amount</Label>
              <Input type="number" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            {selectedSender?.wife_name && (
              <div className="space-y-2">
                <Label>{selectedSender.wife_name}'s Amount (Optional)</Label>
                <Input type="number" {...register('wife_amount', { valueAsNumber: true })} />
                {errors.wife_amount && <p className="text-sm text-destructive">{errors.wife_amount.message}</p>}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register('transaction_date')} />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input {...register('note')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateTx.isPending}>
              {updateTx.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}