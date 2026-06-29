import { apiRequest } from './httpClient';

// ─── Leaderboard ─────────────────────────────────────────────────────────────
// Params: { seasonId?, year?, limit? }

export async function getOwnerLeaderboard(params = {}) {
    const query = new URLSearchParams();
    if (params.seasonId) query.set('seasonId', String(params.seasonId));
    if (params.year)     query.set('year',     String(params.year));
    if (params.limit)    query.set('limit',    String(params.limit));
    const qs = query.toString();
    const data = await apiRequest(`/leaderboards/owners${qs ? `?${qs}` : ''}`);
    return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function getJockeyLeaderboard(params = {}) {
    const query = new URLSearchParams();
    if (params.seasonId) query.set('seasonId', String(params.seasonId));
    if (params.year)     query.set('year',     String(params.year));
    if (params.limit)    query.set('limit',    String(params.limit));
    const qs = query.toString();
    const data = await apiRequest(`/leaderboards/jockeys${qs ? `?${qs}` : ''}`);
    return Array.isArray(data) ? data : (data?.items ?? []);
}

export const leaderboardApi = {
    getOwnerLeaderboard,
    getJockeyLeaderboard,
};
