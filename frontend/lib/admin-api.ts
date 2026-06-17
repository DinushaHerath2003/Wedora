export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export function getAdminApiErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Request failed';

  if (message.includes('Cannot GET') || message.includes('404')) {
    return 'Admin API is unavailable. Restart the backend: cd backend && npm run start:dev';
  }

  if (message.includes('Unauthorized') || message.includes('Admin access required')) {
    return 'Admin access required. Please log in with an admin account.';
  }

  return message;
}
