'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useRelations, useCreateRelation, useDeleteRelation } from '@/hooks/use-relations';
import { showAlert, showConfirm } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

const relationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
});

type RelationForm = z.infer<typeof relationSchema>;

export default function RelationsPage() {
  const { data: relations, isLoading } = useRelations();
  const createRelation = useCreateRelation();
  const deleteRelation = useDeleteRelation();
  
  const [addOpen, setAddOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RelationForm>({
    resolver: zodResolver(relationSchema),
  });

  const onSubmit = async (data: RelationForm) => {
    try {
      await createRelation.mutateAsync(data);
      reset();
      setAddOpen(false);
      showAlert('Relation added', 'success');
    } catch (error: any) {
      showAlert('Error', 'error', error.response?.data?.message || 'Failed to add relation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Relations</h1>
          <p className="text-muted-foreground text-sm">Add or remove global relation types used across all families.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Relation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Relation</DialogTitle>
              <DialogDescription>Create a new generic relation type.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Relation Name *</Label>
                <Input placeholder="e.g. Uncle, Cousin" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input placeholder="e.g. Notes about relation" {...register('description')} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRelation.isPending}>
                  {createRelation.isPending ? 'Saving...' : 'Save Relation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Relations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : relations?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No relations found. Add one above.</p>
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
                  {relations?.map((relation) => (
                    <tr key={relation.id} className="bg-card hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{relation.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            if (await showConfirm('Delete Relation?', `Delete relation "${relation.name}"?`)) {
                              deleteRelation.mutate(relation.id);
                              showAlert('Relation deleted', 'success');
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
