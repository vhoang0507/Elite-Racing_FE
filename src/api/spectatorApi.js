import { apiRequest } from './httpClient';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getSpectatorDashboard() {
    return apiRequest('/spectator/dashboard');
}

// ─── Tournaments ─────────────────────────────────────────────────────────────

export async function getSpectatorTournaments() {
    return apiRequest('/spectator/tournaments');
}

export async function getSpectatorTournamentDetail(id) {
    return apiRequest(`/spectator/tournaments/${id}`);
}

export async function getRaceRegistrations(raceId) {
    return apiRequest(`/spectator/races/${raceId}/registrations`);
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function createPrediction(payload) {
    return apiRequest('/spectator/predictions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getMyPredictions() {
    return apiRequest('/spectator/predictions/my');
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export async function getSpectatorRewards() {
    return apiRequest('/spectator/rewards');
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getSpectatorNotifications() {
    return apiRequest('/spectator/notifications');
}

export async function getSpectatorUnreadCount() {
    return apiRequest('/spectator/notifications/unread-count');
}

export async function markSpectatorNotificationAsRead(id) {
    return apiRequest(`/spectator/notifications/${id}/read`, { method: 'PUT' });
}

// ─── Export grouped ──────────────────────────────────────────────────────────

export const spectatorApi = {
    getSpectatorDashboard,
    getSpectatorTournaments,
    getSpectatorTournamentDetail,
    getRaceRegistrations,
    createPrediction,
    getMyPredictions,
    getSpectatorRewards,
    getSpectatorNotifications,
    getSpectatorUnreadCount,
    markSpectatorNotificationAsRead,
};