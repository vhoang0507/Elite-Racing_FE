import { apiRequest } from './httpClient';

// ─── Formatters (kept for FE display) ────────────────────────────────────────

const toMoney = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

const toDateLabel = (dateValue) => {
    if (!dateValue) return '';
    const d = dateValue.includes('T') ? dateValue : `${dateValue}T00:00:00`;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(d));
};

const toShortDateParts = (startDate, endDate) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const startLabel = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
    }).format(start);
    const endDay = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(end);
    const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(end);

    return [`${startLabel} - ${endDay}`, endMonth, String(end.getFullYear())];
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

async function getDashboard() {
    // Fetch the stats summary plus the lists used by the dashboard panels.
    // The BE /admin/dashboard endpoint only returns counters, so we fetch
    // tournaments, users and pending verifications separately and merge them.
    const [data, tournaments, users, verifications] = await Promise.all([
        apiRequest('/admin/dashboard'),
        getTournaments().catch(() => []),
        getUsers().catch(() => []),
        getVerifications().catch(() => []),
    ]);

    // Build the approval queue from pending verifications (HorseOwner / Jockey)
    const approvals = (verifications || []).map((v) => ({
        id: v.userId,
        name: v.fullName,
        role: v.role,
        request: 'Account verification',
        progress: 42,
        avatar: (v.fullName || '')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        source: 'user',
    }));

    return {
        stats: [
            {
                label: 'Total Users',
                value: String(data.totalUsers || 0),
                trend: `${data.pendingRegistrations || 0} pending`,
                tone: 'users',
            },
            {
                label: 'Active Tournaments',
                value: String(data.totalTournaments || 0),
                trend: '',
                tone: 'tournaments',
            },
            {
                label: 'Pending Registrations',
                value: String(data.pendingRegistrations || 0),
                trend: `${data.totalHorses || 0} horses`,
                tone: 'registrations',
            },
            {
                label: 'Pending Results',
                value: String(data.pendingResults || 0),
                trend: '',
                tone: 'results',
            },
        ],
        tournaments: (tournaments || []).slice(0, 5),
        approvals,
        users: (users || []).slice(0, 6),
    };
}

// ─── Users ───────────────────────────────────────────────────────────────────

async function getUsers() {
    const data = await apiRequest('/admin/users');
    // Map BE fields to FE expected fields
    return data.map((u) => ({
        id: u.userId,
        name: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status,
        verified: u.emailVerified,
        createdAt: u.createdAt,
        avatar: (u.fullName || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    }));
}

async function getUserById(id) {
    return apiRequest(`/admin/users/${id}`);
}

async function updateUserStatus(id, status) {
    const action = mapUserAction(status);
    return apiRequest(`/admin/users/${id}/${action}`, { method: 'PUT' });
}

function mapUserAction(status) {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'approved') return 'approve';
    if (s === 'inactive' || s === 'rejected') return 'reject';
    if (s === 'banned' || s === 'blocked') return 'block';
    if (s === 'unblocked') return 'unblock';
    return 'approve';
}

// ─── Horses ──────────────────────────────────────────────────────────────────

async function getHorses() {
    const data = await apiRequest('/admin/horses');
    const horses = data.map((h) => ({
        id: h.horseId,
        name: h.horseName,
        age: h.age,
        heightCm: h.heightCm,
        weightKg: h.weightKg,
        healthStatus: h.healthStatus,
        isActive: h.isActive,
        ownerId: h.ownerId,
        breedId: h.breedId,
        achievementSummary: h.achievementSummary,
        createdAt: h.createdAt,
        approval: h.isActive ? 'Active' : 'Pending',
        breed: `Breed #${h.breedId || 0}`,
        reportStatus: 'Active',
    }));
    return { horses, reports: [] };
}

async function getHorseById(id) {
    return apiRequest(`/admin/horses/${id}`);
}

async function updateHorseApproval(id, approval) {
    const action = (approval || '').toLowerCase().includes('active') || (approval || '').toLowerCase().includes('approved')
        ? 'approve'
        : 'suspend';
    return apiRequest(`/admin/horses/${id}/${action}`, { method: 'PUT' });
}

