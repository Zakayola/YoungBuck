import type { AuthResult, LoginInput, RegisterInput } from '@zakayola/types';
import { client } from './client';

export const authApi = {
  login: (input: LoginInput): Promise<AuthResult> =>
    client.post<AuthResult>('/api/auth/login', input, false),

  register: (input: RegisterInput): Promise<AuthResult> =>
    client.post<AuthResult>('/api/auth/register', input, false),
};
