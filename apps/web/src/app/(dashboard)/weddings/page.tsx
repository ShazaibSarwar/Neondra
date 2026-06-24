'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Plus, Calendar, MapPin } from 'lucide-react';
import { useFamilies } from '@/hooks/use-families';
import { useWeddings } from '@/hooks/use-weddings';
import { formatDate, getDisplayStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  past: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

function WeddingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultFamily = searchParams.get('family');
  const { data: families, isLoading: familiesLoading } = useFamilies();
  const [selectedFamily, setSelectedFamily] = useState(defaultFamily || '');

  useEffect(() => {
    if (defaultFamily && !selectedFamily) {
      setSelectedFamily(defaultFamily);
    }
  }, [defaultFamily, selectedFamily]);

  const familyId = selectedFamily || families?.[0]?.id || '';
  const { data: weddings, isLoading: weddingsLoading } = useWeddings(familyId);

  if (familiesLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!families || families.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Weddings</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Create a family first to start tracking weddings.</p>
            <Link href="/families">
              <Button>Create Family</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with selector */}
      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent tracking-tight">Weddings</h1>
        {families.length > 1 && (
          <Select
            value={selectedFamily}
            onValueChange={setSelectedFamily}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50">
              <SelectValue placeholder="Select a family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-muted-foreground">
          {families.find(f => f.id === familyId)?.name} Family Weddings
        </h2>
        <Button size="sm" onClick={() => router.push(`/families/${familyId}/weddings`)}>
          <Plus className="h-4 w-4 mr-1" />
          Manage
        </Button>
      </div>

      {weddingsLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : weddings?.length === 0 ? (
        <Card className="glass-card border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="py-16 text-center relative z-10">
            <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">No Weddings Tracked</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">You haven't tracked any weddings for this family yet. Add a new wedding to start recording events and transactions.</p>
            <Button size="lg" className="rounded-full px-8 shadow-md hover:scale-105 transition-transform" onClick={() => router.push(`/families/${familyId}/weddings`)}>
              <Plus className="h-5 w-5 mr-2" />
              Add First Wedding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {weddings?.map((wedding) => (
            <Link key={wedding.id} href={`/families/${familyId}/weddings/${wedding.id}`} className="block group">
              <Card className="glass-card border-none shadow-sm cursor-pointer transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 active:scale-[0.98]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{wedding.title}</CardTitle>
                    <Badge className={`capitalize font-medium ${statusColors[getDisplayStatus(wedding.status, wedding.wedding_date)] || ''}`} variant="secondary">
                      {getDisplayStatus(wedding.status, wedding.wedding_date)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {wedding.subjects && wedding.subjects.length > 0 && (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {wedding.subjects.map(s => s.person?.name).join(' & ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 bg-muted/30 p-2 rounded-lg w-fit">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {formatDate(wedding.wedding_date)}
                    </span>
                    {wedding.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        {wedding.location}
                      </span>
                    )}
                  </div>
                  {wedding.events && (
                    <p className="text-xs text-muted-foreground mt-3 font-medium">
                      {wedding.events.length} ceremony {wedding.events.length === 1 ? 'event' : 'events'} scheduled
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

export default function WeddingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    }>
      <WeddingsContent />
    </Suspense>
  );
}