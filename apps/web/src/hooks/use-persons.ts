import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Person } from '@/types';

export function usePersons(familyId: string, search?: string) {
  return useQuery<Person[]>({
    queryKey: ['family', familyId, 'persons', search],
    queryFn: async () => {
      const params = search ? { search } : {};
      const res = await api.get(`/families/${familyId}/persons`, { params });
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function usePerson(familyId: string, personId: string) {
  return useQuery<Person>({
    queryKey: ['family', familyId, 'person', personId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/persons/${personId}`);
      return res.data;
    },
    enabled: !!familyId && !!personId,
  });
}

export function useCreatePerson(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; guest_family_id?: string; relation_id?: string; phone?: string; notes?: string; wife_name?: string }) => {
      const res = await api.post(`/families/${familyId}/persons`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'persons'] });
    },
  });
}

export function useUpdatePerson(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ personId, data }: { personId: string; data: Partial<Person> }) => {
      const res = await api.put(`/families/${familyId}/persons/${personId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'persons'] });
    },
  });
}

export function useDeletePerson(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (personId: string) => {
      const res = await api.delete(`/families/${familyId}/persons/${personId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'persons'] });
    },
  });
}