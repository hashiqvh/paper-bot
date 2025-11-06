import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

