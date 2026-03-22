import Link from 'next/link';
import styles from './Navbar.module.css';

interface NavbarProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.brand}>
          <span className={styles.brandMark}>⬡</span>
          <span className={styles.brandName}>YoungBuck</span>
        </Link>

        <div className={styles.links}>
          <Link href="/dashboard" className={styles.link}>
            Overview
          </Link>
          <Link href="/dashboard" className={styles.link}>
            Transactions
          </Link>
          <Link href="/dashboard" className={styles.link}>
            Contracts
          </Link>
        </div>

        <div className={styles.right}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
