'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useRelations, useCreateRelation, useUpdateRelation, useDeleteRelation, type Relation } from '@/hooks/use-relations';
import { showAlert, showConfirm } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

const relationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type RelationForm = z.infer<typeof relationSchema>;

export default function RelationsPage() {
  const { id } = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
  
  const { data: relations, isLoading } = useRelations();
  const createRelation = useCreateRelation();
  const updateRelation = useUpdateRelation();
  const deleteRelation = useDeleteRelation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RelationForm>({
    resolver: zodResolver(relationSchema),
  });

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingRelation(null);
      reset({ name: '' });
    }
  };

  const onSubmit = async (data: RelationForm) => {
    if (editingRelation) {
      await updateRelation.mutateAsync({ relationId: editingRelation.id, data });
    } else {
      await createRelation.mutateAsync(data);
    }
    setEditingRelation(null);
    reset({ name: '' });
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
        <h1 className="text-xl font-bold flex-1">Relations</h1>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Relation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRelation ? 'Edit Relation' : 'Add Relation'}</DialogTitle>
              <DialogDescription>
                {editingRelation ? 'Update relation details.' : 'Add a new relation type (available across all families).'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Relation Name *</Label>
                <Input placeholder="e.g. Cousin" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRelation.isPending || updateRelation.isPending}>
                  {createRelation.isPending || updateRelation.isPending ? 'Saving...' : (editingRelation ? 'Save Changes' : 'Add Relation')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Relations Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : relations?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No relations added yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 font-medium text-left">Name</th>
                <th className="p-3 font-medium text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {relations?.map((relation) => (
                <tr key={relation.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3">{relation.name}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => {
                          setEditingRelation(relation);
                          reset({ name: relation.name });
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
                          if (await showConfirm('Delete Relation?', 'Are you sure you want to delete this relation?')) {
                            deleteRelation.mutate(relation.id);
                            showAlert('Relation deleted', 'success');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
