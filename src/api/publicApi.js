import { apiRequest } from './httpClient';

export async function getPublicHome() {
    return apiRequest('/public/home');
}

export async function getPublicTournaments(limit = 100) {
    return apiRequest(`/public/tournaments?limit=${encodeURIComponent(limit)}`);
}

export async function getPublicTournamentDetail(id) {
    return apiRequest(`/public/tournaments/${id}`);
}

export async function getPublicRaceDetail(id) {
    return apiRequest(`/public/races/${id}`);
}

export async function getPublicHorseDetail(id) {
    return apiRequest(`/public/horses/${id}`);
}

export async function getPublicJockeyDetail(id) {
    return apiRequest(`/public/jockeys/${id}`);
}

export async function getPublicOwnerDetail(id) {
    return apiRequest(`/public/owners/${id}`);
}

export const publicApi = {
    getPublicHome,
    getPublicTournaments,
    getPublicTournamentDetail,
    getPublicRaceDetail,
    getPublicHorseDetail,
    getPublicJockeyDetail,
    getPublicOwnerDetail,
};