// ─── Tournaments ─────────────────────────────────────────────────────────────

async function getTournaments() {
    const data = await apiRequest('/admin/tournaments');
    return data.map((t) => ({
        id: t.tournamentId,
        name: t.tournamentName,
        className: t.description || '',
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        endDate: t.endDate ? t.endDate.split('T')[0] : '',
        location: t.location,
        city: t.location,
        maxHorses: t.maxHorses,
        registeredHorses: t.entriesCount || 0,
        prizePool: t.prizePool,
        status: t.status,
        rules: t.rules,
        createdAt: t.createdAt,
        imagePosition: '50% center',
    }));
}

async function getTournamentById(id) {
    return apiRequest(`/admin/tournaments/${id}`);
}

async function createTournament(payload) {
    const mappedPayload = {
        tournamentName: payload.name,
        description: payload.className || null,
        location: payload.location || null,
        startDate: payload.startDate,
        endDate: payload.endDate,
        maxHorses: Number(payload.maxHorses || 0),
        prizePool: Number(payload.goldPrize || 0) + Number(payload.silverPrize || 0) + Number(payload.bronzePrize || 0),
        minHorseAge: payload.minAge ? Number(payload.minAge) : null,
        maxHorseAge: payload.maxAge ? Number(payload.maxAge) : null,
        minHorseWeightKg: payload.minWeight ? Number(payload.minWeight) : null,
        maxHorseWeightKg: payload.maxWeight ? Number(payload.maxWeight) : null,
        rules: payload.rules || null,
    };

    return apiRequest('/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify(mappedPayload),
    });
}

