'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilies } from '@/hooks/use-families';
import type { Person, CeremonyEvent, Wedding, Family } from '@/types';

const quickAddSchema = z.object({
  sender_id: z.string().min(1, 'Select sender'),
  receiver_id: z.string().min(1, 'Select receiver'),
  amount: z.number({ invalid_type_error: 'Enter amount' }).min(1).max(10000000),
  wife_amount: z.number({ invalid_type_error: 'Enter amount' }).min(1).max(10000000).optional().or(z.nan().transform(() => undefined)),
});

type QuickAddForm = z.infer<typeof quickAddSchema>;

interface QuickAddTransactionProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddTransaction({ open, onClose }: QuickAddTransactionProps) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [events, setEvents] = useState<CeremonyEvent[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedWedding, setSelectedWedding] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSenderFamily, setSelectedSenderFamily] = useState('');
  const [senderPersons, setSenderPersons] = useState<Person[]>([]);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, control, formState: { errors } } = useForm<QuickAddForm>({
    resolver: zodResolver(quickAddSchema),
  });

  const selectedSenderId = watch('sender_id');
  const selectedSender = senderPersons.find(p => p.id === selectedSenderId);

  useEffect(() => {
    if (open) {
      api.get('/families').then((res) => setFamilies(res.data));
      const saved = localStorage.getItem('quickadd_context');
      if (saved) {
        const ctx = JSON.parse(saved);
        setSelectedFamily(ctx.family || '');
        setSelectedWedding(ctx.wedding || '');
        setSelectedEvent(ctx.event || '');
      }
    }
  }, [open]);

  useEffect(() => {
    if (selectedFamily) {
      api.get(`/families/${selectedFamily}/weddings`).then((res) => setWeddings(res.data));
      api.get(`/families/${selectedFamily}/persons`).then((res) => setPersons(res.data));
    }
  }, [selectedFamily]);

  useEffect(() => {
    if (selectedSenderFamily) {
      api.get(`/families/${selectedSenderFamily}/persons`).then((res) => setSenderPersons(res.data));
    } else {
      setSenderPersons([]);
    }
  }, [selectedSenderFamily]);

  useEffect(() => {
    if (selectedFamily && selectedWedding) {
      api.get(`/families/${selectedFamily}/weddings/${selectedWedding}`).then((res) => {
        setEvents(res.data.events || []);
      });
    }
  }, [selectedFamily, selectedWedding]);

  const onSubmit = async (data: QuickAddForm) => {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      await api.post(
        `/families/${selectedFamily}/weddings/${selectedWedding}/events/${selectedEvent}/transactions`,
        {
          ...data,
          wife_amount: data.wife_amount && !isNaN(data.wife_amount) ? data.wife_amount : undefined,
          type: 'cash',
          transaction_date: new Date().toISOString().split('T')[0],
        },
      );
      localStorage.setItem(
        'quickadd_context',
        JSON.stringify({ family: selectedFamily, wedding: selectedWedding, event: selectedEvent }),
      );
      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl p-5 z-50 max-h-[85vh] overflow-y-auto"
          >
            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Check className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-lg font-medium">Transaction Saved!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Quick Add</h2>
                  <button onClick={onClose} className="p-2 touch-target rounded-md hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Unified Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Sender Section */}
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">From (Sender)</h3>
                    <div className="space-y-2">
                      <Label>Giving Family</Label>
                      <Select
                        value={selectedSenderFamily || 'unassigned'}
                        onValueChange={(val) => {
                          setSelectedSenderFamily(val === 'unassigned' ? '' : val);
                          setValue('sender_id', '', { shouldValidate: true });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select giving family..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Select giving family...</SelectItem>
                          {families.map((f) => (
                             <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Giving Member *</Label>
                      <Controller
                        name="sender_id"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || 'unassigned'} disabled={!selectedSenderFamily}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select person..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Select person...</SelectItem>
                              {senderPersons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.sender_id && <p className="text-sm text-destructive">{errors.sender_id.message}</p>}
                    </div>
                  </div>

                  {/* Receiver Section */}
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">To (Receiver)</h3>
                    <div className="space-y-2">
                      <Label>Receiving Family</Label>
                      <Select
                        value={selectedFamily || 'unassigned'}
                        onValueChange={(val) => { setSelectedFamily(val === 'unassigned' ? '' : val); setSelectedWedding(''); setSelectedEvent(''); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select receiving family..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Select receiving family...</SelectItem>
                          {families.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Receiving Member *</Label>
                      <Controller
                        name="receiver_id"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={(val) => field.onChange(val === 'unassigned' ? '' : val)} value={field.value || 'unassigned'} disabled={!selectedFamily}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select person..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Select person...</SelectItem>
                              {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.receiver_id && <p className="text-sm text-destructive">{errors.receiver_id.message}</p>}
                    </div>
                  </div>

                  {/* Context Section */}
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">In (Event Context)</h3>
                    <div className="space-y-2">
                      <Label>Wedding</Label>
                      <Select
                        value={selectedWedding || 'unassigned'}
                        onValueChange={(val) => { setSelectedWedding(val === 'unassigned' ? '' : val); setSelectedEvent(''); }}
                        disabled={!selectedFamily}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select wedding..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Select wedding...</SelectItem>
                          {weddings.map((w) => <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Event *</Label>
                      <Select
                        value={selectedEvent || 'unassigned'}
                        onValueChange={(val) => setSelectedEvent(val === 'unassigned' ? '' : val)}
                        disabled={!selectedWedding}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Select event...</SelectItem>
                          {events.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.custom_label || ev.event_type} — {ev.event_date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="space-y-2 pt-2">
                    <Label>Amount (PKR) *</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      inputMode="numeric"
                      {...register('amount', { valueAsNumber: true })}
                      className="text-lg h-12 font-medium"
                    />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[500, 1000, 1500, 2000, 3000, 5000].map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[30%] h-10 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-colors"
                          onClick={() => setValue('amount', amt, { shouldValidate: true })}
                        >
                          {amt}
                        </Button>
                      ))}
                    </div>
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                  </div>

                  {selectedSender?.wife_name && (
                    <div className="space-y-2 pt-2">
                      <Label>{selectedSender.wife_name}'s Amount (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        inputMode="numeric"
                        {...register('wife_amount', { valueAsNumber: true })}
                        className="text-lg h-12 font-medium"
                      />
                      {errors.wife_amount && <p className="text-sm text-destructive">{errors.wife_amount.message}</p>}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base mt-4" 
                    disabled={submitting || !selectedEvent || !selectedFamily || !selectedSenderFamily}
                  >
                    {submitting ? 'Saving...' : 'Save Transaction'}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}