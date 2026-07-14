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

export async function getRaceLifecycle(raceId) {
    return apiRequest(`/referee/races/${raceId}/lifecycle`);
}

function mergeRaceLifecycle(race, lifecycle) {
    const merged = { ...race, ...(lifecycle || {}) };

    return {
        ...merged,
        raceStatus: lifecycle?.raceStatus ?? race?.raceStatus,
        tournamentStatus: lifecycle?.tournamentStatus ?? race?.tournamentStatus,
        seasonStatus: lifecycle?.seasonStatus ?? race?.seasonStatus,
        allowedActions: lifecycle?.allowedActions ?? race?.allowedActions,
        blockingReason: lifecycle?.blockingReason ?? race?.blockingReason,
        currentStage: lifecycle?.currentStage ?? race?.currentStage,
        nextStage: lifecycle?.nextStage ?? race?.nextStage,
    };
}

export async function getAssignedRacesWithLifecycle() {
    const races = await getAssignedRaces();
    const list = races ?? [];

    const lifecycleResults = await Promise.allSettled(
        list.map((race) => getRaceLifecycle(race.raceId))
    );

    return list.map((race, index) => {
        const result = lifecycleResults[index];
        return result?.status === 'fulfilled'
            ? mergeRaceLifecycle(race, result.value)
            : race;
    });
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

export async function confirmAllRaceResults(raceId) {
    return apiRequest(`/referee/races/${raceId}/results/confirm-all`, {
        method: 'PUT',
    });
}

export async function markRaceReady(raceId) {
    return apiRequest(`/referee/races/${raceId}/mark-ready`, { method: 'PUT' });
}

export async function startRace(raceId) {
    return apiRequest(`/referee/races/${raceId}/start`, { method: 'PUT' });
}

export async function finishRace(raceId) {
    return apiRequest(`/referee/races/${raceId}/finish`, {
        method: 'PUT',
    });
}

export async function createViolation(raceId, payload) {
    return apiRequest(`/referee/races/${raceId}/violations`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateViolation(raceId, violationId, payload) {
    return apiRequest(`/referee/races/${raceId}/violations/${violationId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function deleteViolation(raceId, violationId) {
    return apiRequest(`/referee/races/${raceId}/violations/${violationId}`, {
        method: 'DELETE',
    });
}

export async function getViolations(raceId) {
    return apiRequest(`/referee/races/${raceId}/violations`);
}

export async function getRaceResults(raceId) {
    return apiRequest(`/referee/races/${raceId}/results`);
}

export async function createRefereeReport(raceId, reportContent, reportType = 'PostRace') {
    return apiRequest(`/referee/races/${raceId}/reports`, {
        method: 'POST',
        body: JSON.stringify({ reportContent, reportType }),
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
    getAssignedRacesWithLifecycle,
    getRaceLifecycle,
    getRaceRegistrations,
    saveInspection,
    getInspectionReport,
    markRaceReady,
    startRace,
    saveRaceResult,
    confirmRaceResult,
    confirmAllRaceResults,
    finishRace,
    createViolation,
    updateViolation,
    deleteViolation,
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
