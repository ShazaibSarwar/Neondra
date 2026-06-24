import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Wedding, CeremonyEvent } from '@/types';

export function useWeddings(familyId: string) {
  return useQuery<Wedding[]>({
    queryKey: ['family', familyId, 'weddings'],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings`);
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function useWedding(familyId: string, weddingId: string) {
  return useQuery<Wedding>({
    queryKey: ['family', familyId, 'wedding', weddingId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings/${weddingId}`);
      return res.data;
    },
    enabled: !!familyId && !!weddingId,
  });
}

export interface CreateWeddingDto {
  title: string;
  subject_person_ids: string[];
  wedding_date: string;
  location?: string;
}

export function useCreateWedding(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWeddingDto) => {
      const res = await api.post(`/families/${familyId}/weddings`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'weddings'] });
    },
  });
}

export function useUpdateWedding(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ weddingId, data }: { weddingId: string; data: Partial<Wedding> & { subject_person_ids?: string[] } }) => {
      const res = await api.put(`/families/${familyId}/weddings/${weddingId}`, data);
      return res.data;
    },
    onSuccess: (_, { weddingId }) => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'weddings'] });
    },
  });
}

export function useCreateCeremonyEvent(familyId: string, weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CeremonyEvent>) => {
      const res = await api.post(`/families/${familyId}/weddings/${weddingId}/events`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
    },
  });
}

export function useDeleteWedding(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weddingId: string) => {
      const res = await api.delete(`/families/${familyId}/weddings/${weddingId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'weddings'] });
    },
  });
}

export function useUpdateCeremonyEvent(familyId: string, weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: Partial<CeremonyEvent> }) => {
      const res = await api.put(`/families/${familyId}/weddings/${weddingId}/events/${eventId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
    },
  });
}

export function useDeleteCeremonyEvent(familyId: string, weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.delete(`/families/${familyId}/weddings/${weddingId}/events/${eventId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'wedding', weddingId] });
    },
  });
}
