import { apiRequest } from './httpClient';

export function register(payload) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function login(payload) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function verifyEmail(payload) {
    return apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function resendVerificationOtp(payload) {
    return apiRequest('/auth/resend-verification-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function getMe() {
    return apiRequest('/auth/me');
}

export function changePassword(payload) {
    return apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}
