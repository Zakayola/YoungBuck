import bcrypt from 'bcryptjs';
import type { User, UserRecord, AuthResult, RegisterInput, LoginInput } from '@zakayola/types';
import { db } from '../config/db';
import { signToken } from '../config/jwt';

function sanitize(record: UserRecord): User {
  const { passwordHash: _, ...safe } = record;
  return safe;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = db.findUserByEmail(input.email);
  if (existing) {
    const err = Object.assign(new Error('An account with this email already exists'), {
      statusCode: 409,
    });
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const record = db.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });
  const token = signToken({ userId: record.id, email: record.email });

  return { token, user: sanitize(record) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const record = db.findUserByEmail(input.email);

  // Constant-time failure path: always run bcrypt even when user not found
  // to prevent user enumeration via timing difference.
  const DUMMY_HASH = '$2a$12$invalidhashfortimingprotectiononly000000000000000000000';
  const passwordToCheck = record ? record.passwordHash : DUMMY_HASH;
  const valid = await bcrypt.compare(input.password, passwordToCheck);

  if (!record || !valid) {
    const err = Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    throw err;
  }

  const token = signToken({ userId: record.id, email: record.email });
  return { token, user: sanitize(record) };
}
