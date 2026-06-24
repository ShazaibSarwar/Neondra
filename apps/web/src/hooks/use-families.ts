import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Family, FamilyMember } from '@/types';

export function useFamilies() {
  return useQuery<Family[]>({
    queryKey: ['families'],
    queryFn: async () => {
      const res = await api.get('/families');
      return res.data;
    },
  });
}

export function useFamily(id: string) {
  return useQuery<Family>({
    queryKey: ['family', id],
    queryFn: async () => {
      const res = await api.get(`/families/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useFamilyMembers(familyId: string) {
  return useQuery<FamilyMember[]>({
    queryKey: ['family', familyId, 'members'],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/members`);
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post('/families', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
}

export function useInviteMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await api.post(`/families/${familyId}/invite`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'members'] });
    },
  });
}

export function useChangeMemberRole(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.put(`/families/${familyId}/members/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'members'] });
    },
  });
}

export function useRemoveMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/families/${familyId}/members/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId, 'members'] });
    },
  });
}

export function useUpdateFamily(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
      const res = await api.put(`/families/${familyId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
}

export function useDeleteFamily(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/families/${familyId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
}