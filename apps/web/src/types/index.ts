export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  photo_url?: string;
  created_by: string;
  role?: FamilyRole;
  created_at: string;
}

export enum FamilyRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum MembershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REMOVED = 'removed',
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  status: MembershipStatus;
  joined_at?: string;
  user: User;
}

export interface Relation {
  id: string;
  family_id: string;
  name: string;
  description?: string;
  created_at: string;
}



export interface Person {
  id: string;
  family_id: string;
  name: string;
  relation_id?: string;
  relation?: { id: string; name: string };
  phone?: string;
  avatar_url?: string;
  notes?: string;
  wife_name?: string;
  is_active: boolean;
  total_given?: number;
  total_received?: number;
  net_balance?: number;
}

export interface Wedding {
  id: string;
  family_id: string;
  title: string;
  subjects?: { id: string; person_id: string; person?: Person }[];
  wedding_date: string;
  location?: string;
  status: WeddingStatus;
  notes?: string;
  events?: CeremonyEvent[];
  created_at: string;
}

export enum WeddingStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface CeremonyEvent {
  id: string;
  wedding_id: string;
  event_type: string;
  custom_label?: string;
  event_date: string;
  venue?: string;
  start_time?: string;
  notes?: string;
  transactions?: Transaction[];
  wedding?: Wedding;
}



export interface Transaction {
  id: string;
  event_id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  wife_amount?: number;
  type: TransactionType;
  gift_description?: string;
  include_in_balance: boolean;
  note?: string;
  transaction_date: string;
  is_deleted: boolean;
  created_by: string;
  sender?: Person;
  receiver?: Person;
  event?: CeremonyEvent;
  created_at: string;
  updated_at: string;
}

export enum TransactionType {
  CASH = 'cash',
  GIFT_ITEM = 'gift_item',
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}