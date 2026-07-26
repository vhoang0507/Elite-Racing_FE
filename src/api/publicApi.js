import { apiRequest } from './httpClient';

export async function getPublicHome(upcomingLimit = 6) {
    return apiRequest(`/public/home?upcomingLimit=${encodeURIComponent(upcomingLimit)}`);
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

export async function getPublicRaceReplay(raceId) {
    return apiRequest(`/public/races/${raceId}/replay`);
}

export async function getPublicSpectatorLeaderboard({ seasonId, limit = 10 } = {}) {
    const query = new URLSearchParams({
        limit: String(limit),
    });

    if (seasonId) {
        query.set('seasonId', String(seasonId));
    }

    const data = await apiRequest(`/public/leaderboards/spectators?${query.toString()}`);
    return Array.isArray(data) ? data : (data?.items ?? []);
}

export const publicApi = {
    getPublicHome,
    getPublicTournaments,
    getPublicTournamentDetail,
    getPublicRaceDetail,
    getPublicHorseDetail,
    getPublicJockeyDetail,
    getPublicOwnerDetail,
    getPublicRaceReplay,
    getPublicSpectatorLeaderboard,
};
