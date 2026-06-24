import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, TransactionType } from '@/types';

interface TransactionFilters {
  person_id?: string;
  type?: TransactionType;
  date_from?: string;
  date_to?: string;
}

export function useFamilyTransactions(
  familyId: string,
  filters?: TransactionFilters,
) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'family', familyId, filters],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/transactions`, { params: filters });
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function useEventTransactions(
  familyId: string,
  weddingId: string,
  eventId: string,
  filters?: TransactionFilters,
) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', eventId, filters],
    queryFn: async () => {
      const res = await api.get(
        `/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions`,
        { params: filters },
      );
      return res.data;
    },
    enabled: !!familyId && !!weddingId && !!eventId,
  });
}

export function useCreateTransaction(familyId: string, weddingId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sender_id: string;
      receiver_id: string;
      amount: number;
      wife_amount?: number;
      type: string;
      gift_description?: string;
      include_in_balance?: boolean;
      note?: string;
      transaction_date?: string;
    }) => {
      const res = await api.post(
        `/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', eventId] });
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ txId, data }: { txId: string; data: Partial<Transaction> }) => {
      const res = await api.put(`/transactions/${txId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txId: string) => {
      const res = await api.delete(`/transactions/${txId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useTransactionTemplate(familyId: string, weddingId: string, eventId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get(
        `/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions/template`,
        { responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-template.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useImportTransactions(familyId: string, weddingId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(
        `/families/${familyId}/weddings/${weddingId}/events/${eventId}/transactions/import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', eventId] });
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
    },
  });
}