import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CreateTransactionInput } from '@zakayola/types';
import { db } from '../config/db';

export function listTransactions(limit = 20, offset = 0): Transaction[] {
  return db.getTransactions(limit, offset);
}

export function countTransactions(): number {
  return db.countTransactions();
}

export function getTransaction(id: string): Transaction {
  const tx = db.getTransactionById(id);
  if (!tx) {
    throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
  }
  return tx;
}

export function createTransaction(
  input: CreateTransactionInput & { userId: string }
): Transaction {
  if (!input.from || !input.to || !input.amount) {
    throw Object.assign(
      new Error('from, to, and amount are required'),
      { statusCode: 400 }
    );
  }

  const amountFloat = parseFloat(input.amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw Object.assign(
      new Error('amount must be a positive number'),
      { statusCode: 400 }
    );
  }

  return db.createTransaction({
    stellarTxHash: uuidv4().replace(/-/g, '').toUpperCase(),
    from: input.from,
    to: input.to,
    amount: amountFloat.toFixed(7),
    asset: input.asset ?? 'XLM',
    status: 'pending',
    userId: input.userId,
  });
}
