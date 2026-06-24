'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Search, Calendar, MapPin, X } from 'lucide-react';
import { useWeddings, useCreateWedding } from '@/hooks/use-weddings';
import { usePersons } from '@/hooks/use-persons';
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

const weddingSchema = z.object({
  title: z.string().min(2).max(200),
  subject_person_ids: z.array(z.string()).min(1, 'At least one subject is required'),
  wedding_date: z.string().min(1, 'Date is required'),
  location: z.string().max(255).optional(),
});

type WeddingForm = z.infer<typeof weddingSchema>;

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  past: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export default function WeddingsListPage() {
  const { id } = useParams<{ id: string }>();
  const { data: weddings, isLoading } = useWeddings(id);
  const { data: persons } = usePersons(id);
  const createWedding = useCreateWedding(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WeddingForm>({
    resolver: zodResolver(weddingSchema),
    defaultValues: {
      subject_person_ids: []
    }
  });

  const onSubmit = async (data: WeddingForm) => {
    await createWedding.mutateAsync({ ...data, subject_person_ids: selectedSubjects });
    reset();
    setSelectedSubjects([]);
    setValue('subject_person_ids', []);
    setDialogOpen(false);
  };

  const addSubject = (personId: string) => {
    if (!selectedSubjects.includes(personId) && personId) {
      const newSubjects = [...selectedSubjects, personId];
      setSelectedSubjects(newSubjects);
      setValue('subject_person_ids', newSubjects, { shouldValidate: true });
    }
  };

  const removeSubject = (personId: string) => {
    const newSubjects = selectedSubjects.filter(id => id !== personId);
    setSelectedSubjects(newSubjects);
    setValue('subject_person_ids', newSubjects, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">Weddings</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Wedding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wedding</DialogTitle>
              <DialogDescription>Add a new wedding event to track.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Wedding Title *</Label>
                <Input placeholder="e.g. Ali & Zara Wedding 2026" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Wedding Subjects (Who is getting married?) *</Label>
                <div className="flex gap-2 mb-2">
                  <Select 
                    onValueChange={(val) => {
                      if (val && val !== 'unassigned') {
                        addSubject(val);
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
                      const person = persons?.find(p => p.id === subjectId);
                      return person ? (
                        <Badge key={subjectId} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                          {person.name}
                          <button type="button" onClick={() => removeSubject(subjectId)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                {selectedSubjects.length === 0 && errors.subject_person_ids && (
                   <p className="text-sm text-destructive">{errors.subject_person_ids.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Wedding Date *</Label>
                <Input type="date" {...register('wedding_date')} />
                {errors.wedding_date && <p className="text-sm text-destructive">{errors.wedding_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City / Venue" {...register('location')} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createWedding.isPending}>
                  {createWedding.isPending ? 'Creating...' : 'Create Wedding'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : weddings?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No weddings yet. Create one to start tracking.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {weddings?.map((wedding) => (
            <Link key={wedding.id} href={`/families/${id}/weddings/${wedding.id}`} className="block">
              <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wedding.title}</CardTitle>
                    <Badge className={`capitalize ${statusColors[getDisplayStatus(wedding.status, wedding.wedding_date)] || ''}`} variant="secondary">
                      {getDisplayStatus(wedding.status, wedding.wedding_date)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {wedding.subjects && wedding.subjects.length > 0 && (
                    <p className="text-sm">
                      {wedding.subjects.map(s => s.person?.name).join(' & ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(wedding.wedding_date)}
                    </span>
                    {wedding.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {wedding.location}
                      </span>
                    )}
                  </div>
                  {wedding.events && (
                    <p className="text-xs text-muted-foreground">
                      {wedding.events.length} ceremony {wedding.events.length === 1 ? 'event' : 'events'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}