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

const tournamentStatusLabels = {
    Draft: 'Draft',
    OpenRegistration: 'Open Registration',
    ClosedRegistration: 'Closed Registration',
    Ongoing: 'Ongoing',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
};

const formatTournamentStatus = (status) => tournamentStatusLabels[status] || status || '';

const getTournamentDeadlineWarning = (tournament) => {
    const status = tournament?.status ?? tournament?.Status;

    if (status !== 'OpenRegistration') {
        return null;
    }

    const dateValue = tournament?.startDate
        ?? tournament?.StartDate
        ?? tournament?.registrationDeadline
        ?? tournament?.RegistrationDeadline;

    if (!dateValue) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateText = String(dateValue);
    const deadline = new Date(dateText.includes('T') ? dateText : `${dateText}T00:00:00`);

    if (Number.isNaN(deadline.getTime())) {
        return null;
    }

    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            text: 'Registration deadline expired',
            type: 'danger',
        };
    }

    if (diffDays === 0) {
        return {
            text: 'Registration closes today',
            type: 'warning',
        };
    }

    if (diffDays <= 3) {
        return {
            text: `Registration closes in ${diffDays} day(s)`,
            type: 'warning',
        };
    }

    return null;
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

// Referees
const readApiField = (item, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => item?.[camelKey] ?? item?.[pascalKey];

const fallbackHorseBreedNames = {
    4: 'Thoroughbred',
    5: 'Arabian',
    6: 'Quarter Horse',
    7: 'Standardbred',
    8: 'Morgan',
    9: 'Appaloosa',
};

const getHorseBreedName = (horse) => {
    const breedName = readApiField(horse, 'breedName');
    const breed = readApiField(horse, 'breed');
    const nestedBreedName = typeof breed === 'object' ? readApiField(breed, 'breedName') : '';
    const breedId = Number(readApiField(horse, 'breedId'));

    if (breedName) return breedName;
    if (typeof breed === 'string' && breed) return breed;
    if (nestedBreedName) return nestedBreedName;

    return fallbackHorseBreedNames[breedId] || `Breed #${breedId || 0}`;
};

const mapAdminHorse = (horse, ownerNamesById = new Map()) => {
    const ownerId = readApiField(horse, 'ownerId');

    return {
        id: readApiField(horse, 'horseId'),
        name: readApiField(horse, 'horseName'),
        age: readApiField(horse, 'age'),
        heightCm: readApiField(horse, 'heightCm'),
        weight: readApiField(horse, 'weightKg'),
        weightKg: readApiField(horse, 'weightKg'),
        healthStatus: readApiField(horse, 'healthStatus'),
        imageUrl: readApiField(horse, 'imageUrl'),
        healthCertificateImageUrl: readApiField(horse, 'healthCertificateImageUrl'),
        isActive: readApiField(horse, 'isActive'),
        ownerId,
        owner: readApiField(horse, 'ownerName') || readApiField(horse, 'ownerFullName') || ownerNamesById.get(Number(ownerId)) || `Owner #${ownerId || 0}`,
        breedId: readApiField(horse, 'breedId'),
        achievementSummary: readApiField(horse, 'achievementSummary'),
        createdAt: readApiField(horse, 'createdAt'),
        approval: readApiField(horse, 'approval') || readApiField(horse, 'status') || 'Pending',
        breed: getHorseBreedName(horse),
        reportStatus: 'Active',
    };
};

const mapReferee = (referee) => ({
    refereeId: readApiField(referee, 'refereeId'),
    userId: readApiField(referee, 'userId'),
    fullName: readApiField(referee, 'fullName') || '',
    email: readApiField(referee, 'email') || '',
    phone: readApiField(referee, 'phone') || '',
    role: readApiField(referee, 'role') || 'RaceReferee',
    status: readApiField(referee, 'status') || 'Active',
    emailVerified: Boolean(readApiField(referee, 'emailVerified')),
    licenseNo: readApiField(referee, 'licenseNo') || '',
    experienceYears: readApiField(referee, 'experienceYears') ?? 0,
    isActive: Boolean(readApiField(referee, 'isActive')),
    createdAt: readApiField(referee, 'createdAt'),
});

async function getReferees() {
    const data = await apiRequest('/admin/referees');
    return Array.isArray(data) ? data.map(mapReferee) : [];
}

async function createRefereeAccount(payload) {
    const data = await apiRequest('/admin/referees', {
        method: 'POST',
        body: JSON.stringify({
            FullName: payload.fullName,
            Email: payload.email,
            Phone: payload.phone || null,
            Password: payload.password,
            ConfirmPassword: payload.confirmPassword,
            LicenseNo: payload.licenseNo || null,
            ExperienceYears: payload.experienceYears === '' || payload.experienceYears == null
                ? null
                : Number(payload.experienceYears),
        }),
    });

    const created = mapReferee(data);
    const requestedStatus = payload.status || 'Active';

    if (requestedStatus !== 'Active') {
        await updateUserStatus(created.userId || created.refereeId, requestedStatus);
    }

    return {
        ...created,
        status: requestedStatus,
    };
}

// ─── Horses ──────────────────────────────────────────────────────────────────

async function getHorses() {
    const [data, users] = await Promise.all([
        apiRequest('/admin/horses'),
        getUsers().catch(() => []),
    ]);
    const ownerNamesById = new Map((users || []).map((user) => [Number(user.id), user.name]));

    const horses = data.map((h) => mapAdminHorse(h, ownerNamesById));
    return { horses, reports: [] };
}

async function getHorseById(id) {
    const [data, users] = await Promise.all([
        apiRequest(`/admin/horses/${id}`),
        getUsers().catch(() => []),
    ]);
    const ownerNamesById = new Map((users || []).map((user) => [Number(user.id), user.name]));

    return mapAdminHorse(data, ownerNamesById);
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
        description: t.description || '',
        className: t.description || '',
        startDate: t.startDate ? t.startDate.split('T')[0] : '',
        endDate: t.endDate ? t.endDate.split('T')[0] : '',
        location: t.location,
        city: t.location,
        maxHorses: t.maxHorses,
        distanceMeters: getTournamentDistanceMeters(t),
        registeredHorses: t.entriesCount || 0,
        prizePool: t.prizePool,
        referee: getAssignedReferee(t),
        status: t.status,
        rules: t.rules,
        createdAt: t.createdAt,
        imageUrl: readApiField(t, 'imageUrl'),
        imagePosition: '50% center',
    }));
}

