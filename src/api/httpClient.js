import { getAuthToken } from '../utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function buildApiUrl(endpoint) {
    if (endpoint.startsWith('http')) {
        return endpoint;
    }

    const baseUrl = API_BASE_URL.endsWith('/')
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${baseUrl}${path}`;
}

export async function apiRequest(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getAuthToken();

    const isFormData = options.body instanceof FormData;

    if (options.body && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(buildApiUrl(endpoint), {
        ...options,
        headers,
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        const message = data?.message || data?.title || response.statusText;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}