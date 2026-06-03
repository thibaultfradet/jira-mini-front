import type { ApiResponse } from '@/types/custom/ApiResponse';
import { cookies } from '@/services/auth';

const API_URL = import.meta.env.VITE_API_URL;

interface FetchOptions extends RequestInit {
  skipContentType?: boolean;
}

let refreshingPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = cookies.get('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.token) return null;

    cookies.set('auth_token', data.token as string, 7);
    if (data.refresh_token) cookies.set('refresh_token', data.refresh_token as string, 30);
    return data.token as string;
  } catch {
    return null;
  }
}

function getRefreshedToken(): Promise<string | null> {
  if (!refreshingPromise) {
    refreshingPromise = attemptRefresh().finally(() => {
      refreshingPromise = null;
    });
  }
  return refreshingPromise;
}

function buildHeaders(
  token: string | null,
  headers: Record<string, string>,
  skipContentType: boolean,
  body: BodyInit | null | undefined,
): Record<string, string> {
  const h: Record<string, string> = { ...headers };
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (!skipContentType && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
  }
  return h;
}

export async function fetchWithRefresh(
  logout: () => void,
  url: string,
  options: FetchOptions = {},
): Promise<ApiResponse> {
  const { skipContentType = false, ...fetchOptions } = options;
  const baseHeaders = (fetchOptions.headers as Record<string, string>) ?? {};

  let token = cookies.get('auth_token');
  let response = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(token, baseHeaders, skipContentType, fetchOptions.body),
  });

  if (response.status === 401) {
    const newToken = await getRefreshedToken();
    if (!newToken) {
      logout();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    token = newToken;
    response = await fetch(url, {
      ...fetchOptions,
      headers: buildHeaders(token, baseHeaders, skipContentType, fetchOptions.body),
    });
    if (response.status === 401) {
      logout();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (response.status === 204) return { success: true };

  return response.json() as Promise<ApiResponse>;
}
