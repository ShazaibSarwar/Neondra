'use client';

import { useState } from 'react';
import { Filter, X, Calendar, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CeremonyEvent, Person } from '@/types';
import { TransactionType } from '@/types';

export interface TransactionFilterState {
  eventIds: string[];
  personId: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}

interface TransactionFiltersProps {
  events: CeremonyEvent[];
  persons: Person[];
  filters: TransactionFilterState;
  onChange: (filters: TransactionFilterState) => void;
}

const eventTypeLabels: Record<string, string> = {
  mehndi: 'Mehndi',
  barat: 'Barat',
  valima: 'Valima',
  nikah: 'Nikah',
  other: 'Other',
};

export function TransactionFilters({ events, persons, filters, onChange }: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = [
    filters.eventIds.length > 0,
    !!filters.personId,
    !!filters.dateFrom || !!filters.dateTo,
    !!filters.type,
  ].filter(Boolean).length;

  const clearAll = () => {
    onChange({ eventIds: [], personId: '', dateFrom: '', dateTo: '', type: '' });
  };

  const toggleEvent = (eventId: string) => {
    const next = filters.eventIds.includes(eventId)
      ? filters.eventIds.filter((id) => id !== eventId)
      : [...filters.eventIds, eventId];
    onChange({ ...filters, eventIds: next });
  };

  return (
    <div>
      {/* Filter Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-1" />
        Filters
        {activeCount > 0 && (
          <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 border rounded-lg bg-background space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter Transactions</span>
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Event Filter (Multi-select) */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Events
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((event) => {
                    const isSelected = filters.eventIds.includes(event.id);
                    const label = event.custom_label || eventTypeLabels[event.event_type] || event.event_type;
                    return (
                      <button
                        key={event.id}
                        onClick={() => toggleEvent(event.id)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-input'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Person Filter */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" /> Person
                </Label>
                <Select
                  value={filters.personId || 'all'}
                  onValueChange={(val) => onChange({ ...filters, personId: val === 'all' ? '' : val })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All people" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All people</SelectItem>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                    placeholder="From"
                    className="h-9 text-xs"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                    placeholder="To"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Type
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: '', label: 'All' },
                    { value: TransactionType.CASH, label: 'Cash' },
                    { value: TransactionType.GIFT_ITEM, label: 'Gift Item' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ ...filters, type: opt.value })}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        filters.type === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-input'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}