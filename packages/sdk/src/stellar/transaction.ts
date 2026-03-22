import * as StellarSdk from '@stellar/stellar-sdk';
import { horizonServer } from './account';

const NETWORK_PASSPHRASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_STELLAR_NETWORK) === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

export interface SendPaymentParams {
  sourceSecretKey: string;
  destinationPublicKey: string;
  /** Amount as a decimal string, e.g. "10.5" */
  amount: string;
  /** Defaults to native XLM. Pass asset code + issuer for custom assets. */
  assetCode?: string;
  assetIssuer?: string;
  /** Optional text memo (max 28 bytes) */
  memo?: string;
}

export interface TransactionResult {
  hash: string;
  ledger: number;
  successful: boolean;
}

/**
 * Sign and submit a payment on the Stellar network.
 * For browser-based flows, prefer building the XDR server-side and
 * signing with a wallet (Freighter, Albedo, etc.) instead of passing
 * a secret key directly.
 */
export async function sendPayment(params: SendPaymentParams): Promise<TransactionResult> {
  const {
    sourceSecretKey,
    destinationPublicKey,
    amount,
    assetCode,
    assetIssuer,
    memo,
  } = params;

  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
  const sourceAccount = await horizonServer.loadAccount(sourceKeypair.publicKey());

  const asset =
    assetCode && assetIssuer
      ? new StellarSdk.Asset(assetCode, assetIssuer)
      : StellarSdk.Asset.native();

  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination: destinationPublicKey,
      asset,
      amount,
    })
  ).setTimeout(30);

  if (memo) {
    builder.addMemo(StellarSdk.Memo.text(memo));
  }

  const transaction = builder.build();
  transaction.sign(sourceKeypair);

  const result = await horizonServer.submitTransaction(transaction);

  return {
    hash: result.hash,
    ledger: result.ledger,
    successful: result.successful,
  };
}

/**
 * Fetch recent payment operations for a given Stellar account.
 */
export async function getPayments(publicKey: string, limit = 20) {
  const payments = await horizonServer
    .payments()
    .forAccount(publicKey)
    .limit(limit)
    .order('desc')
    .call();

  return payments.records;
}

/**
 * Build a payment transaction and return the XDR string for client-side signing.
 * Use this in server contexts where you don't want to handle secret keys.
 */
export async function buildPaymentXdr(
  sourcePublicKey: string,
  destinationPublicKey: string,
  amount: string,
  memo?: string
): Promise<string> {
  const sourceAccount = await horizonServer.loadAccount(sourcePublicKey);

  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination: destinationPublicKey,
      asset: StellarSdk.Asset.native(),
      amount,
    })
  ).setTimeout(30);

  if (memo) {
    builder.addMemo(StellarSdk.Memo.text(memo));
  }

  return builder.build().toXDR();
}
