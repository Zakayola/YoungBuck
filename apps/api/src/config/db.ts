import { v4 as uuidv4 } from 'uuid';
import type { UserRecord, Transaction, TransactionStatus } from '@zakayola/types';

// ─── In-memory collections ─────────────────────────────────────────────────
// These are module-level so they survive across requests for the process lifetime.
// For a real application, swap this module for a repository layer backed by Postgres.

const users: UserRecord[] = [];
const transactions: Transaction[] = [];

// ─── Seed ──────────────────────────────────────────────────────────────────

let seeded = false;

export async function seedIfEmpty(): Promise<void> {
  if (seeded || users.length > 0) return;
  seeded = true;

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('password123', 12);

  const alice: UserRecord = {
    id: uuidv4(),
    name: 'Alice Chen',
    email: 'alice@youngbuck.io',
    passwordHash,
    // Stellar public key (testnet)
    walletAddress: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  users.push(alice);

  const statuses: TransactionStatus[] = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed'];
  for (let i = 0; i < 20; i++) {
    transactions.push({
      id: uuidv4(),
      stellarTxHash: randomStellarHash(),
      from: randomStellarKey(),
      to: randomStellarKey(),
      amount: randomAmount(),
      asset: 'XLM',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      ledger: 48_000_000 + i * 5,
      timestamp: new Date(Date.now() - i * 4 * 60 * 1000).toISOString(),
      userId: alice.id,
    });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function randomStellarHash(): string {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
}

const STELLAR_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function randomStellarKey(): string {
  return 'G' + Array.from({ length: 55 }, () =>
    STELLAR_CHARS[Math.floor(Math.random() * STELLAR_CHARS.length)]
  ).join('');
}

function randomAmount(): string {
  return (Math.random() * 4999 + 1).toFixed(7);
}

// ─── Data-access interface ─────────────────────────────────────────────────

export const db = {
  // ── Users ──────────────────────────────────────────────────────────────

  findUserByEmail: (email: string): UserRecord | null =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null,

  findUserById: (id: string): UserRecord | null =>
    users.find((u) => u.id === id) ?? null,

  createUser: (data: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord => {
    const user: UserRecord = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  updateUser: (id: string, patch: Partial<Pick<UserRecord, 'name' | 'walletAddress'>>): UserRecord | null => {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  },

  // ── Transactions ───────────────────────────────────────────────────────

  getTransactions: (limit = 20, offset = 0): Transaction[] =>
    transactions.slice(offset, offset + limit),

  countTransactions: (): number => transactions.length,

  getTransactionById: (id: string): Transaction | null =>
    transactions.find((t) => t.id === id) ?? null,

  createTransaction: (data: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
    const tx: Transaction = {
      ...data,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    transactions.unshift(tx);
    return tx;
  },

  // ── Aggregate stats ────────────────────────────────────────────────────

  getTotalVolume: (): string =>
    transactions
      .filter((t) => t.status === 'confirmed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toFixed(7),

  getActiveWallets: (): number =>
    new Set(transactions.map((t) => t.from)).size,

  getAvgFee: (): string => {
    // Stellar base fee is 100 stroops = 0.00001 XLM per operation
    // For a realistic stat, return a fixed average
    return '0.00001';
  },
};
