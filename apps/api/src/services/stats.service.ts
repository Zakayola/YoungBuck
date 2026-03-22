import type { DashboardStats } from '@zakayola/types';
import { db } from '../config/db';

export function getDashboardStats(): DashboardStats {
  return {
    totalTransactions: db.countTransactions(),
    totalVolume: db.getTotalVolume(),
    activeWallets: db.getActiveWallets(),
    avgFee: db.getAvgFee(),
  };
}
