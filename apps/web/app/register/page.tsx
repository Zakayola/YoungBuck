'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@zakayola/sdk';
import { persistSession } from '@/lib/auth';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      persistSession(token, user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.ambient} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>⬡</span>
          <span className={styles.brandName}>YoungBuck</span>
        </div>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join the decentralized economy</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={update('name')}
              placeholder="Satoshi Nakamoto"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                value={form.password}
                onChange={update('password')}
                placeholder="Min. 8 characters"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm</label>
              <input
                type="password"
                className={styles.input}
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
