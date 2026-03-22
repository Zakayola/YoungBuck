import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL =
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';

const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export const stellarService = {
  /**
   * Fetch account details from Horizon.
   */
  getAccount: async (publicKey: string) => {
    const account = await server.loadAccount(publicKey);
    return {
      id: account.id,
      sequence: account.sequenceNumber(),
      balances: account.balances,
      subentryCount: account.subentry_count,
    };
  },

  /**
   * Fetch recent payment operations for an account.
   */
  getPayments: async (publicKey: string, limit = 20) => {
    const payments = await server
      .payments()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();
    return payments.records;
  },

  /**
   * Submit a signed transaction XDR envelope to the Stellar network.
   */
  submitTransaction: async (xdr: string) => {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASE
    );
    const result = await server.submitTransaction(transaction);
    return {
      hash: result.hash,
      ledger: result.ledger,
      successful: result.successful,
    };
  },

  /**
   * Build a payment transaction and return XDR for client-side signing
   * (e.g. via Freighter or Albedo wallet).
   */
  buildPaymentXdr: async (
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    memo?: string
  ): Promise<string> => {
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      builder.addMemo(StellarSdk.Memo.text(memo));
    }

    return builder.build().toXDR();
  },
};
