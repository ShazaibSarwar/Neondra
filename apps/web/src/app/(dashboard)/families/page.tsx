'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users, ChevronRight, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFamilies, useCreateFamily } from '@/hooks/use-families';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

const createFamilySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().optional(),
});

type CreateFamilyForm = z.infer<typeof createFamilySchema>;

export default function FamiliesPage() {
  const { data: families, isLoading } = useFamilies();
  const createFamily = useCreateFamily();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema),
  });

  const onSubmit = async (data: CreateFamilyForm) => {
    await createFamily.mutateAsync(data);
    reset();
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent tracking-tight">My Families</h1>
        <div className="flex items-center gap-2">
          <Link href="/guide">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Info className="h-4 w-4 mr-1" />
              How it works
            </Button>
            <Button variant="outline" size="icon" className="sm:hidden">
              <Info className="h-4 w-4" />
            </Button>
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">New Family</span>
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Family</DialogTitle>
              <DialogDescription>
                Create a family group to start managing wedding finances together.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Family Name</Label>
                <Input id="name" placeholder="e.g. Sarwar Family" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input id="description" placeholder="Brief description..." {...register('description')} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createFamily.isPending}>
                  {createFamily.isPending ? 'Creating...' : 'Create Family'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {families && families.length === 0 && (
        <Card className="glass-card border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="py-16 text-center relative z-10">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Welcome to Families</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Create your first family workspace to start tracking events, members, and transactions seamlessly.</p>
            <Button size="lg" className="rounded-full px-8 shadow-md hover:scale-105 transition-transform" onClick={() => setDialogOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create your first family
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {families?.map((family) => (
          <Link key={family.id} href={`/families/${family.id}`} className="block group">
            <Card className="glass-card border-none shadow-sm cursor-pointer transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 active:scale-[0.98]">
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{family.name}</CardTitle>
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                  {family.description || 'No description provided'}
                </p>
                <Badge variant="secondary" className="mt-4 capitalize font-medium px-3 py-1 bg-primary/5 text-primary border-primary/20">
                  Role: {family.role}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}