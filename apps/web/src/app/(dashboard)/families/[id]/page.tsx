'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, UserPlus, Users, Heart, Trash2, Calendar, MapPin, ChevronRight, Plus, Tags, Contact, Edit2, Info, Sparkles
} from 'lucide-react';
import { useFamily, useFamilyMembers, useInviteMember, useRemoveMember, useUpdateFamily, useDeleteFamily } from '@/hooks/use-families';
import { useWeddings } from '@/hooks/use-weddings';
import { useFamilySummary } from '@/hooks/use-balance';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showAlert, showConfirm } from '@/lib/swal';
import { formatDate, formatPKR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BalanceSummaryCard } from '@/components/balance/balance-summary-card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'member', 'viewer']),
});

type InviteForm = z.infer<typeof inviteSchema>;

const familySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type FamilyForm = z.infer<typeof familySchema>;

export default function FamilyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: family, isLoading: familyLoading } = useFamily(id);
  const { data: members } = useFamilyMembers(id);
  const { data: weddings } = useWeddings(id);
  const { data: summary } = useFamilySummary(id);
  const inviteMember = useInviteMember(id);
  const removeMember = useRemoveMember(id);
  const updateFamily = useUpdateFamily(id);
  const deleteFamily = useDeleteFamily(id);
  const router = useRouter();
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editFamilyOpen, setEditFamilyOpen] = useState(false);

  const currentMembership = members?.find((m) => m.user_id === user?.id);
  const isAdmin = currentMembership?.role === 'admin';

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  });

  const { register: registerF, handleSubmit: handleSubmitF, reset: resetF, formState: { errors: errorsF } } = useForm<FamilyForm>({
    resolver: zodResolver(familySchema),
  });

  const onInvite = async (data: InviteForm) => {
    await inviteMember.mutateAsync(data);
    reset();
    setInviteOpen(false);
  };

  const openEditFamily = () => {
    if (family) {
      resetF({ name: family.name, description: family.description || '' });
      setEditFamilyOpen(true);
    }
  };

  const onUpdateFamily = async (data: FamilyForm) => {
    await updateFamily.mutateAsync(data);
    setEditFamilyOpen(false);
    showAlert('Family updated successfully', 'success');
  };

  const handleDeleteFamily = async () => {
    if (await showConfirm('Delete Family?', 'This will permanently delete the family and all its associated data. This action cannot be undone.', 'Yes, Delete')) {
      await deleteFamily.mutateAsync();
      showAlert('Family deleted', 'success');
      router.push('/families');
    }
  };

  if (familyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!family) {
    return <p className="text-muted-foreground">Family not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/families">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{family.name}</h1>
          {family.description && (
            <p className="text-sm text-muted-foreground">{family.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Dialog open={editFamilyOpen} onOpenChange={setEditFamilyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={openEditFamily}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Family</DialogTitle>
                  <DialogDescription>Update the details of your family.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitF(onUpdateFamily)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Family Name *</Label>
                    <Input placeholder="e.g. The Smiths" {...registerF('name')} />
                    {errorsF.name && <p className="text-sm text-destructive">{errorsF.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Optional description" {...registerF('description')} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={updateFamily.isPending}>
                      {updateFamily.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDeleteFamily} disabled={deleteFamily.isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Balance Summary */}
      {summary && summary.total_transactions > 0 && (
        <Link href={`/analytics?family=${id}`} className="block hover:opacity-90 transition-opacity">
          <BalanceSummaryCard
            totalGiven={summary.grand_total_given}
            totalReceived={summary.grand_total_received}
            netBalance={summary.overall_net}
            totalTransactions={summary.total_transactions}
          />
        </Link>
      )}

      {/* Family Setup Guide (Appears if no weddings exist) */}
      {(!weddings || weddings.length === 0) && (
        <Card className="glass-card border-none shadow-md overflow-hidden bg-primary/5 dark:bg-primary/10 relative mt-2 animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32" />
          </div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              Family Setup Guide
            </CardTitle>
            <CardDescription className="text-base">
              You've created a family! Follow these steps to set up your ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">1</div>
                  <UserPlus className="h-5 w-5 text-primary/40" />
                </div>
                <h4 className="font-semibold mb-1">Invite Members</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  (Optional) Use the invite button below to bring family members into this workspace so they can view the ledger.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">2</div>
                  <Users className="h-5 w-5 text-primary/40" />
                </div>
                <h4 className="font-semibold mb-1">Define Relations</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Head over to the <Link href={`/families/${id}/persons`} className="text-primary font-medium hover:underline">People tab</Link> to map out your family tree and relationships.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-primary/20 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">3</div>
                  <Heart className="h-5 w-5 text-primary/40" />
                </div>
                <h4 className="font-semibold mb-1">Create a Wedding</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the <b>Add Wedding</b> button below to create your first event and start tracking Neondra!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
        <Link href={`/families/${id}/weddings`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full glass-card">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Weddings</span>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/families/${id}/persons`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full glass-card">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">People</span>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/analytics?family=${id}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full glass-card">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <ChevronRight className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Analytics</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Wedding Summary Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Weddings</h2>
          <Link href={`/families/${id}/weddings`}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {!weddings || weddings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No weddings yet</p>
              <Link href={`/families/${id}/weddings`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Wedding
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          weddings.slice(0, 3).map((wedding) => {
            const eventCount = wedding.events?.length || 0;
            const completedEvents = wedding.events?.filter((e) =>
              new Date(e.event_date) < new Date()
            ).length || 0;
            const progress = eventCount > 0 ? (completedEvents / eventCount) * 100 : 0;

            return (
              <Link key={wedding.id} href={`/families/${id}/weddings/${wedding.id}`} className="block">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{wedding.title}</p>
                        {wedding.subjects && wedding.subjects.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {wedding.subjects.map(s => s.person?.name).join(' & ')}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {wedding.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{formatDate(wedding.wedding_date)}
                      </span>
                      {wedding.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{wedding.location}
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    {eventCount > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{completedEvents}/{eventCount} events</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Members Section */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Members ({members?.length || 0})</CardTitle>
          {isAdmin && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>Invite a registered user to join this family.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="member@example.com" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={inviteMember.isPending}>
                      {inviteMember.isPending ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {member.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs">{member.role}</Badge>
                {isAdmin && member.user_id !== user?.id && (
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => removeMember.mutate(member.user_id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}