function getAssignedReferee(tournament) {
    const referee = tournament?.referee ?? tournament?.Referee;

    if (!referee || String(referee).trim().toLowerCase() === 'unassigned') {
        return null;
    }

    return referee;
}

async function getTournamentById(id) {
    const detail = await apiRequest(`/admin/tournaments/${id}`);
    let spectatorDetail = null;

    try {
        spectatorDetail = await apiRequest(`/spectator/tournaments/${id}`);
    } catch {
        spectatorDetail = null;
    }

    return {
        ...detail,
        race: spectatorDetail?.race ?? detail?.race,
        raceDateTime: spectatorDetail?.race?.raceDate ?? detail?.race?.raceDate ?? null,
        distanceMeters: getTournamentDistanceMeters(detail) ?? getTournamentDistanceMeters(spectatorDetail),
    };
}

const getTournamentDistanceMeters = (tournament) => {
    const distanceMeters = tournament?.distanceMeters ?? tournament?.race?.distanceMeters;

    return distanceMeters == null ? null : Number(distanceMeters);
};

function appendFormValue(formData, key, value) {
    if (value !== undefined && value !== null) {
        formData.append(key, value);
    }
}

async function createTournament(payload) {
    const formData = new FormData();

    appendFormValue(formData, 'TournamentName', payload.name || payload.tournamentName || '');
    appendFormValue(formData, 'Description', payload.description || payload.className || '');
    appendFormValue(formData, 'Location', payload.location || '');
    appendFormValue(formData, 'RaceDate', payload.endDate || payload.raceDate || '');
    appendFormValue(formData, 'RaceStartTime', payload.raceStartTime || '');
    appendFormValue(formData, 'RegistrationDeadline', payload.startDate || payload.registrationDeadline || '');
    appendFormValue(formData, 'DistanceMeters', Number(payload.distanceMeters || 0));
    appendFormValue(formData, 'MaxHorses', Number(payload.maxHorses || 0));
    appendFormValue(
        formData,
        'PrizePool',
        payload.prizePool ?? (
            Number(payload.goldPrize || 0) +
            Number(payload.silverPrize || 0) +
            Number(payload.bronzePrize || 0)
        )
    );
    appendFormValue(formData, 'Rules', payload.rules || '');
    appendFormValue(formData, 'Status', payload.status || '');

    if (typeof File !== 'undefined' && payload.tournamentImage instanceof File && payload.tournamentImage.size > 0) {
        formData.append('TournamentImage', payload.tournamentImage);
    }

    return apiRequest('/admin/tournaments', {
        method: 'POST',
        body: formData,
    });
}

