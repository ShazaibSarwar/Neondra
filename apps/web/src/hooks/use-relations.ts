import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Relation {
  id: string;
  name: string;
  created_at?: string;
}

export function useRelations() {
  return useQuery<Relation[]>({
    queryKey: ['relations'],
    queryFn: async () => {
      const res = await api.get('/relations');
      return res.data;
    },
  });
}

export function useCreateRelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post('/relations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
    },
  });
}

export function useUpdateRelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ relationId, data }: { relationId: string; data: { name?: string } }) => {
      const res = await api.put(`/relations/${relationId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
    },
  });
}

export function useDeleteRelation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relationId: string) => {
      await api.delete(`/relations/${relationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
    },
  });
}
