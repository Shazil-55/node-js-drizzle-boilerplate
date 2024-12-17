import jwt from 'jsonwebtoken';
import { Jwt } from './env';

// Function to generate JWT token
export function createAccessToken(payload: Record<string, string>): string {
  const token = jwt.sign(payload, Jwt.JWT_SECRET, { expiresIn: '2d' });
  return token;
}

// Function to generate JWT token
export function createRefreshToken(payload: Record<string, string>): string {
  const token = jwt.sign({ ...payload, isRefreshToken: true }, Jwt.JWT_SECRET, { expiresIn: '6h' });
  return token;
}
