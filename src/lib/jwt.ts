import type { User } from '@/types/user';

interface JwtPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  exp: number;
  iat: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    roles: payload.roles,
    isAdmin: payload.roles.includes('ROLE_ADMIN'),
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return payload.exp < Date.now() / 1000;
}
