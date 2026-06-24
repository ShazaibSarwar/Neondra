'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Pencil, Trash2, Gift, ArrowUpRight } from 'lucide-react';
import { formatDate, formatPKR } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => void;
}

export function TransactionItem({ transaction: tx, onEdit, onDelete }: TransactionItemProps) {
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const editOpacity = useTransform(x, [0, 60], [0, 1]);
  const deleteOpacity = useTransform(x, [-60, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) {
      setSwiped('right');
      onEdit(tx);
      setTimeout(() => setSwiped(null), 300);
    } else if (info.offset.x < -80) {
      setSwiped('left');
      onDelete(tx.id);
    } else {
      setSwiped(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <div className="flex items-center justify-start pl-4 w-1/2 bg-blue-500">
          <motion.div style={{ opacity: editOpacity }}>
            <Pencil className="h-5 w-5 text-white" />
          </motion.div>
        </div>
        <div className="flex items-center justify-end pr-4 w-1/2 bg-red-500">
          <motion.div style={{ opacity: deleteOpacity }}>
            <Trash2 className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Foreground card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={swiped === null ? { x: 0 } : undefined}
        className="relative bg-background flex items-center gap-3 py-3 px-4 cursor-grab active:cursor-grabbing"
      >
        <div className="shrink-0">
          {tx.type === 'gift_item' ? (
            <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
              <Gift className="h-4 w-4 text-purple-600" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {tx.sender?.name} <span className="text-muted-foreground">→</span> {tx.receiver?.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(tx.transaction_date)}</span>
            {tx.note && <span>&middot; {tx.note}</span>}
          </div>
        </div>
        <p className="text-sm font-semibold shrink-0">{formatPKR(Number(tx.amount))}</p>
      </motion.div>
    </div>
  );
}