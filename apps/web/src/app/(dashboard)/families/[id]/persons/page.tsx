'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Search, User, Phone, Edit, Trash2 } from 'lucide-react';
import { usePersons, useCreatePerson, useUpdatePerson, useDeletePerson } from '@/hooks/use-persons';
import { useRelations } from '@/hooks/use-relations';
import { showAlert, showConfirm } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Person } from '@/types';

const personSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  relation_id: z.string().optional(),
  phone: z.string().max(20).optional(),
  notes: z.string().optional(),
  wife_name: z.string().max(150).optional(),
});

type PersonForm = z.infer<typeof personSchema>;

export default function PersonsPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  const { data: persons, isLoading } = usePersons(id);
  const { data: relations } = useRelations();
  const createPerson = useCreatePerson(id);
  const updatePerson = useUpdatePerson(id);
  const deletePerson = useDeletePerson(id);

  const filteredPersons = useMemo(() => {
    if (!persons) return [];
    if (!search) return persons;
    return persons.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [persons, search]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
  });

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingPerson(null);
      reset({ name: '', relation_id: '', phone: '', notes: '', wife_name: '' });
    }
  };

  const onSubmit = async (data: PersonForm) => {
    const submitData = { ...data, relation_id: data.relation_id === 'unassigned' ? undefined : data.relation_id };
    if (editingPerson) {
      await updatePerson.mutateAsync({ personId: editingPerson.id, data: submitData });
    } else {
      await createPerson.mutateAsync(submitData);
    }
    setEditingPerson(null);
    reset({ name: '', relation_id: '', phone: '', notes: '', wife_name: '' });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/families/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">People</h1>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Edit Person' : 'Add Person'}</DialogTitle>
              <DialogDescription>
                {editingPerson ? 'Update person details.' : 'Add a guest, relative, or participant to your family contacts.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="e.g. Ahmed Khan" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Spouse Name (optional)</Label>
                <Input placeholder="e.g. Ayesha" {...register('wife_name')} />
                {errors.wife_name && <p className="text-sm text-destructive">{errors.wife_name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Controller
                    name="relation_id"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || 'unassigned'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">None</SelectItem>
                          {relations?.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input placeholder="+92 300 1234567" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input placeholder="Any notes..." {...register('notes')} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createPerson.isPending || updatePerson.isPending}>
                  {createPerson.isPending || updatePerson.isPending ? 'Saving...' : (editingPerson ? 'Save Changes' : 'Add Person')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Person List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredPersons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search ? 'No results found.' : 'No people added yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPersons.map((person) => (
            <Card key={person.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {person.name} {person.wife_name && <span className="text-muted-foreground font-normal"> & {person.wife_name}</span>}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {person.relation?.name && <span>{person.relation.name}</span>}
                    {person.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {person.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => {
                      setEditingPerson(person);
                      reset({
                        name: person.name,
                        relation_id: person.relation_id || '',
                        phone: person.phone || '',
                        notes: person.notes || '',
                        wife_name: person.wife_name || '',
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      if (await showConfirm('Delete Person?', 'Are you sure you want to delete this person? This might affect their related transactions.')) {
                        deletePerson.mutate(person.id);
                        showAlert('Person deleted', 'success');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {persons?.length || 0} {persons?.length === 1 ? 'person' : 'people'} total
      </p>
    </div>
  );
}