import { QueryClient } from "@tanstack/react-query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Get session ID from localStorage
  const sessionId = localStorage.getItem('auth_session');
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers if they exist
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add Authorization header if session exists
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('API Error Response:', errorData);
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
        console.error('API Error Text:', errorText);
      }
    } catch (e) {
      // If parsing fails, use default message
      console.error('Error parsing error response:', e);
    }
    
    // If unauthorized, clear session
    if (response.status === 401) {
      localStorage.removeItem('auth_session');
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    console.error('Throwing error:', errorMessage);
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
}