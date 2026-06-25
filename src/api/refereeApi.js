import { apiRequest } from './httpClient';

export const INSPECTION_STATUSES = {
    pending: 'PendingConfirmation',
    passed: 'Passed',
    failed: 'Failed',
};

export const VIOLATION_ACTIONS = {
    warning: 'Warning',
    pointDeduction: 'PointDeduction',
    disqualified: 'Disqualified',
};

export async function getRefereeDashboard() {
    return apiRequest('/referee/dashboard');
}

export async function getRefereeProfile() {
    return apiRequest('/auth/me');
}

export async function getAssignedRaces() {
    return apiRequest('/referee/races');
}

export async function getRaceRegistrations(raceId) {
    return apiRequest(`/referee/races/${raceId}/registrations`);
}

export async function saveInspection(raceId, payload) {
    return apiRequest(`/referee/races/${raceId}/inspections`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getInspectionReport(raceId, filter = 'all') {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    const query = params.toString();
    return apiRequest(`/referee/races/${raceId}/inspection-report${query ? `?${query}` : ''}`);
}

export async function saveRaceResult(raceId, payload) {
    return apiRequest(`/referee/races/${raceId}/results`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function confirmRaceResult(raceId, resultId) {
    return apiRequest(`/referee/races/${raceId}/results/${resultId}/confirm`, {
        method: 'PUT',
    });
}

export async function createViolation(raceId, payload) {
    return apiRequest(`/referee/races/${raceId}/violations`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getViolations(raceId) {
    return apiRequest(`/referee/races/${raceId}/violations`);
}

export async function getRaceResults(raceId) {
    return apiRequest(`/referee/races/${raceId}/results`);
}

export async function createRefereeReport(raceId, reportContent) {
    return apiRequest(`/referee/races/${raceId}/reports`, {
        method: 'POST',
        body: JSON.stringify({ reportContent }),
    });
}

export async function getRefereeReports(raceId) {
    return apiRequest(`/referee/races/${raceId}/reports`);
}

export async function getNotifications() {
    return apiRequest('/referee/notifications');
}

export async function getUnreadCount() {
    return apiRequest('/referee/notifications/unread-count');
}

export async function getNotificationSummary() {
    const [notifications, unreadData] = await Promise.all([
        getNotifications(),
        getUnreadCount().catch(() => ({ unreadCount: 0 })),
    ]);

    return {
        totalAlerts: notifications?.length ?? 0,
        unread: unreadData?.unreadCount ?? 0,
    };
}

export async function markNotificationAsRead(id) {
    return apiRequest(`/referee/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsAsRead() {
    return apiRequest('/referee/notifications/read-all', { method: 'PUT' });
}

export const refereeApi = {
    getRefereeDashboard,
    getRefereeProfile,
    getAssignedRaces,
    getRaceRegistrations,
    saveInspection,
    getInspectionReport,
    saveRaceResult,
    confirmRaceResult,
    createViolation,
    getViolations,
    getRaceResults,
    createRefereeReport,
    getRefereeReports,
    getNotifications,
    getUnreadCount,
    getNotificationSummary,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};
