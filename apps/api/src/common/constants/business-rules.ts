/**
 * WFGTS Business Rules (BR-001 to BR-012)
 * All rules are enforced at the backend API level.
 *
 * BR-001: Transaction amount must be > 0 and <= PKR 10,000,000
 *   → Enforced in: CreateTransactionDto (class-validator), TransactionAmountPipe
 *
 * BR-002: Sender and receiver must be different persons
 *   → Enforced in: TransactionService.create(), TransactionAmountPipe
 *
 * BR-003: Transactions can only be added to ceremony events in user's own family
 *   → Enforced in: FamilyScopeGuard, TransactionController family param check
 *
 * BR-004: Family must always have at least one Admin
 *   → Enforced in: FamilyService.changeRole(), FamilyService.removeMember()
 *
 * BR-005: Archived weddings are read-only
 *   → Enforced in: WeddingService.createEvent(), TransactionService.create()
 *
 * BR-006: Members can only delete own transactions within 24 hours
 *   → Enforced in: TransactionService.softDelete()
 *
 * BR-007: 'Other' ceremony event type requires custom_label >= 2 chars
 *   → Enforced in: WeddingService.createEvent(), CeremonyEventPipe
 *
 * BR-008: Gift items with no monetary value don't affect balance
 *   → Enforced in: BalanceService queries (include_in_balance filter)
 *
 * BR-009: Person with transactions cannot be hard-deleted, only archived
 *   → Enforced in: PersonService.softDelete()
 *
 * BR-010: Invitation links expire after 72 hours
 *   → Enforced in: FamilyService invitation acceptance check
 *
 * BR-011: Balance calculations exclude soft-deleted transactions
 *   → Enforced in: All balance queries (is_deleted = false filter)
 *
 * BR-012: All amounts stored in PKR, no currency conversion
 *   → Enforced by design: single currency, no conversion logic
 */

export const BUSINESS_RULES = {
  MAX_TRANSACTION_AMOUNT: 10_000_000,
  MIN_TRANSACTION_AMOUNT: 1,
  INVITATION_EXPIRY_HOURS: 72,
  MEMBER_DELETE_WINDOW_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  PASSWORD_RESET_EXPIRY_MINUTES: 60,
  MIN_CUSTOM_LABEL_LENGTH: 2,
} as const;