async function updateTournamentStatus(id, status) {
    return apiRequest(`/admin/tournaments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

async function updateTournament(id, patch) {
    const formData = new FormData();

    appendFormValue(formData, 'TournamentName', patch.name || patch.tournamentName || '');
    appendFormValue(formData, 'Description', patch.description || patch.className || '');
    appendFormValue(formData, 'Location', patch.location || patch.city || '');
    appendFormValue(formData, 'RaceDate', patch.endDate || patch.raceDate || '');
    appendFormValue(formData, 'RaceStartTime', patch.raceStartTime || '');
    appendFormValue(formData, 'RegistrationDeadline', patch.startDate || patch.registrationDeadline || '');
    appendFormValue(formData, 'DistanceMeters', Number(patch.distanceMeters || 0));
    appendFormValue(formData, 'MaxHorses', Number(patch.maxHorses || 0));
    appendFormValue(formData, 'PrizePool', Number(patch.prizePool || 0));
    appendFormValue(formData, 'Rules', patch.rules || '');
    appendFormValue(formData, 'Status', patch.status || '');

    if (typeof File !== 'undefined' && patch.tournamentImage instanceof File && patch.tournamentImage.size > 0) {
        formData.append('TournamentImage', patch.tournamentImage);
    }

    return apiRequest(`/admin/tournaments/${id}`, {
        method: 'PUT',
        body: formData,
    });
}

async function deleteTournament(id) {
    return apiRequest(`/admin/tournaments/${id}`, { method: 'DELETE' });
}

// ─── Race Registrations ──────────────────────────────────────────────────────

async function getRegistrations() {
    return apiRequest('/admin/registrations');
}

async function getPendingRegistrations() {
    return apiRequest('/admin/registrations/pending');
}

async function getRegistrationById(id) {
    return apiRequest(`/admin/registrations/${id}`);
}

async function approveRegistration(id) {
    return apiRequest(`/admin/registrations/${id}/approve`, { method: 'PUT' });
}

async function rejectRegistration(id, adminNote = 'Rejected by admin') {
    return apiRequest(`/admin/registrations/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ adminNote }),
    });
}

// ─── Race Results ────────────────────────────────────────────────────────────

const formatRaceLabel = (result) => result.raceName || `Race #${result.raceId || '-'}`;

const formatFinishTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds === '') {
        return '-';
    }

    const numericSeconds = Number(seconds);

    return Number.isFinite(numericSeconds)
        ? `${numericSeconds.toFixed(2)}s`
        : String(seconds);
};

const mapRaceResult = (result) => {
    const race = formatRaceLabel(result);
    const score = result.score ?? '-';
    const numericScore = Number(result.score);

    return {
        id: result.resultId,
        resultId: result.resultId,
        raceId: result.raceId,
        registrationId: result.registrationId,
        finishPosition: result.finishPosition,
        finishTimeSeconds: result.finishTimeSeconds,
        score,
        status: result.status,
        enteredByRefereeId: result.enteredByRefereeId,
        adminConfirmedBy: result.adminConfirmedBy,
        publishedAt: result.publishedAt,
        note: result.note,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        slug: `result-${result.resultId}`,
        race,
        name: race,
        detail: `Registration #${result.registrationId || '-'}`,
        tone: result.status === 'Draft' ? 'gold' : 'green',
        position: result.finishPosition ?? '-',
        horse: result.horseName || `Registration #${result.registrationId || '-'}`,
        jockey: result.jockeyName || '-',
        owner: result.ownerName || '-',
        finishTime: formatFinishTime(result.finishTimeSeconds),
        scoreTone: Number.isFinite(numericScore) && numericScore >= 80 ? 'green' : 'gold',
    };
};

