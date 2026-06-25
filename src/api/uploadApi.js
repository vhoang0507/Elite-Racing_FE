import { apiRequest } from './httpClient';

export async function uploadFile(file, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return apiRequest('/uploads', {
        method: 'POST',
        body: formData,
    });
}

export function resolveFileUrl(url) {
    if (!url) return '';

    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('blob:') ||
        url.startsWith('data:')
    ) {
        return url;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

    return `${backendOrigin}${url.startsWith('/') ? url : `/${url}`}`;
}