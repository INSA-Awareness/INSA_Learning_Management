export const API_BASE_URL = 'https://insaawaranessbackend-1.onrender.com';

// Types
export interface Tokens {
    access: string;
    refresh?: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    preferred_language: string;
    is_active: boolean;
    must_change_password?: boolean;
}

// Token Management Hook-like helpers for local storage
export const getTokens = (): Tokens | null => {
    if (typeof window === 'undefined') return null;
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access) return { access, refresh: refresh || undefined };
    return null;
};

export const setTokens = (tokens: Tokens) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', tokens.access);
    if (tokens.refresh) {
        localStorage.setItem('refresh_token', tokens.refresh);
    }
};

export const clearTokens = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// Advanced Fetch Wrapper
export async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
    try {
        const tokens = getTokens();
        const headers = new Headers(options.headers || {});

        // Auto-add JSON content type if not provided and it has a body
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (tokens?.access) {
            headers.set('Authorization', `Bearer ${tokens.access}`);
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Refresh Token Logic
        if (response.status === 401 && tokens?.refresh && endpoint !== '/api/auth/refresh/') {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: tokens.refresh }),
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                setTokens({ access: refreshData.access, refresh: tokens.refresh }); // Keep old refresh token

                // Retry original request with new access token
                headers.set('Authorization', `Bearer ${refreshData.access}`);
                config.headers = headers;
                response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                // Refresh failed, user needs to login again
                clearTokens();
                // optionally trigger a custom event that AuthProvider listens to
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
            }
        }

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            // Try to extract an error message
            const errorMessage = data && typeof data === 'object'
                ? Object.values(data).flat().join(', ') // Usually DRF sends { "field": ["error"] }
                : (data?.detail || data?.message || response.statusText);

            return { error: errorMessage || 'An error occurred', status: response.status };
        }

        return { data, status: response.status };
    } catch (error: any) {
        return { error: error.message || 'Network error', status: 500 };
    }
}
