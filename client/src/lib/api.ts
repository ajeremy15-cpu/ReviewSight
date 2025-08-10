import { queryClient } from "./queryClient";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiRequest("POST", "/api/auth/login", { email, password }),
    
    signup: (data: any) =>
      apiRequest("POST", "/api/auth/signup", data),
    
    logout: () =>
      apiRequest("POST", "/api/auth/logout"),
    
    me: () =>
      fetch("/api/auth/me", { credentials: "include" }),
    
    demo: () =>
      apiRequest("POST", "/api/auth/demo"),
  },

  // Dashboard endpoints
  dashboard: {
    get: (orgId: string) =>
      fetch(`/api/dashboard/${orgId}`, { credentials: "include" }),
  },

  // Reviews endpoints
  reviews: {
    list: (orgId: string, filters?: any) => {
      const params = new URLSearchParams(filters);
      return fetch(`/api/reviews/${orgId}?${params}`, { credentials: "include" });
    },
    
    upload: (orgId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`/api/reviews/${orgId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
  },

  // Analytics endpoints
  analytics: {
    recompute: (orgId: string) =>
      apiRequest("POST", `/api/insights/${orgId}/recompute`),
    
    weeklyReport: (orgId: string) =>
      fetch(`/api/reports/${orgId}/weekly`, { credentials: "include" }),
  },

  // Creators endpoints
  creators: {
    list: (filters?: any) => {
      const params = new URLSearchParams(filters);
      return fetch(`/api/creators?${params}`, { credentials: "include" });
    },
    
    profile: {
      get: () =>
        fetch("/api/creators/profile", { credentials: "include" }),
      
      update: (data: any) =>
        apiRequest("POST", "/api/creators/profile", data),
    },
  },

  // Shortlist endpoints
  shortlist: {
    list: (orgId: string) =>
      fetch(`/api/shortlist/${orgId}`, { credentials: "include" }),
    
    add: (orgId: string, creatorId: string) =>
      apiRequest("POST", `/api/shortlist/${orgId}/${creatorId}`),
    
    remove: (orgId: string, creatorId: string) =>
      apiRequest("DELETE", `/api/shortlist/${orgId}/${creatorId}`),
  },

  // Training endpoints
  training: {
    list: (category?: string) => {
      const params = category ? new URLSearchParams({ category }) : '';
      return fetch(`/api/training?${params}`, { credentials: "include" });
    },
    
    recommended: (orgId: string) =>
      fetch(`/api/training/recommended/${orgId}`, { credentials: "include" }),
  },

  // Settings endpoints
  settings: {
    usage: (orgId: string) =>
      fetch(`/api/usage/${orgId}`, { credentials: "include" }),
  },
};

// Helper function to invalidate queries after mutations
export const invalidateQueries = (queryKey: string | string[]) => {
  queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
};
