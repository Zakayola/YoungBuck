const API_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000';

/**
 * Fetch a Stellar account's details via the YoungBuck API.
 */
export async function fetchStellarAccount(publicKey: string) {
  const res = await fetch(`${API_URL}/api/stellar/account/${publicKey}`);
  if (!res.ok) throw new Error('Failed to fetch Stellar account');
  return res.json();
}

/**
 * Fetch recent payment operations for a Stellar account.
 */
export async function fetchStellarPayments(publicKey: string, limit = 20) {
  const res = await fetch(
    `${API_URL}/api/stellar/payments/${publicKey}?limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

/**
 * Ask the backend to build a payment XDR ready for client-side wallet signing.
 */
export async function buildPayment(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  memo?: string
) {
  const res = await fetch(`${API_URL}/api/stellar/transaction/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourcePublicKey, destinationPublicKey, amount, memo }),
  });
  if (!res.ok) throw new Error('Failed to build transaction');
  return res.json() as Promise<{ xdr: string }>;
}

/**
 * Submit a signed XDR transaction envelope to the Stellar network via the API.
 */
export async function submitTransaction(xdr: string) {
  const res = await fetch(`${API_URL}/api/stellar/transaction/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xdr }),
  });
  if (!res.ok) throw new Error('Failed to submit transaction');
  return res.json();
}
