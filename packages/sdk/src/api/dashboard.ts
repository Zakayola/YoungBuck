import type { DashboardStats, Transaction } from '@zakayola/types';
import { client } from './client';

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    client.get<DashboardStats>('/api/stats'),

  getTransactions: (limit = 20, offset = 0): Promise<Transaction[]> =>
    client
      .get<{ data: Transaction[] }>(`/api/transactions?limit=${limit}&offset=${offset}`)
      .then((res) => res.data),
};
