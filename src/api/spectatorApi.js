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
// payload: { tournamentId, predictedHorseId, stakePoints }

export async function createPrediction(payload) {
    return apiRequest('/spectator/predictions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getMyPredictions() {
    // Returns array of { predictionId, tournamentId, tournamentName, predictedHorseId,
    //   predictedHorseName, isCorrect, pointsAwarded, stakePoints, netPoints, status, lockedAt }
    // pointsAwarded is the returned stake when correct; netPoints is 0 when
    // correct under the new scoring and -stakePoints when wrong.
    return apiRequest('/spectator/predictions/my');
}

// Returns { bettingPoints, initialBettingPoints, minimumStakePoints,
//           totalStakePoints, totalPayoutPoints, pendingStakePoints, netPoints }
export async function getSpectatorWallet() {
    return apiRequest('/spectator/predictions/wallet');
}

// ─── Race Replay ─────────────────────────────────────────────────────────────
// Returns { raceId, tournamentId, raceName, tournamentName, distanceMeters,
//           seed, totalDurationMs, officialAt,
//           runners[]: { resultId, horseId, horseName, horseImageUrl,
//                        ownerName, jockeyName, rank, finishTimeSeconds,
//                        finishTimeMs, lane, color } }

export async function getRaceReplay(raceId) {
    return apiRequest(`/spectator/races/${raceId}/replay`);
}

// ─── Tournament horses (for prediction picker) ────────────────────────────────
// Returns array of { horseId, horseName, ownerName, jockeyName }

export async function getTournamentHorses(tournamentId) {
    return apiRequest(`/spectator/tournaments/${tournamentId}/horses`);
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
// Horse leaderboard: [{ rank, horseId, horseName, ownerName, wins, totalRaces, winRate }]

export async function getHorseLeaderboard() {
    return apiRequest('/spectator/leaderboard/horses');
}

// Predictor leaderboard (season): [{ rank, spectatorName, points, correctPredictions, accuracy }]

export async function getPredictorLeaderboard() {
    return apiRequest('/spectator/leaderboard/predictors');
}

// ─── Season ───────────────────────────────────────────────────────────────────
// { seasonId, startDate, endDate, daysLeft, totalPredictors, totalPredictions }

export async function getCurrentSeason() {
    return apiRequest('/spectator/season/current');
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

export async function markAllSpectatorNotificationsAsRead() {
    return apiRequest('/spectator/notifications/read-all', { method: 'PUT' });
}

// ─── Export grouped ──────────────────────────────────────────────────────────

export const spectatorApi = {
    getSpectatorDashboard,
    getSpectatorTournaments,
    getSpectatorTournamentDetail,
    getRaceRegistrations,
    createPrediction,
    getMyPredictions,
    getSpectatorWallet,
    getTournamentHorses,
    getRaceReplay,
    getHorseLeaderboard,
    getPredictorLeaderboard,
    getCurrentSeason,
    getSpectatorRewards,
    getSpectatorNotifications,
    getSpectatorUnreadCount,
    markSpectatorNotificationAsRead,
    markAllSpectatorNotificationsAsRead,
};
