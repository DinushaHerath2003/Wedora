const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

type ApiOptions = RequestInit & {
  token?: string;
};

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const accessToken = token ?? getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      typeof payload === 'string' && payload.trim()
        ? payload.trim()
        : typeof payload === 'object' && payload && 'message' in payload
          ? Array.isArray((payload as { message?: unknown }).message)
            ? (payload as { message: unknown[] }).message.join(', ')
            : String((payload as { message?: unknown }).message)
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export { API_BASE_URL };
