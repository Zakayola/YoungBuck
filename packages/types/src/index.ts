// ─── Auth ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  /** Stellar public key (G...) */
  walletAddress?: string;
  createdAt: string;
}

/** Full user record as stored in the API (never sent over the wire) */
export interface UserRecord extends User {
  passwordHash: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

// ─── Transactions ──────────────────────────────────────────────────────────

export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  /** Stellar transaction hash */
  stellarTxHash: string;
  /** Sender Stellar public key */
  from: string;
  /** Recipient Stellar public key */
  to: string;
  /** Amount as a decimal string */
  amount: string;
  /** Asset identifier — "XLM" for native, or "CODE:ISSUER" for custom assets */
  asset: string;
  status: TransactionStatus;
  /** Stellar ledger sequence number */
  ledger?: number;
  timestamp: string;
  userId: string;
}

export interface CreateTransactionInput {
  from: string;
  to: string;
  amount: string;
  asset?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalTransactions: number;
  /** Total confirmed volume in XLM */
  totalVolume: string;
  activeWallets: number;
  /** Average transaction fee in XLM */
  avgFee: string;
}

// ─── API errors ───────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
}