async function updateTournamentStatus(id, status) {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel')) return apiRequest(`/admin/tournaments/${id}/cancel`, { method: 'PUT' });
    if (s.includes('open') || s.includes('approve')) return apiRequest(`/admin/tournaments/${id}/approve`, { method: 'PUT' });
    // For other status changes, use the general PUT update
    return apiRequest(`/admin/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

async function updateTournament(id, patch) {
    // Map FE field names to BE DTO (AdminTournamentRequest) field names
    const body = {
        tournamentName: patch.name || patch.tournamentName || '',
        description: patch.className || patch.description || '',
        location: patch.location || patch.city || '',
        startDate: patch.startDate,
        endDate: patch.endDate,
        maxHorses: Number(patch.maxHorses || 0),
        prizePool: Number(patch.prizePool || 0),
        minHorseAge: patch.minHorseAge ? Number(patch.minHorseAge) : null,
        maxHorseAge: patch.maxHorseAge ? Number(patch.maxHorseAge) : null,
        minHorseWeightKg: patch.minHorseWeightKg ? Number(patch.minHorseWeightKg) : null,
        maxHorseWeightKg: patch.maxHorseWeightKg ? Number(patch.maxHorseWeightKg) : null,
        rules: patch.rules || '',
    };

    return apiRequest(`/admin/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

async function deleteTournament(id) {
    return apiRequest(`/admin/tournaments/${id}`, { method: 'DELETE' });
}

// ─── Race Registrations ──────────────────────────────────────────────────────

async function getRegistrations() {
    return apiRequest('/admin/registrations');
}

async function getRegistrationById(id) {
    return apiRequest(`/admin/registrations/${id}`);
}

async function approveRegistration(id) {
    return apiRequest(`/admin/registrations/${id}/approve`, { method: 'PUT' });
}

async function rejectRegistration(id) {
    return apiRequest(`/admin/registrations/${id}/reject`, { method: 'PUT' });
}

// ─── Race Results ────────────────────────────────────────────────────────────

async function getResultSubmissions() {
    const data = await apiRequest('/admin/results');
    return data.map((r) => ({
        id: r.resultId,
        raceId: r.raceId,
        registrationId: r.registrationId,
        finishPosition: r.finishPosition,
        finishTimeSeconds: r.finishTimeSeconds,
        score: r.score,
        status: r.status,
        enteredByRefereeId: r.enteredByRefereeId,
        adminConfirmedBy: r.adminConfirmedBy,
        publishedAt: r.publishedAt,
        note: r.note,
        createdAt: r.createdAt,
        slug: `result-${r.resultId}`,
        name: `Race #${r.raceId}`,
        tone: r.status === 'Draft' ? 'gold' : 'green',
    }));
}

async function getPendingResults() {
    return apiRequest('/admin/results/pending');
}

async function getResultDetail(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    const result = await apiRequest(`/admin/results/${id}`);
    return {
        race: `Race #${result.raceId}`,
        results: [result],
    };
}

async function publishResult(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    return apiRequest(`/admin/results/${id}/approve`, { method: 'PUT' });
}

async function rejectResult(id) {
    return apiRequest(`/admin/results/${id}/reject`, { method: 'PUT' });
}

// ─── Reports (Violations) ────────────────────────────────────────────────────

async function getReports() {
    return apiRequest('/admin/reports');
}

async function getReportById(id) {
    return apiRequest(`/admin/reports/${id}`);
}

async function getReportsToday() {
    return apiRequest('/admin/reports/today');
}

async function getReportStatistics() {
    return apiRequest('/admin/reports/statistics');
}

async function resolveReport(id) {
    return apiRequest(`/admin/reports/${id}/resolve`, { method: 'PUT' });
}

async function rejectReport(id) {
    return apiRequest(`/admin/reports/${id}/reject`, { method: 'PUT' });
}

// ─── Verifications ───────────────────────────────────────────────────────────

async function getVerifications() {
    return apiRequest('/admin/verifications');
}

async function getOwnerVerifications() {
    return apiRequest('/admin/verifications/owners');
}

async function getJockeyVerifications() {
    return apiRequest('/admin/verifications/jockeys');
}

async function getVerificationById(id) {
    return apiRequest(`/admin/verifications/${id}`);
}

async function approveVerification(id) {
    return apiRequest(`/admin/verifications/${id}/approve`, { method: 'PUT' });
}

async function rejectVerification(id) {
    return apiRequest(`/admin/verifications/${id}/reject`, { method: 'PUT' });
}

// ─── Notifications (no BE endpoint yet - placeholder) ────────────────────────

async function getNotifications() {
    // No notifications endpoint in BE yet, return empty array
    return [];
}

async function markNotificationRead(id) {
    // Placeholder until BE adds notification endpoints
    return { message: 'Marked as read', id };
}

// ─── Predictions (no BE endpoint yet - placeholder) ──────────────────────────

async function getPredictions() {
    // No predictions endpoint in BE yet, return empty array
    return [];
}

async function updatePredictionStatus(id, status) {
    // Placeholder
    return { message: 'Status updated', id, status };
}

// ─── Horse Reports (mapped to BE reports/violations) ─────────────────────────

async function closeHorseReport(id) {
    return resolveReport(id);
}

async function deleteHorseReport(id) {
    // No delete endpoint in BE - use reject as alternative
    return rejectReport(id);
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const adminApi = {
    formatters: {
        toDateLabel,
        toMoney,
        toShortDateParts,
    },

    // Dashboard
    getDashboard,

    // Users
    getUsers,
    getUserById,
    updateUserStatus,

    // Horses
    getHorses,
    getHorseById,
    updateHorseApproval,

    // Tournaments
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournamentStatus,
    updateTournament,
    deleteTournament,

    // Race Registrations
    getRegistrations,
    getRegistrationById,
    approveRegistration,
    rejectRegistration,

    // Race Results
    getResultSubmissions,
    getPendingResults,
    getResultDetail,
    publishResult,
    rejectResult,

    // Reports
    getReports,
    getReportById,
    getReportsToday,
    getReportStatistics,
    resolveReport,
    rejectReport,

    // Verifications
    getVerifications,
    getOwnerVerifications,
    getJockeyVerifications,
    getVerificationById,
    approveVerification,
    rejectVerification,

    // Notifications
    getNotifications,
    markNotificationRead,

    // Predictions
    getPredictions,
    updatePredictionStatus,

    // Horse reports
    closeHorseReport,
    deleteHorseReport,
};
