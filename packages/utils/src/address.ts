/**
 * Truncate a Stellar public key for display.
 * truncateAddress("GABC...XYZ") → "GABC…XYZ"
 */
export function truncateAddress(address: string, leading = 6, trailing = 4): string {
  if (!address) return '';
  if (address.length <= leading + trailing) return address;
  return `${address.slice(0, leading)}…${address.slice(-trailing)}`;
}

/**
 * Returns true if the string is a valid Stellar public key (starts with G, 56 chars).
 */
export function isValidAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/**
 * Returns a shortened label useful in UI contexts: "GABC…XYZ"
 */
export function addressLabel(address: string): string {
  return truncateAddress(address, 6, 4);
}

/**
 * Stellar burn / null address (Genesis account with no private key).
 */
export const ZERO_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';
