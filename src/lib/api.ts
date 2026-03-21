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
    organization_id?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Organization {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
}

export interface PaymentApproval {
    id: string;
    organization: string;
    amount: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Resource {
    id: string;
    organization: string;
    title: string;
    content: string;
    file_url: string;
    category: string;
    audience: string;
    status: 'draft' | 'published';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Enrollment {
    id: string;
    user: string;
    course: {
        id: string;
        title: string;
        difficulty: string;
    } | string;
    progress: number;
    status: 'in_progress' | 'completed';
    last_accessed: string;
}

export interface TrainingRequest {
    id: string;
    organization: string;
    organization_name?: string;
    created_by: string;
    title?: string;
    description: string;
    attachment_url?: string;
    status: 'pending' | 'approved' | 'rejected' | 'forwarded';
    created_at: string;
    updated_at: string;
}

export interface AwarenessTool {
    id: string;
    name: string;
    description: string;
    status: 'enabled' | 'disabled';
    config: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    usage_count: number;
}

export interface AwarenessToolUsage {
    id: string;
    tool: string;
    tool_name: string;
    user: string;
    user_email: string;
    action: string;
    metadata: string;
    created_at: string;
}

export interface Video {
    id: string;
    module: string;
    video_url: string;
    duration: number;
    order: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    course_provider: string; // Required during creation
    language: string;
    difficulty: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface Alert {
    id: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'published' | 'archived';
    notify_email: boolean;
    notify_sms: boolean;
    organization: string;
    created_by: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    total_deliveries: number;
    sent_deliveries: number;
    failed_deliveries: number;
    views_count: number;
}

export interface Campaign {
    id: string;
    organization: string;
    title: string;
    message: string;
    start_date: string;
    send_time: string;
    channels: string;
    status: 'draft' | 'active' | 'completed';
    impressions?: number;
    clicks?: number;
    image_url?: string;
}

export interface AlertDelivery {
    id: string;
    alert: string;
    user: string;
    user_email: string;
    channel: 'email' | 'sms';
    status: 'pending' | 'sent' | 'failed';
    detail: string;
    delivered_at: string;
    created_at: string;
}

export interface AlertView {
    id: string;
    alert: string;
    user: string;
    user_email: string;
    viewed_at: string;
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
        const method = options.method || 'GET';
        const headers = new Headers(options.headers || {});

        // Auto-add JSON content type if not provided and it has a body
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        // Defensive: If method is GET but there is a body, it's likely an error (unless it's a very specific case)
        // This helps catch cases where apiFetch('/url', { body: ... }) is called without method: 'POST'
        if (method === 'GET' && options.body) {
            console.warn(`apiFetch called with GET method but has a body for endpoint: ${endpoint}. Defaulting to POST.`);
        }

        if (tokens?.access) {
            headers.set('Authorization', `Bearer ${tokens.access}`);
        }

        const config: RequestInit = {
            ...options,
            method: options.body && method === 'GET' ? 'POST' : method,
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

// API Functions

// Organizations
export const getOrganizations = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Organization>>(`/api/v1/organizations/${query}`);
};

export const createOrganization = (data: Partial<Organization>) =>
    apiFetch<Organization>('/api/v1/organizations/', { method: 'POST', body: JSON.stringify(data) });

export const getOrganization = (id: string) =>
    apiFetch<Organization>(`/api/v1/organizations/${id}/`);

export const updateOrganization = (id: string, data: Partial<Organization>, patch = true) =>
    apiFetch<Organization>(`/api/v1/organizations/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteOrganization = (id: string) =>
    apiFetch(`/api/v1/organizations/${id}/`, { method: 'DELETE' });

// Payment Approvals
export const getPaymentApprovals = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<PaymentApproval>>(`/api/v1/payment-approvals/${query}`);
};

export const createPaymentApproval = (data: Partial<PaymentApproval>) =>
    apiFetch<PaymentApproval>('/api/v1/payment-approvals/', { method: 'POST', body: JSON.stringify(data) });

export const getPaymentApproval = (id: string) =>
    apiFetch<PaymentApproval>(`/api/v1/payment-approvals/${id}/`);

export const updatePaymentApproval = (id: string, data: Partial<PaymentApproval>, patch = true) =>
    apiFetch<PaymentApproval>(`/api/v1/payment-approvals/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deletePaymentApproval = (id: string) =>
    apiFetch(`/api/v1/payment-approvals/${id}/`, { method: 'DELETE' });

export const approvePaymentApproval = (id: string, data: any) =>
    apiFetch<PaymentApproval>(`/api/v1/payment-approvals/${id}/approve/`, { method: 'POST', body: JSON.stringify(data) });

export const rejectPaymentApproval = (id: string, data: any) =>
    apiFetch<PaymentApproval>(`/api/v1/payment-approvals/${id}/reject/`, { method: 'POST', body: JSON.stringify(data) });

// Resources
export const getResources = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Resource>>(`/api/v1/resources/${query}`);
};

export const createResource = (data: Partial<Resource>) =>
    apiFetch<Resource>('/api/v1/resources/', { method: 'POST', body: JSON.stringify(data) });

export const getResource = (id: string) =>
    apiFetch<Resource>(`/api/v1/resources/${id}/`);

export const updateResource = (id: string, data: Partial<Resource>, patch = true) =>
    apiFetch<Resource>(`/api/v1/resources/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteResource = (id: string) =>
    apiFetch(`/api/v1/resources/${id}/`, { method: 'DELETE' });

export const publishResource = (id: string, data: any) =>
    apiFetch<Resource>(`/api/v1/resources/${id}/publish/`, { method: 'POST', body: JSON.stringify(data) });

// Training Requests
export const getTrainingRequests = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<TrainingRequest>>(`/api/v1/training-requests/${query}`);
};

export const createTrainingRequest = (data: Partial<TrainingRequest>) =>
    apiFetch<TrainingRequest>('/api/v1/training-requests/', { method: 'POST', body: JSON.stringify(data) });

export const getTrainingRequest = (id: string) =>
    apiFetch<TrainingRequest>(`/api/v1/training-requests/${id}/`);

export const updateTrainingRequest = (id: string, data: Partial<TrainingRequest>, patch = true) =>
    apiFetch<TrainingRequest>(`/api/v1/training-requests/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteTrainingRequest = (id: string) =>
    apiFetch(`/api/v1/training-requests/${id}/`, { method: 'DELETE' });

export const approveTrainingRequest = (id: string, data?: any) =>
    apiFetch<TrainingRequest>(`/api/v1/training-requests/${id}/approve/`, { method: 'POST', body: JSON.stringify(data || {}) });

export const rejectTrainingRequest = (id: string, data?: any) =>
    apiFetch<TrainingRequest>(`/api/v1/training-requests/${id}/reject/`, { method: 'POST', body: JSON.stringify(data || {}) });

// Awareness Tools (SuperAdmin)
export const getAwarenessTools = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<AwarenessTool>>(`/api/v1/superadmin/awareness-tools/${query}`);
};

export const createAwarenessTool = (data: Partial<AwarenessTool>) =>
    apiFetch<AwarenessTool>('/api/v1/superadmin/awareness-tools/', { method: 'POST', body: JSON.stringify(data) });

export const getAwarenessTool = (id: string) =>
    apiFetch<AwarenessTool>(`/api/v1/superadmin/awareness-tools/${id}/`);

export const updateAwarenessTool = (id: string, data: Partial<AwarenessTool>, patch = true) =>
    apiFetch<AwarenessTool>(`/api/v1/superadmin/awareness-tools/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteAwarenessTool = (id: string) =>
    apiFetch(`/api/v1/superadmin/awareness-tools/${id}/`, { method: 'DELETE' });

export const configureAwarenessTool = (id: string, data: any) =>
    apiFetch<AwarenessTool>(`/api/v1/superadmin/awareness-tools/${id}/configure/`, { method: 'POST', body: JSON.stringify(data) });

export const toggleAwarenessToolStatus = (id: string, data: any = {}) =>
    apiFetch<AwarenessTool>(`/api/v1/superadmin/awareness-tools/${id}/toggle-status/`, { method: 'PATCH', body: JSON.stringify(data) });

export const getPublicAwarenessTools = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    // User requested to use the superadmin endpoint for fetching tools
    return apiFetch<PaginatedResponse<AwarenessTool>>(`/api/v1/superadmin/awareness-tools/${query}`);
};

export const recordAwarenessToolUsage = (data: { tool: string; action: string; metadata?: string }) =>
    apiFetch<AwarenessToolUsage>('/api/v1/superadmin/awareness-tool-usages/', {
        method: 'POST',
        body: JSON.stringify(data)
    });

export const getAwarenessToolUsage = (id: string) =>
    apiFetch<AwarenessTool>(`/api/v1/superadmin/awareness-tools/${id}/usage/`);

export const getAwarenessToolUsageStats = () =>
    apiFetch<AwarenessTool>('/api/v1/superadmin/awareness-tools/usage-stats/');

// Awareness Tool Usages (SuperAdmin)
export const getAwarenessToolUsages = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<AwarenessToolUsage>>(`/api/v1/superadmin/awareness-tool-usages/${query}`);
};

export const getAwarenessToolUsageDetail = (id: string) =>
    apiFetch<AwarenessToolUsage>(`/api/v1/superadmin/awareness-tool-usages/${id}/`);


// Videos
export const getVideos = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Video>>(`/api/v1/videos/${query}`);
};

export const createVideo = (data: Partial<Video>) =>
    apiFetch<Video>('/api/v1/videos/', { method: 'POST', body: JSON.stringify(data) });

export const getVideo = (id: string) =>
    apiFetch<Video>(`/api/v1/videos/${id}/`);

export const updateVideo = (id: string, data: Partial<Video>, patch = true) =>
    apiFetch<Video>(`/api/v1/videos/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteVideo = (id: string) =>
    apiFetch(`/api/v1/videos/${id}/`, { method: 'DELETE' });

// Courses
export const getCourses = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Course>>(`/api/v1/courses/${query}`);
};

export const createCourse = (data: Partial<Course>) =>
    apiFetch<Course>('/api/v1/courses/', { method: 'POST', body: JSON.stringify(data) });

export const getCourse = (id: string) =>
    apiFetch<Course>(`/api/v1/courses/${id}/`);

export const updateCourse = (id: string, data: Partial<Course>, patch = true) =>
    apiFetch<Course>(`/api/v1/courses/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteCourse = (id: string) =>
    apiFetch(`/api/v1/courses/${id}/`, { method: 'DELETE' });

// Alerts
export const getAlerts = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Alert>>(`/api/v1/alerts/${query}`);
};

export const createAlert = (data: Partial<Alert>) =>
    apiFetch<Alert>('/api/v1/alerts/', { method: 'POST', body: JSON.stringify(data) });

export const getAlert = (id: string) =>
    apiFetch<Alert>(`/api/v1/alerts/${id}/`);

export const updateAlert = (id: string, data: Partial<Alert>, patch = true) =>
    apiFetch<Alert>(`/api/v1/alerts/${id}/`, { method: patch ? 'PATCH' : 'PUT', body: JSON.stringify(data) });

export const deleteAlert = (id: string) =>
    apiFetch(`/api/v1/alerts/${id}/`, { method: 'DELETE' });

export const publishAlert = (id: string, data: any = {}) =>
    apiFetch<Alert>(`/api/v1/alerts/${id}/publish/`, { method: 'POST', body: JSON.stringify(data) });

export const acknowledgeAlert = (id: string, data: any = {}) =>
    apiFetch<Alert>(`/api/v1/alerts/${id}/acknowledge/`, { method: 'POST', body: JSON.stringify(data) });

// Alert Deliveries
export const getAlertDeliveries = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<AlertDelivery>>(`/api/v1/alert-deliveries/${query}`);
};

// Alert Views
export const getAlertViews = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<AlertView>>(`/api/v1/alert-views/${query}`);
};

// Enrollments
export const getEnrollments = () =>
    apiFetch<PaginatedResponse<Enrollment>>('/api/v1/enrollments/');

// Campaigns
export const getCampaigns = (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch<PaginatedResponse<Campaign>>(`/api/v1/campaigns/${query}`);
};


export const enrollInCourse = (courseId: string, userId: string) =>
    apiFetch<Enrollment>('/api/v1/enrollments/', {
        method: 'POST',
        body: JSON.stringify({
            user: userId,
            course: courseId,
            progress: 0,
            status: 'in_progress'
        })
    });


