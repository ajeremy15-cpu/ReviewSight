import { QueryClient, QueryFunction } from "@tanstack/react-query";

/** Turn `{ a: 1, b: 'x' }` into `/base?a=1&b=x` safely. */
function urlWithQuery(
  base: string,
  params?: Record<string, unknown> | null
): string {
  if (!params || typeof params !== "object") return base;
  const entries = Object.entries(params).flatMap(([k, v]) => {
    if (v === undefined || v === null || v === "") return [];
    if (Array.isArray(v)) return v.map((vv) => [k, String(vv)] as [string, string]);
    return [[k, String(v)] as [string, string]];
  });
  if (entries.length === 0) return base;
  const qs = new URLSearchParams(entries).toString();
  return `${base}?${qs}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Unified API helper that ALWAYS includes credentials and returns parsed JSON.
 * Usage:
 *   await apiRequest('GET', '/api/creators');
 *   await apiRequest('POST', '/api/auth/login', { email, password });
 */
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const body = data !== undefined ? JSON.stringify(data) : undefined;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include", // send session cookie
  });

  await throwIfResNotOk(res);

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  // Fallback if an endpoint returns text
  return (await res.text()) as unknown as T;
}

/**
 * A safer default query function for TanStack Query:
 * - Accepts query keys like: '/api/creators' OR ['/api/creators', { orgId: '...' }]
 * - Always sends credentials
 * - Optionally returns null on 401 (for public pages)
 */
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Normalize the query key into [baseUrl, paramsObject?]
    let base: string;
    let params: Record<string, unknown> | undefined;

    if (Array.isArray(queryKey)) {
      base = String(queryKey[0]);
      params = (queryKey[1] ?? undefined) as Record<string, unknown> | undefined;
    } else {
      base = String(queryKey);
    }

    const url = urlWithQuery(base, params);

    const res = await fetch(url, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as unknown as T;
    }

    await throwIfResNotOk(res);

    const ct = res.headers.get("content-type") || "";
    return (ct.includes("application/json")
      ? await res.json()
      : await res.text()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
