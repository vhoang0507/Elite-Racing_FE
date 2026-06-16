import { apiRequest } from './httpClient';

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getJockeyProfile() {
    return apiRequest('/jockey/profile/me');
}

export async function updateJockeyProfile(payload) {
    return apiRequest('/jockey/profile/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function updateJockeyVerification(payload) {
    return apiRequest('/jockey/profile/verification', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

// ─── Lookups ─────────────────────────────────────────────────────────────────

export async function getJockeySettingsOptions() {
    return apiRequest('/jockey/lookups/settings-options');
}

export async function getJockeyHorseBreeds() {
    return apiRequest('/jockey/lookups/horse-breeds');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getJockeyDashboard() {
    return apiRequest('/jockey/dashboard');
}

// ─── Invitations ──────────────────────────────────────────────────────────────

export async function getPendingInvitations() {
    return apiRequest('/jockey/invitations/pending');
}

export async function acceptInvitation(id) {
    return apiRequest(`/jockey/invitations/${id}/accept`, { method: 'PUT' });
}

export async function rejectInvitation(id) {
    return apiRequest(`/jockey/invitations/${id}/reject`, { method: 'PUT' });
}

// ─── Races ───────────────────────────────────────────────────────────────────

export async function getAcceptedRaces() {
    return apiRequest('/jockey/races/accepted');
}

export async function getRaceDetail(raceId) {
    return apiRequest(`/jockey/races/${raceId}`);
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export async function getJockeyCalendar(month) {
    const query = month ? `?month=${month}` : '';
    return apiRequest(`/jockey/calendar${query}`);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotificationSummary() {
    return apiRequest('/jockey/notifications/summary');
}

export async function getNotifications({ status, date, sort, page, pageSize } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (date) params.set('date', date);
    if (sort) params.set('sort', sort);
    if (page) params.set('page', page);
    if (pageSize) params.set('pageSize', pageSize);
    const query = params.toString();
    return apiRequest(`/jockey/notifications${query ? `?${query}` : ''}`);
}

export async function markNotificationAsRead(id) {
    return apiRequest(`/jockey/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsAsRead() {
    return apiRequest('/jockey/notifications/read-all', { method: 'PUT' });
}

export async function deleteNotification(id) {
    return apiRequest(`/jockey/notifications/${id}`, { method: 'DELETE' });
}
// ─── Export grouped ──────────────────────────────────────────────────────────

export const jockeyApi = {
    getJockeyProfile,
    updateJockeyProfile,
    updateJockeyVerification,
    getJockeySettingsOptions,
    getJockeyHorseBreeds,
    getJockeyDashboard,
    getJockeyCalendar,
    getPendingInvitations,
    getAcceptedRaces,
    getRaceDetail,
    acceptInvitation,
    rejectInvitation,
    getJockeyProfile,
    updateJockeyProfile,
    updateJockeyVerification,
    getJockeySettingsOptions,
    getJockeyHorseBreeds,
    getNotificationSummary,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};