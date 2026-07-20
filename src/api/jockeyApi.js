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

export async function getPendingInvitations(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.pageSize) query.set('pageSize', params.pageSize);
    const qs = query.toString();
    return apiRequest(`/jockey/invitations/pending${qs ? `?${qs}` : ''}`);
}

export async function getInvitationDetail(invitationId) {
    return apiRequest(`/jockey/invitations/${invitationId}`);
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

export async function getJockeyAvailabilities(from, to) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return apiRequest(`/jockey/availabilities${query ? `?${query}` : ''}`);
}

export async function updateJockeyAvailabilities(items) {
    return apiRequest('/jockey/availabilities', {
        method: 'PUT',
        body: JSON.stringify({
            Items: (items || []).map((item) => ({
                Date: item.date ?? item.Date,
                Status: item.status ?? item.Status,
            })),
        }),
    });
}


// ─── Rewards ─────────────────────────────────────────────────────────────────

export async function getJockeyRewardSummary() {
    return apiRequest('/jockey/rewards/summary');
}

export async function getJockeyRewards(limit = 50) {
    return apiRequest(`/jockey/rewards?limit=${limit}`);
}

export async function claimJockeyReward(prizePayoutId) {
    return apiRequest(`/jockey/rewards/${prizePayoutId}/claim`, {
        method: 'PUT',
    });
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

export async function getNotificationDetail(id) {
    return apiRequest(`/jockey/notifications/${id}`);
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
    getPendingInvitations,
    getInvitationDetail,
    acceptInvitation,
    rejectInvitation,
    getAcceptedRaces,
    getRaceDetail,
    getJockeyCalendar,
    getJockeyAvailabilities,
    updateJockeyAvailabilities,
    getJockeyRewardSummary,
    getJockeyRewards,
    claimJockeyReward,
    getNotificationSummary,
    getNotifications,
    getNotificationDetail,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
