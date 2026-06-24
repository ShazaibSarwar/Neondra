'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Plus, Calendar, MapPin, Clock, Archive, FileText, Download, Edit2, Trash2, X
} from 'lucide-react';
import { useWedding, useCreateCeremonyEvent, useUpdateWedding, useDeleteWedding, useUpdateCeremonyEvent, useDeleteCeremonyEvent } from '@/hooks/use-weddings';
import { usePersons } from '@/hooks/use-persons';
import { useEventTypes } from '@/hooks/use-event-types';
import { useWeddingPdfReport, useWeddingExcelReport } from '@/hooks/use-reports';
import { showAlert, showConfirm } from '@/lib/swal';
import { useRouter } from 'next/navigation';
import { formatDate, getDisplayStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeddingStatus } from '@/types';

const eventSchema = z.object({
  event_type: z.string().min(1, 'Event type is required'),
  custom_label: z.string().max(100).optional(),
  event_date: z.string().min(1, 'Date is required'),
  venue: z.string().max(255).optional(),
  start_time: z.string().optional(),
  notes: z.string().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

const weddingSchema = z.object({
  title: z.string().min(2).max(200),
  subject_person_ids: z.array(z.string()).min(1, 'At least one subject is required'),
  wedding_date: z.string().min(1, 'Date is required'),
  location: z.string().max(255).optional(),
});

type WeddingForm = z.infer<typeof weddingSchema>;



export default function WeddingDetailPage() {
  const { id, wId } = useParams<{ id: string; wId: string }>();
  const router = useRouter();
  const { data: wedding, isLoading } = useWedding(id, wId);
  const { data: persons } = usePersons(id);
  const { data: eventTypes } = useEventTypes();
  const createEvent = useCreateCeremonyEvent(id, wId);
  const updateEvent = useUpdateCeremonyEvent(id, wId);
  const deleteEvent = useDeleteCeremonyEvent(id, wId);
  const updateWedding = useUpdateWedding(id);
  const deleteWedding = useDeleteWedding(id);
  const exportPdf = useWeddingPdfReport(id, wId);
  const exportExcel = useWeddingExcelReport(id, wId);
  
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  const [weddingDialogOpen, setWeddingDialogOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
  });

  const { register: registerW, handleSubmit: handleSubmitW, reset: resetW, setValue: setValueW, formState: { errors: errorsW } } = useForm<WeddingForm>({
    resolver: zodResolver(weddingSchema),
    defaultValues: { subject_person_ids: [] },
  });

  const selectedType = watch('event_type');

  const onSaveEvent = async (data: EventForm) => {
    if (editingEvent) {
      await updateEvent.mutateAsync({ eventId: editingEvent.id, data });
      showAlert('Event updated successfully', 'success');
    } else {
      await createEvent.mutateAsync(data);
      showAlert('Event created successfully', 'success');
    }
    reset();
    setEditingEvent(null);
    setEventDialogOpen(false);
  };

  const handleEditEvent = (e: React.MouseEvent, event: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEvent(event);
    reset({
      event_type: event.event_type,
      custom_label: event.custom_label || '',
      event_date: event.event_date,
      venue: event.venue || '',
      start_time: event.start_time || '',
      notes: event.notes || '',
    });
    setEventDialogOpen(true);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (await showConfirm('Delete Event?', 'This will also delete all transactions for this event. This cannot be undone.', 'Yes, Delete')) {
      await deleteEvent.mutateAsync(eventId);
      showAlert('Event deleted', 'success');
    }
  };

  const openEditWedding = () => {
    if (wedding) {
      const subjectIds = wedding.subjects?.map(s => s.person_id) || [];
      setSelectedSubjects(subjectIds);
      resetW({
        title: wedding.title,
        wedding_date: wedding.wedding_date,
        location: wedding.location || '',
        subject_person_ids: subjectIds,
      });
      setWeddingDialogOpen(true);
    }
  };

  const onSaveWedding = async (data: WeddingForm) => {
    await updateWedding.mutateAsync({ weddingId: wId, data: { ...data, subject_person_ids: selectedSubjects } });
    setWeddingDialogOpen(false);
    showAlert('Wedding updated successfully', 'success');
  };

  const handleDeleteWedding = async () => {
    if (await showConfirm('Delete Wedding?', 'This will permanently delete the wedding, all its events, and transactions.', 'Yes, Delete')) {
      await deleteWedding.mutateAsync(wId);
      showAlert('Wedding deleted', 'success');
      router.push(`/families/${id}/weddings`);
    }
  };

  const handleArchive = async () => {
    if (await showConfirm('Archive Wedding?', 'Archive this wedding? No new transactions can be added after archiving.', 'Yes, Archive it')) {
      updateWedding.mutate({ weddingId: wId, data: { status: WeddingStatus.ARCHIVED } });
      showAlert('Wedding archived', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!wedding) {
    return <p className="text-muted-foreground">Wedding not found.</p>;
  }

  const isArchived = wedding.status === WeddingStatus.ARCHIVED;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}/weddings`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{wedding.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {wedding.subjects && wedding.subjects.length > 0 && (
              <span>{wedding.subjects.map(s => s.person?.name).join(' & ')}</span>
            )}
          </div>
        </div>
        
        {/* Edit Wedding Dialog */}
        {!isArchived && (
          <Dialog open={weddingDialogOpen} onOpenChange={setWeddingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={openEditWedding}>
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Wedding</DialogTitle>
                <DialogDescription>Update the details of this wedding.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitW(onSaveWedding)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Wedding Title *</Label>
                  <Input placeholder="e.g. Ali & Zara Wedding 2026" {...registerW('title')} />
                  {errorsW.title && <p className="text-sm text-destructive">{errorsW.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Wedding Subjects (Who is getting married?) *</Label>
                  <div className="flex gap-2 mb-2">
                    <Select 
                      onValueChange={(val) => {
                        if (val && val !== 'unassigned') {
                          if (!selectedSubjects.includes(val)) {
                            const newSubs = [...selectedSubjects, val];
                            setSelectedSubjects(newSubs);
                            setValueW('subject_person_ids', newSubs, { shouldValidate: true });
                          }
                        }
                      }}
                      value="unassigned"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" disabled>Select a person...</SelectItem>
                        {persons?.filter(p => !selectedSubjects.includes(p.id)).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} {p.relation?.name ? `(${p.relation.name})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSubjects.map(subjectId => {
                        const person = persons?.find(p => p.id === subjectId) || wedding.subjects?.find(s => s.person_id === subjectId)?.person;
                        return person ? (
                          <Badge key={subjectId} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                            {person.name}
                            <button type="button" onClick={() => {
                              const newSubs = selectedSubjects.filter(sid => sid !== subjectId);
                              setSelectedSubjects(newSubs);
                              setValueW('subject_person_ids', newSubs, { shouldValidate: true });
                            }} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  {selectedSubjects.length === 0 && errorsW.subject_person_ids && (
                     <p className="text-sm text-destructive">{errorsW.subject_person_ids.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Wedding Date *</Label>
                  <Input type="date" {...registerW('wedding_date')} />
                  {errorsW.wedding_date && <p className="text-sm text-destructive">{errorsW.wedding_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="City / Venue" {...registerW('location')} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateWedding.isPending}>
                    {updateWedding.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Wedding Info Card */}
      <Card>
        <CardContent className="py-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(wedding.wedding_date)}
              </span>
              {wedding.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {wedding.location}
                </span>
              )}
            </div>
            <Badge variant="secondary" className="capitalize">{getDisplayStatus(wedding.status, wedding.wedding_date)}</Badge>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportPdf.mutate()} 
              disabled={exportPdf.isPending}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              {exportPdf.isPending ? 'Generating...' : 'PDF Report'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportExcel.mutate()} 
              disabled={exportExcel.isPending}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              {exportExcel.isPending ? 'Generating...' : 'Excel Export'}
            </Button>
            {!isArchived && (
              <>
                <Button variant="outline" size="sm" onClick={handleArchive}>
                  <Archive className="h-3.5 w-3.5 mr-1" />
                  Archive
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteWedding} disabled={deleteWedding.isPending}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ceremony Events */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ceremony Events</h2>
        {!isArchived && (
          <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Ceremony Event' : 'Add Ceremony Event'}</DialogTitle>
                <DialogDescription>{editingEvent ? 'Update the details of this event.' : 'Add a ceremony event to this wedding.'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSaveEvent)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Type *</Label>
                  <Controller
                    name="event_type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes?.map(et => (
                            <SelectItem key={et.id} value={et.name}>{et.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Date *</Label>
                  <Input type="date" {...register('event_date')} />
                  {errors.event_date && <p className="text-sm text-destructive">{errors.event_date.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input placeholder="Venue name" {...register('venue')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" {...register('start_time')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional notes..." {...register('notes')} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                    {createEvent.isPending || updateEvent.isPending ? 'Saving...' : (editingEvent ? 'Save Changes' : 'Add Event')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isArchived && (
        <div className="p-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md">
          This wedding is archived. No new events or transactions can be added.
        </div>
      )}

      {wedding.events && wedding.events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No ceremony events yet. Add one to start tracking transactions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {wedding.events
            ?.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
            .map((event) => {
              const txCount = event.transactions?.length || 0;
              const txTotal = event.transactions?.reduce((s, t) => s + Number(t.amount), 0) || 0;

              return (
                <Link key={event.id} href={`/families/${id}/weddings/${wId}/events/${event.id}`} className="block">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary" variant="secondary">
                            {event.custom_label || event.event_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground mr-2">
                            {formatDate(event.event_date)}
                          </span>
                          {!isArchived && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs" 
                                onClick={(e) => handleEditEvent(e, event)}
                              >
                                <Edit2 className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs text-destructive hover:text-destructive" 
                                onClick={(e) => handleDeleteEvent(e, event.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{event.venue}
                          </span>
                        )}
                        {event.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{event.start_time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">{txCount} transactions</span>
                        {txTotal > 0 && (
                          <span className="text-sm font-medium text-primary">
                            PKR {txTotal.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}