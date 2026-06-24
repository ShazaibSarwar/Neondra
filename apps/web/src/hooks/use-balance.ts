import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PersonBalance {
  person_id: string;
  person_name: string;
  relation: string | null;
  total_given: number;
  total_received: number;
  net_balance: number;
}

export interface EventBalance {
  event_id: string;
  event_type: string;
  custom_label: string | null;
  event_date: string;
  total_collected: number;
  total_transactions: number;
}

export interface FamilySummary {
  grand_total_given: number;
  grand_total_received: number;
  overall_net: number;
  total_transactions: number;
  total_weddings: number;
  top_contributors: PersonBalance[];
}

export interface WeddingBalance {
  wedding_id: string;
  wedding_title: string;
  total_collected: number;
  total_transactions: number;
  event_balances: EventBalance[];
  person_balances: PersonBalance[];
}

export function useFamilySummary(familyId: string) {
  return useQuery<FamilySummary>({
    queryKey: ['balance', 'family', familyId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/balance`);
      return res.data;
    },
    enabled: !!familyId,
  });
}

export function useWeddingBalance(familyId: string, weddingId: string) {
  return useQuery<WeddingBalance>({
    queryKey: ['balance', 'wedding', weddingId],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings/${weddingId}/balance`);
      return res.data;
    },
    enabled: !!familyId && !!weddingId,
  });
}

export function usePersonBalanceCrossWedding(familyId: string, personId: string) {
  return useQuery({
    queryKey: ['balance', 'person', personId, 'cross-wedding'],
    queryFn: async () => {
      const res = await api.get(`/families/${familyId}/persons/${personId}/balance/cross-wedding`);
      return res.data as {
        person: PersonBalance;
        per_wedding: { wedding_id: string; wedding_title: string; given: number; received: number; net: number }[];
      };
    },
    enabled: !!familyId && !!personId,
  });
}