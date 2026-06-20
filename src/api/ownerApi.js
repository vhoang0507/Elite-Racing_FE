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

// ─── Jockey Assignment ───────────────────────────────────────────────────────

export async function getJockeyAssignmentRegistrations() {
    return apiRequest('/owner/jockey-assignment/registrations');
}

export async function getJockeyAssignmentContext(registrationId) {
    return apiRequest(`/owner/jockey-assignment/${registrationId}/context`);
}

export async function getJockeyAssignmentSummary(registrationId) {
    return apiRequest(`/owner/jockey-assignment/${registrationId}/summary`);
}

export async function getJockeyCandidates(registrationId, { search, healthStatus, status, page, pageSize } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (healthStatus) params.set('healthStatus', healthStatus);
    if (status) params.set('status', status);
    if (page) params.set('page', page);
    if (pageSize) params.set('pageSize', pageSize);

    const query = params.toString();
    return apiRequest(`/owner/jockey-assignment/${registrationId}/candidates${query ? `?${query}` : ''}`);
}

export async function sendJockeyInvitation(registrationId, payload) {
    return apiRequest(`/owner/jockey-assignment/${registrationId}/invitations`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getJockeyInvitations(registrationId) {
    return apiRequest(`/owner/jockey-assignment/${registrationId}/invitations`);
}

export async function selectOfficialJockey(registrationId, invitationId) {
    return apiRequest(`/owner/jockey-assignment/${registrationId}/official-jockey/${invitationId}`, {
        method: 'PUT',
    });
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export async function getRewardSummary() {
    return apiRequest('/owner/rewards/summary');
}

export async function getAvailableRewards(limit = 10) {
    return apiRequest(`/owner/rewards/available?limit=${limit}`);
}

export async function claimReward(prizeAwardId) {
    return apiRequest(`/owner/rewards/${prizeAwardId}/claim`, {
        method: 'PUT',
    });
}

// ─── Results ─────────────────────────────────────────────────────────────────

export async function getHorseResults({ season, tournamentId, limit } = {}) {
    const params = new URLSearchParams();
    if (season) params.set('season', season);
    if (tournamentId) params.set('tournamentId', tournamentId);
    if (limit) params.set('limit', limit);
    const query = params.toString();
    return apiRequest(`/owner/results${query ? `?${query}` : ''}`);
}

export async function getHorsePerformance(resultId) {
    return apiRequest(`/owner/results/${resultId}/horse-performance`);
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
    getJockeyAssignmentRegistrations,
    getJockeyAssignmentContext,
    getJockeyAssignmentSummary,
    getJockeyCandidates,
    sendJockeyInvitation,
    getJockeyInvitations,
    selectOfficialJockey,
    getRewardSummary,
    getAvailableRewards,
    claimReward,
    getHorseResults,
    getHorsePerformance,
};