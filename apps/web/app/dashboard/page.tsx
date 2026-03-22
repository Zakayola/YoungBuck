'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Transaction, DashboardStats } from '@zakayola/types';
import { dashboardApi } from '@zakayola/sdk';
import { getStoredUser, clearSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import TransactionTable from '@/components/TransactionTable';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(stored);

    const load = async () => {
      try {
        const [statsData, txData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getTransactions(),
        ]);
        setStats(statsData);
        setTransactions(txData);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar user={user} onLogout={handleLogout} />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, <strong>{user?.name}</strong>. Here&apos;s what&apos;s happening.
            </p>
          </div>
          <div className={styles.networkBadge}>
            <span className={styles.networkDot} />
            Stellar Testnet
          </div>
        </div>

        {stats && (
          <div className={styles.statsGrid}>
            <StatCard
              label="Total Transactions"
              value={stats.totalTransactions.toLocaleString()}
              delta="+12.4%"
              positive
            />
            <StatCard
              label="Total Volume"
              value={`${stats.totalVolume} XLM`}
              delta="+8.1%"
              positive
            />
            <StatCard
              label="Active Wallets"
              value={stats.activeWallets.toLocaleString()}
              delta="+3.2%"
              positive
            />
            <StatCard
              label="Avg Fee"
              value={`${stats.avgFee} XLM`}
              delta="-1.5%"
              positive={false}
            />
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <button className={styles.viewAll}>View all</button>
          </div>
          <TransactionTable transactions={transactions} />
        </section>
      </main>
    </div>
  );
}
