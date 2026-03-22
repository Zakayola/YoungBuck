import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_HORIZON_URL) ||
  'https://horizon-testnet.stellar.org';

export const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

export interface StellarBalance {
  asset: string;
  balance: string;
}

export interface StellarAccountInfo {
  id: string;
  sequence: string;
  balances: StellarBalance[];
  subentryCount: number;
}

/**
 * Fetch a Stellar account's details from Horizon.
 * Throws if the account does not exist on the network.
 */
export async function getAccount(publicKey: string): Promise<StellarAccountInfo> {
  const account = await horizonServer.loadAccount(publicKey);

  const balances: StellarBalance[] = account.balances.map((b) => {
    if (b.asset_type === 'native') {
      return { asset: 'XLM', balance: b.balance };
    }
    const typed = b as StellarSdk.Horizon.HorizonApi.BalanceLineAsset;
    return {
      asset: `${typed.asset_code}:${typed.asset_issuer}`,
      balance: b.balance,
    };
  });

  return {
    id: account.id,
    sequence: account.sequenceNumber(),
    balances,
    subentryCount: account.subentry_count,
  };
}

/**
 * Returns true if the account exists on the Stellar network.
 */
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await horizonServer.loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the XLM balance for an account, or "0" if it doesn't exist.
 */
export async function getXlmBalance(publicKey: string): Promise<string> {
  try {
    const info = await getAccount(publicKey);
    const xlm = info.balances.find((b) => b.asset === 'XLM');
    return xlm?.balance ?? '0';
  } catch {
    return '0';
  }
}
