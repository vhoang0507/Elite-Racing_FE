import { apiRequest } from './httpClient';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardOverview() {
    return apiRequest('/owner/dashboard/overview');
}

export async function getApprovedRegistrations() {
    return apiRequest('/owner/dashboard/approved-registrations');
}

// ─── Tournaments ─────────────────────────────────────────────────────────────

export async function getNewTournaments() {
    return apiRequest('/owner/tournaments/new');
}

// ─── Races ───────────────────────────────────────────────────────────────────

export async function getRaceDetail(raceId) {
    return apiRequest(`/owner/races/${raceId}`);
}

// ─── Horses ──────────────────────────────────────────────────────────────────

export async function getHorses({ search, breedId, healthStatus, status, sortBy, page, pageSize } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (breedId) params.set('breedId', breedId);
    if (healthStatus) params.set('healthStatus', healthStatus);
    if (status) params.set('status', status);
    if (sortBy) params.set('sortBy', sortBy);
    if (page) params.set('page', page);
    if (pageSize) params.set('pageSize', pageSize);

    const query = params.toString();
    return apiRequest(`/owner/horses${query ? `?${query}` : ''}`);
}

export async function getHorseDetail(horseId) {
    return apiRequest(`/owner/horses/${horseId}`);
}

export async function getHorseStats() {
    return apiRequest('/owner/horses/stats');
}

export async function createHorse(payload) {
    return apiRequest('/owner/horses', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateHorse(horseId, payload) {
    return apiRequest(`/owner/horses/${horseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function updateHorseStatus(horseId, isActive) {
    return apiRequest(`/owner/horses/${horseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
    });
}

// ─── Horse Breeds ────────────────────────────────────────────────────────────

export async function getHorseBreeds() {
    return apiRequest('/owner/lookups/horse-breeds');
}
// ─── Registrations ───────────────────────────────────────────────────────────

export async function getOpenTournaments(limit = 3) {
    return apiRequest(`/owner/registrations/open-tournaments?limit=${limit}`);
}

export async function getEligibleHorses(raceId) {
    return apiRequest(`/owner/registrations/eligible-horses?raceId=${raceId}`);
}

export async function createRegistration(payload) {
    return apiRequest('/owner/registrations', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getPendingRegistrations() {
    return apiRequest('/owner/registrations/pending');
}

export async function getApprovedRegistrationsList() {
    return apiRequest('/owner/registrations/approved');
}

export async function getRegistrationDetail(registrationId) {
    return apiRequest(`/owner/registrations/${registrationId}`);
}

export async function getRegistrationJourney(registrationId) {
    return apiRequest(`/owner/registrations/${registrationId}/journey`);
}

// ─── Export grouped ──────────────────────────────────────────────────────────

export const ownerApi = {
    getDashboardOverview,
    getApprovedRegistrations,
    getNewTournaments,
    getRaceDetail,
    getHorses,
    getHorseDetail,
    getHorseStats,
    createHorse,
    updateHorse,
    updateHorseStatus,
    getHorseBreeds,
    getOpenTournaments,
    getEligibleHorses,
    createRegistration,
    getPendingRegistrations,
    getApprovedRegistrationsList,
    getRegistrationDetail,
    getRegistrationJourney,
};
