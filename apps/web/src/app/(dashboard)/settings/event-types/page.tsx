'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEventTypes, useCreateEventType, useDeleteEventType } from '@/hooks/use-event-types';
import { showAlert, showConfirm } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type EventTypeForm = z.infer<typeof eventTypeSchema>;

export default function EventTypesPage() {
  const { data: eventTypes, isLoading } = useEventTypes();
  const createEventType = useCreateEventType();
  const deleteEventType = useDeleteEventType();
  
  const [addOpen, setAddOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventTypeForm>({
    resolver: zodResolver(eventTypeSchema),
  });

  const onSubmit = async (data: EventTypeForm) => {
    try {
      await createEventType.mutateAsync(data);
      reset();
      setAddOpen(false);
      showAlert('Event Type added', 'success');
    } catch (error: any) {
      showAlert('Error', 'error', error.response?.data?.message || 'Failed to add event type');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Event Types</h1>
          <p className="text-muted-foreground text-sm">Add or remove event types that appear in the dropdown.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Event Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event Type</DialogTitle>
              <DialogDescription>Create a new event type.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Event Type Name *</Label>
                <Input placeholder="e.g. Dholki, Sangeet" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createEventType.isPending}>
                  {createEventType.isPending ? 'Saving...' : 'Save Event Type'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : eventTypes?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No event types found. Add one above.</p>
          ) : (
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {eventTypes?.map((eventType) => (
                    <tr key={eventType.id} className="bg-card hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{eventType.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (await showConfirm('Delete Event Type?', `Delete event type "${eventType.name}"?`)) {
                              deleteEventType.mutate(eventType.id);
                              showAlert('Event Type deleted', 'success');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
