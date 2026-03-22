export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return { valid: false, error: 'Email is required.' };
  if (!re.test(email)) return { valid: false, error: 'Enter a valid email address.' };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required.' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters.' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Include at least one uppercase letter.' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Include at least one number.' };
  return { valid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name.trim()) return { valid: false, error: 'Name is required.' };
  if (name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters.' };
  return { valid: true };
}

export function validateEthAmount(amount: string): ValidationResult {
  const num = parseFloat(amount);
  if (!amount) return { valid: false, error: 'Amount is required.' };
  if (isNaN(num)) return { valid: false, error: 'Amount must be a number.' };
  if (num <= 0) return { valid: false, error: 'Amount must be greater than zero.' };
  if (num > 1_000_000) return { valid: false, error: 'Amount exceeds maximum allowed.' };
  return { valid: true };
}

export function validateEthAddress(address: string): ValidationResult {
  if (!address) return { valid: false, error: 'Address is required.' };
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return { valid: false, error: 'Enter a valid Ethereum address (0x…).' };
  }
  return { valid: true };
}
