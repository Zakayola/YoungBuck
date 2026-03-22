import type { Transaction, CreateTransactionInput, PaginatedResponse } from '@zakayola/types';
import { client } from './client';

export const transactionsApi = {
  list: (limit = 20, offset = 0): Promise<PaginatedResponse<Transaction>> =>
    client.get<PaginatedResponse<Transaction>>(
      `/api/transactions?limit=${limit}&offset=${offset}`
    ),

  getById: (id: string): Promise<Transaction> =>
    client.get<Transaction>(`/api/transactions/${id}`),

  create: (input: CreateTransactionInput): Promise<Transaction> =>
    client.post<Transaction>('/api/transactions', input),
};
