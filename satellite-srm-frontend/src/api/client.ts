export function getApiBaseUrl(): string {
  // In development, use relative paths to go through Vite proxy
  // In production, default to relative paths (same origin) unless VITE_API_BASE_URL is explicitly set
  const url = import.meta.env.VITE_API_BASE_URL || '';
  return url ? url.replace(/\/+$/, '') : '';
}

export function resolveApiUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!options.body || !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
