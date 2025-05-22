import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || `${res.status}: ${text}`);
    } catch (e) {
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  pathOrMethod: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle both forms of the function:
  // 1. apiRequest(path, options?) - New style
  // 2. apiRequest(method, url, data?) - Old style
  
  if (typeof urlOrOptions === 'string') {
    // Old style: apiRequest(method, url, data?)
    const method = pathOrMethod;
    const url = urlOrOptions;
    
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } else {
    // New style: apiRequest(path, options?)
    const path = pathOrMethod;
    const options = urlOrOptions || {};
    
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });
    
    await throwIfResNotOk(res);
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
