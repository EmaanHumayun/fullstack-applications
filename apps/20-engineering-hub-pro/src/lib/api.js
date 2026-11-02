const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function getStoredToken() {
  try {
    return localStorage.getItem('eh_token') || '';
  } catch (e) {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem('eh_token', token);
    } else {
      localStorage.removeItem('eh_token');
    }
  } catch (e) {}
}

export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const token = getStoredToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeader,
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const jsonBody = data => JSON.stringify(data);
