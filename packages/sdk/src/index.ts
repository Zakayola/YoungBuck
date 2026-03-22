export { authApi } from './api/auth';
export { dashboardApi } from './api/dashboard';
export { transactionsApi } from './api/transactions';
export { usersApi } from './api/users';
export { createApiClient, ApiError } from './api/client';
export type { ApiClientConfig } from './api/client';

// Stellar SDK exports (replaces Ethereum contract layer)
export { getAccount, accountExists, getXlmBalance } from './stellar/account';
export { sendPayment, getPayments, buildPaymentXdr } from './stellar/transaction';
export type { StellarAccountInfo, StellarBalance } from './stellar/account';
export type { SendPaymentParams, TransactionResult } from './stellar/transaction';
