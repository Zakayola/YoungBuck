import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export default function StatCard({ label, value, delta, positive }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <span className={`${styles.delta} ${positive ? styles.positive : styles.negative}`}>
        {delta} <span className={styles.period}>vs last 30d</span>
      </span>
    </div>
  );
}
