import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  total_global_balance: number;
  total_given: number;
  total_received: number;
  total_families: number;
  total_weddings: number;
  total_transactions: number;
  recent_transactions: any[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data as DashboardStats;
    },
  });
}
