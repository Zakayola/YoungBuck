import styles from './TransactionTable.module.css';

interface Transaction {
  id: string;
  stellarTxHash: string;
  from: string;
  to: string;
  amount: string;
  asset?: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
}

interface Props {
  transactions: Transaction[];
}

function truncate(addr: string, chars = 6) {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-4)}`;
}

const STATUS_LABELS: Record<Transaction['status'], string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  failed: 'Failed',
};

export default function TransactionTable({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className={styles.empty}>
        <p>No transactions found.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className={styles.hash}>{truncate(tx.stellarTxHash, 8)}</td>
              <td className={styles.addr}>{truncate(tx.from)}</td>
              <td className={styles.addr}>{truncate(tx.to)}</td>
              <td className={styles.amount}>{tx.amount} {tx.asset ?? 'XLM'}</td>
              <td>
                <span className={`${styles.badge} ${styles[tx.status]}`}>
                  {STATUS_LABELS[tx.status]}
                </span>
              </td>
              <td className={styles.time}>
                {new Date(tx.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
