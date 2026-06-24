'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex items-center justify-center hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] pro-max-hover active:scale-90',
        className,
      )}
      aria-label="Quick Add Transaction"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}