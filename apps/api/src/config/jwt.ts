import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'youngbuck-dev-secret-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];

export interface JwtPayload {
  userId: string;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JwtPayload;
};
