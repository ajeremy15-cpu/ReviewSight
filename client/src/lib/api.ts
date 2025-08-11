// client/src/lib/api.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiRequest<T = any>(
  method: HttpMethod,
  url: string,
  data?: any
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;

  if (data !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include', // <-- send session cookie
  });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const payload = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (isJSON && (payload as any)?.message) || res.statusText;
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  return payload as T;
}

export const api = {
  get:  <T = any>(url: string) => apiRequest<T>('GET', url),
  post: <T = any>(url: string, data?: any) => apiRequest<T>('POST', url, data),
  put:  <T = any>(url: string, data?: any) => apiRequest<T>('PUT', url, data),
  patch:<T = any>(url: string, data?: any) => apiRequest<T>('PATCH', url, data),
  del:  <T = any>(url: string) => apiRequest<T>('DELETE', url),
};
