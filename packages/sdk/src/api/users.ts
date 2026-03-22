import type { User } from '@zakayola/types';
import { client } from './client';

export interface UpdateProfileInput {
  name?: string;
  walletAddress?: string;
}

export const usersApi = {
  me: (): Promise<User> =>
    client.get<User>('/api/users/me'),

  updateProfile: (input: UpdateProfileInput): Promise<User> =>
    client.patch<User>('/api/users/me', input),
};
