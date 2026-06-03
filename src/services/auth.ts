const API_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refresh_token: string;
}

export const cookies = {
  set(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },

  get(name: string): string | null {
    const nameEQ = `${name}=`;
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const c = part.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  },

  remove(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { message?: string }).message ?? 'Identifiants invalides');
    }

    const data = await response.json() as AuthResponse;
    cookies.set('auth_token', data.token, 7);
    if (data.refresh_token) cookies.set('refresh_token', data.refresh_token, 30);
    return data;
  },

  serverLogout(): void {
    const refreshToken = cookies.get('refresh_token');
    if (refreshToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
  },

  logout(): void {
    cookies.remove('auth_token');
    cookies.remove('refresh_token');
  },

  getToken(): string | null {
    return cookies.get('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