async function getResultSubmissions() {
    const data = await apiRequest('/admin/results');
    return data.map(mapRaceResult);
}

async function getPendingResults() {
    return apiRequest('/admin/results/pending');
}

async function getResultDetail(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    const result = await apiRequest(`/admin/results/${id}`);
    const mappedResult = mapRaceResult(result);

    return {
        race: mappedResult.race,
        raceName: mappedResult.race,
        trackCondition: result.trackCondition || 'Not provided',
        wind: result.wind || 'Race metadata unavailable',
        winningTime: mappedResult.finishTime,
        recordTime: result.recordTime || 'Official submitted result',
        topPerformer: {
            horse: mappedResult.horse,
            jockey: mappedResult.jockey,
            owner: mappedResult.owner,
        },
        results: [mappedResult],
    };
}

const normalizeReports = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.reports)) {
        return payload.reports;
    }

    return [];
};

const mapRefereeReport = (report) => ({
    id: report.reportId || report.violationId,
    reportId: report.reportId,
    violationId: report.violationId,
    raceId: report.raceId,
    registrationId: report.registrationId,
    refereeId: report.refereeId,
    title: report.reportContent
        ? `Report #${report.reportId}`
        : `${report.violationType || 'Referee Report'} #${report.violationId || report.reportId || '-'}`,
    content: report.reportContent || report.description || report.note || 'No report content provided.',
    submittedAt: report.submittedAt || report.createdAt,
    violationType: report.violationType,
    action: report.action,
    penaltyPoints: report.penaltyPoints,
});

async function getResultReportDetail(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    const result = await apiRequest(`/admin/results/${id}`);
    const mappedResult = mapRaceResult(result);
    let reports = [];
    let reportError = '';

    try {
        const reportPayload = await getReports();
        reports = normalizeReports(reportPayload)
            .filter((report) => (
                Number(report.raceId) === Number(result.raceId)
                && (
                    !result.enteredByRefereeId
                    || !report.refereeId
                    || Number(report.refereeId) === Number(result.enteredByRefereeId)
                )
            ))
            .map(mapRefereeReport);
    } catch (error) {
        reportError = error.message || 'Failed to load referee report.';
    }

    if (reports.length === 0 && result.note) {
        reports = [{
            id: `result-note-${result.resultId}`,
            raceId: result.raceId,
            registrationId: result.registrationId,
            refereeId: result.enteredByRefereeId,
            title: 'Result Note',
            content: result.note,
            submittedAt: result.updatedAt || result.createdAt,
        }];
    }

    return {
        resultId: result.resultId,
        raceId: result.raceId,
        raceName: mappedResult.race,
        registrationId: result.registrationId,
        refereeId: result.enteredByRefereeId,
        status: result.status,
        submittedAt: result.updatedAt || result.createdAt,
        reports,
        reportError,
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

async function rejectVerification(id, reason) {
    return apiRequest(`/admin/verifications/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
    });
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

// ─── Predictions ─────────────────────────────────────────────────────────────

async function getPredictions() {
    return apiRequest('/admin/predictions');
}

async function updatePredictionStatus(id, status) {
    return apiRequest(`/admin/predictions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ Status: status }),
    });
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
        formatTournamentStatus,
        getTournamentDeadlineWarning,
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

    // Referees
    getReferees,
    createRefereeAccount,

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
    getPendingRegistrations,
    getRegistrationById,
    approveRegistration,
    rejectRegistration,

    // Race Results
    getResultSubmissions,
    getPendingResults,
    getResultDetail,
    getResultReportDetail,
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
