import { apiRequest } from './httpClient';
import {
    formatCurrency,
    parseCurrency,
} from '../utils/currency';

// ─── Formatters (kept for FE display) ────────────────────────────────────────

const toMoney = (value) => formatCurrency(value);

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
                trend: `${data.activeUsers || 0} active`,
                tone: 'users',
            },
            {
                label: 'Active Tournaments',
                value: String(data.activeTournaments ?? data.totalTournaments ?? 0),
                trend: `${data.totalRaces || 0} races`,
                tone: 'tournaments',
            },
            {
                label: 'Pending Registrations',
                value: String(data.pendingRegistrations || 0),
                trend: `${data.upcomingRaces || 0} upcoming races`,
                tone: 'registrations',
            },
            {
                label: 'Pending Results',
                value: String(data.pendingResults || 0),
                trend: `${data.totalPredictions || 0} predictions`,
                tone: 'results',
            },
        ],
        metrics: {
            ...data,
        },
        nextRaces: data.nextRaces || [],
        recentActivities: data.recentActivities || [],
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
            Status: payload.status || 'Active',
        }),
    });

    return mapReferee(data);
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
        seasonId: readApiField(t, 'seasonId'),
        seasonName: readApiField(t, 'seasonName'),
        seasonStatus: readApiField(t, 'seasonStatus'),
        raceId: readApiField(t, 'raceId') ?? t.race?.raceId ?? t.Race?.RaceId,
        raceDateTime: readApiField(t, 'raceDateTime') ?? t.race?.raceDate ?? t.Race?.RaceDate,
        raceStartTime: readApiField(t, 'raceStartTime'),
        raceStatus: readApiField(t, 'raceStatus') ?? t.race?.status ?? t.Race?.Status,
        predictionDeadline: readApiField(t, 'predictionDeadline') ?? t.race?.predictionDeadline ?? t.Race?.PredictionDeadline,
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

    return {
        ...detail,
        race: detail?.race ?? detail?.Race,
        raceDateTime: detail?.race?.raceDate ?? detail?.raceDate ?? detail?.RaceDate ?? null,
        distanceMeters: getTournamentDistanceMeters(detail),
    };
}

const getTournamentDistanceMeters = (tournament) => {
    const distanceMeters = tournament?.distanceMeters ?? tournament?.DistanceMeters ?? tournament?.race?.distanceMeters ?? tournament?.Race?.DistanceMeters;

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
        payload.prizePool === undefined || payload.prizePool === null
            ? parseCurrency(payload.goldPrize) + parseCurrency(payload.silverPrize) + parseCurrency(payload.bronzePrize)
            : parseCurrency(payload.prizePool)
    );
    appendFormValue(formData, 'Rules', payload.rules || '');

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
        body: JSON.stringify({ Status: status }),
    });
}

async function approveTournament(id) {
    return apiRequest(`/admin/tournaments/${id}/approve`, { method: 'PUT' });
}

async function closeTournamentRegistration(id) {
    return updateTournamentStatus(id, 'ClosedRegistration');
}

async function cancelTournament(id) {
    return apiRequest(`/admin/tournaments/${id}/cancel`, { method: 'PUT' });
}

async function updateTournament(id, patch) {
    const formData = new FormData();

    appendFormValue(formData, 'TournamentName', patch.name || patch.tournamentName || '');
    appendFormValue(formData, 'Description', patch.description || patch.className || '');
    appendFormValue(formData, 'Location', patch.location || '');
    appendFormValue(formData, 'RaceDate', patch.endDate || patch.raceDate || '');
    appendFormValue(formData, 'RaceStartTime', patch.raceStartTime || '');
    appendFormValue(formData, 'RegistrationDeadline', patch.startDate || patch.registrationDeadline || '');
    appendFormValue(formData, 'DistanceMeters', Number(patch.distanceMeters || 0));
    appendFormValue(formData, 'MaxHorses', Number(patch.maxHorses || 0));
    appendFormValue(formData, 'PrizePool', parseCurrency(patch.prizePool));
    appendFormValue(formData, 'Rules', patch.rules || '');

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

async function restoreTournament(id) {
    return apiRequest(`/admin/tournaments/${id}/restore`, { method: 'PUT' });
}

async function getTournamentReferees() {
    return apiRequest('/admin/tournaments/referees');
}

async function assignTournamentReferee(tournamentId, refereeId) {
    return apiRequest(`/admin/tournaments/${tournamentId}/assign-referee`, {
        method: 'PUT',
        body: JSON.stringify({ RefereeId: Number(refereeId) }),
    });
}

const toRacePayload = (payload) => ({
    RaceName: payload.raceName ?? payload.RaceName ?? '',
    RaceDate: payload.raceDate ?? payload.RaceDate ?? '',
    DistanceMeters: Number(payload.distanceMeters ?? payload.DistanceMeters ?? 0),
    Location: payload.location ?? payload.Location ?? null,
    MaxHorses: Number(payload.maxHorses ?? payload.MaxHorses ?? 0),
    JockeySelectionDeadline: payload.jockeySelectionDeadline ?? payload.JockeySelectionDeadline ?? null,
    PredictionDeadline: payload.predictionDeadline ?? payload.PredictionDeadline ?? null,
    RefereeId: payload.refereeId ? Number(payload.refereeId) : null,
});

const mapAdminRace = (race) => ({
    raceId: readApiField(race, 'raceId'),
    tournamentId: readApiField(race, 'tournamentId'),
    raceName: readApiField(race, 'raceName') || '',
    raceDate: readApiField(race, 'raceDate'),
    originalRaceDate: readApiField(race, 'originalRaceDate'),
    distanceMeters: readApiField(race, 'distanceMeters'),
    location: readApiField(race, 'location') || '',
    maxHorses: readApiField(race, 'maxHorses'),
    jockeySelectionDeadline: readApiField(race, 'jockeySelectionDeadline'),
    predictionDeadline: readApiField(race, 'predictionDeadline'),
    status: readApiField(race, 'status'),
    postponedAt: readApiField(race, 'postponedAt'),
    postponementReason: readApiField(race, 'postponementReason'),
    cancelledAt: readApiField(race, 'cancelledAt'),
    cancellationReason: readApiField(race, 'cancellationReason'),
    lifecycleVersion: readApiField(race, 'lifecycleVersion'),
    registeredCount: readApiField(race, 'registeredCount') ?? 0,
    rowVersion: readApiField(race, 'rowVersion'),
});

async function getTournamentRaces(tournamentId) {
    const data = await apiRequest(`/admin/races/tournament/${tournamentId}`);
    return (Array.isArray(data) ? data : []).map(mapAdminRace);
}

async function createRace(tournamentId, payload) {
    return apiRequest(`/admin/races/tournament/${tournamentId}`, {
        method: 'POST',
        body: JSON.stringify(toRacePayload(payload)),
    });
}

async function updateRace(raceId, payload) {
    return apiRequest(`/admin/races/${raceId}`, {
        method: 'PUT',
        body: JSON.stringify({
            ...toRacePayload(payload),
            RowVersion: payload.rowVersion ?? payload.RowVersion ?? '',
        }),
    });
}

async function postponeRace(raceId, payload) {
    return apiRequest(`/admin/races/${raceId}/postpone`, {
        method: 'POST',
        body: JSON.stringify({
            NewRaceDate: payload.newRaceDate ?? payload.NewRaceDate ?? '',
            NewPredictionDeadline: payload.newPredictionDeadline ?? payload.NewPredictionDeadline ?? null,
            NewJockeySelectionDeadline: payload.newJockeySelectionDeadline ?? payload.NewJockeySelectionDeadline ?? null,
            Reason: payload.reason ?? payload.Reason ?? '',
        }),
    });
}

async function resumeRace(raceId) {
    return apiRequest(`/admin/races/${raceId}/resume`, { method: 'POST' });
}

async function cancelRace(raceId, reason) {
    return apiRequest(`/admin/races/${raceId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ Reason: reason }),
    });
}

async function getTournamentStandings(tournamentId) {
    return apiRequest(`/admin/tournaments/${tournamentId}/standings`);
}

async function recalculateTournamentStandings(tournamentId) {
    return apiRequest(`/admin/tournaments/${tournamentId}/standings/recalculate`, { method: 'POST' });
}

async function finalizeTournamentStandings(tournamentId, confirmationNote) {
    return apiRequest(`/admin/tournaments/${tournamentId}/standings/finalize`, {
        method: 'POST',
        body: JSON.stringify({ ConfirmationNote: confirmationNote }),
    });
}

const toSeasonPayload = (payload) => ({
    SeasonName: payload.seasonName ?? payload.SeasonName ?? '',
    StartDate: payload.startDate ?? payload.StartDate ?? '',
    EndDate: payload.endDate ?? payload.EndDate ?? '',
    PointsPerCorrectPrediction: Number(
        payload.pointsPerCorrectPrediction
        ?? payload.PointsPerCorrectPrediction
        ?? 100
    ),
});

const toRewardRulePayload = (rule) => ({
    RankPosition: Number(rule.rankPosition ?? rule.RankPosition ?? 0),
    RewardName: rule.rewardName ?? rule.RewardName ?? '',
    RewardDescription: rule.rewardDescription ?? rule.RewardDescription ?? '',
    BonusPoints: Number(rule.bonusPoints ?? rule.BonusPoints ?? 0),
    RewardItemId: rule.rewardItemId ? Number(rule.rewardItemId) : null,
    Quantity: Number(rule.quantity ?? rule.Quantity ?? 1),
});

async function getSeasons() {
    return apiRequest('/admin/seasons');
}

async function getSeasonById(id) {
    return apiRequest(`/admin/seasons/${id}`);
}

async function createSeason(payload) {
    return apiRequest('/admin/seasons', {
        method: 'POST',
        body: JSON.stringify(toSeasonPayload(payload)),
    });
}

async function updateSeason(id, payload) {
    return apiRequest(`/admin/seasons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(toSeasonPayload(payload)),
    });
}

async function deleteSeason(id) {
    return apiRequest(`/admin/seasons/${id}`, { method: 'DELETE' });
}

async function activateSeason(id) {
    return apiRequest(`/admin/seasons/${id}/activate`, { method: 'PUT' });
}

async function closeSeason(id) {
    return apiRequest(`/admin/seasons/${id}/close`, { method: 'PUT' });
}

async function cancelSeason(id) {
    return apiRequest(`/admin/seasons/${id}/cancel`, { method: 'PUT' });
}

async function getSeasonLeaderboard(id, limit = 100) {
    return apiRequest(`/admin/seasons/${id}/leaderboard?limit=${encodeURIComponent(limit)}`);
}

async function getSeasonRewardRules(id) {
    return apiRequest(`/admin/seasons/${id}/reward-rules`);
}

async function upsertSeasonRewardRules(id, rules) {
    return apiRequest(`/admin/seasons/${id}/reward-rules`, {
        method: 'PUT',
        body: JSON.stringify({
            Rules: (rules || []).map(toRewardRulePayload),
        }),
    });
}

async function getSeasonRewards(id) {
    return apiRequest(`/admin/seasons/${id}/rewards`);
}

async function updateSeasonRewardStatus(rewardId, payload) {
    return apiRequest(`/admin/seasons/rewards/${rewardId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
            Status: payload.status ?? payload.Status ?? '',
            AdminNote: payload.adminNote ?? payload.AdminNote ?? null,
        }),
    });
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
        outcomeStatus: result.outcomeStatus ?? result.OutcomeStatus ?? 'Finished',
        revisionNumber: result.revisionNumber ?? result.RevisionNumber,
        enteredByRefereeId: result.enteredByRefereeId,
        adminConfirmedBy: result.adminConfirmedBy,
        publishedAt: result.publishedAt,
        note: result.note,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        slug: `result-${result.resultId}`,
        race,
        raceName: race,
        tournamentId: result.tournamentId,
        tournamentName: result.tournamentName,
        name: race,
        detail: `Registration #${result.registrationId || '-'}`,
        tone: result.status === 'Draft' ? 'gold' : 'green',
        position: result.finishPosition ?? '-',
        horseId: result.horseId,
        horse: result.horseName || `Registration #${result.registrationId || '-'}`,
        jockey: result.jockeyName || '-',
        owner: result.ownerName || '-',
        finishTime: formatFinishTime(result.finishTimeSeconds),
        scoreTone: Number.isFinite(numericScore) && numericScore >= 80 ? 'green' : 'gold',
    };
};

const adminVisibleResultStatuses = new Set([
    'RefereeConfirmed',
    'AdminApproved',
    'Returned',
    'Published',
]);

const isAdminVisibleResult = (result) => adminVisibleResultStatuses.has(result?.status);

const getResultTimestamp = (result) => {
    const value = result?.submittedAt || result?.updatedAt || result?.createdAt;
    const timestamp = new Date(value || 0).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
};

const getLatestResult = (results) => [...results].sort((current, next) => (
    getResultTimestamp(next) - getResultTimestamp(current)
))[0];

const getResultSubmissionSlug = (raceId, refereeId) => (
    `submission-${raceId || 'race'}-${refereeId || 'referee'}`
);

const parseResultSubmissionSlug = (idOrSlug) => {
    const match = /^submission-(\d+)-(\d+)$/.exec(String(idOrSlug || ''));

    if (!match) {
        return null;
    }

    return {
        raceId: Number(match[1]),
        refereeId: Number(match[2]),
    };
};

const getResultSubmissionStatus = (results) => {
    const statuses = results.map((result) => result.status).filter(Boolean);

    if (statuses.includes('RefereeConfirmed')) return 'RefereeConfirmed';
    if (statuses.includes('Returned')) return 'Returned';
    if (statuses.length > 0 && statuses.every((status) => status === 'Published')) return 'Published';
    if (statuses.length > 0 && statuses.every((status) => status === 'AdminApproved' || status === 'Published')) return 'AdminApproved';

    return statuses[0] || 'Pending';
};

async function getResultSubmissions() {
    const [resultsPayload, registrationsPayload, reportsPayload] = await Promise.all([
        apiRequest('/admin/results').catch(() => []),
        getRegistrations().catch(() => []),
        getReports().catch(() => []),
    ]);
    const registrationContextById = new Map(
        (Array.isArray(registrationsPayload) ? registrationsPayload : [])
            .map(mapRegistrationRaceContext)
            .map((context) => [String(context.registrationId), context])
    );

    const groupedResults = new Map();
    (Array.isArray(resultsPayload) ? resultsPayload : [])
        .filter(isAdminVisibleResult)
        .map((result) => {
            const context = registrationContextById.get(String(result.registrationId)) || {};

            return mapRaceResult({
                ...result,
                raceName: context.tournamentName || context.raceName,
                tournamentId: context.tournamentId,
                tournamentName: context.tournamentName,
                horseId: context.horseId,
                horseName: context.horseName,
            });
        })
        .forEach((result) => {
            const key = `${result.raceId || 'race'}-${result.enteredByRefereeId || 'referee'}`;
            const current = groupedResults.get(key) || [];

            groupedResults.set(key, [...current, result]);
        });

    const resultSubmissions = [...groupedResults.values()].map((results) => {
        const sortedResults = sortRaceResults(results);
        const latestResult = getLatestResult(sortedResults) || sortedResults[0];
        const status = getResultSubmissionStatus(sortedResults);
        const slug = getResultSubmissionSlug(latestResult.raceId, latestResult.enteredByRefereeId);

        return {
            ...latestResult,
            id: slug,
            slug,
            resultIds: sortedResults.map((result) => result.resultId).filter(Boolean),
            resultCount: sortedResults.length,
            status,
            submittedAt: latestResult.updatedAt || latestResult.createdAt,
            updatedAt: latestResult.updatedAt,
            createdAt: latestResult.createdAt,
            detail: `${sortedResults.length} result${sortedResults.length === 1 ? '' : 's'} submitted`,
            position: `${sortedResults.length} entries`,
            tone: status === 'Returned' ? 'orange' : latestResult.tone,
            results: sortedResults,
        };
    });

    const existingSubmissionKeys = new Set(
        resultSubmissions.map((submission) => (
            `${Number(submission.raceId) || 0}-${Number(submission.enteredByRefereeId) || 0}`
        ))
    );

    /*
     * Keep final reports visible even when legacy/inconsistent data still has
     * Draft results. New BE validation prevents this state, but showing the
     * report here makes the problem visible to Admin instead of silently
     * returning an empty Validate Results page.
     */
    const reportOnlySubmissions = normalizeReports(reportsPayload)
        .filter((report) => getReportPhase(report) === 'PostRace')
        .filter((report) => ['Submitted', 'Returned', 'Approved'].includes(report.status))
        .filter((report) => {
            const key = `${Number(report.raceId) || 0}-${Number(report.refereeId) || 0}`;
            return !existingSubmissionKeys.has(key);
        })
        .map((report) => {
            const mappedReport = mapRefereeReport(report);
            const raceName = mappedReport.tournamentName
                || mappedReport.raceName
                || `Race #${mappedReport.raceId || '-'}`;

            return {
                ...mappedReport,
                id: mappedReport.id,
                slug: mappedReport.id,
                race: raceName,
                name: raceName,
                detail: 'Final report submitted; race results are not referee-confirmed yet',
                position: '0 confirmed results',
                tone: 'orange',
                resultIds: [],
                resultCount: 0,
                reportOnly: true,
                canDelete: false,
                enteredByRefereeId: mappedReport.refereeId,
                createdAt: mappedReport.submittedAt,
                updatedAt: mappedReport.submittedAt,
            };
        });

    return [...resultSubmissions, ...reportOnlySubmissions]
        .sort((current, next) => {
            const currentDate = new Date(current.submittedAt || current.updatedAt || current.createdAt || 0).getTime();
            const nextDate = new Date(next.submittedAt || next.updatedAt || next.createdAt || 0).getTime();

            return nextDate - currentDate;
        });
}

async function getPendingResults() {
    return apiRequest('/admin/results/pending');
}

async function getResultDetail(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    const result = await apiRequest(`/admin/results/${id}`);

    if (!isAdminVisibleResult(result)) {
        throw new Error('This result has not been submitted to admin yet.');
    }

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

const formatReportTypeLabel = (type) => {
    const labels = {
        RefereeReport: 'Referee Report',
        Violation: 'Violation Report',
    };

    return labels[type] || type || 'Referee Report';
};

const getReportPhase = (report) => {
    const rawPhase = String(report.reportType || report.ReportType || report.phase || report.Phase || '').trim();

    if (/^pre[-\s]?race$/i.test(rawPhase) || /^pre/i.test(rawPhase)) {
        return 'PreRace';
    }

    if (/^post[-\s]?race$/i.test(rawPhase) || /^post/i.test(rawPhase)) {
        return 'PostRace';
    }

    return 'PostRace';
};

const formatReportPhaseLabel = (phase) => {
    const labels = {
        PreRace: 'Pre-Race',
        PostRace: 'Post-Race',
    };

    return labels[phase] || phase || 'Post-Race';
};

const getAdminReportSlug = (report) => {
    if (report.type === 'Violation' || report.violationId) {
        return `violation-${report.violationId}`;
    }

    return `report-${report.reportId}`;
};

const parseAdminReportSlug = (idOrSlug) => {
    const value = String(idOrSlug || '');

    if (value.startsWith('report-')) {
        return { type: 'RefereeReport', id: value.replace('report-', '') };
    }

    if (value.startsWith('violation-')) {
        return { type: 'Violation', id: value.replace('violation-', '') };
    }

    return null;
};

const getDirectReportTournamentName = (report) => (
    report.tournamentName
    || report.TournamentName
    || report.race?.tournamentName
    || report.Race?.TournamentName
);

const getReportTournamentName = (report) => (
    getDirectReportTournamentName(report)
    || report.raceName
    || report.RaceName
);

const mapRegistrationRaceContext = (registration) => {
    if (!registration) {
        return {};
    }

    return {
        registrationId: readApiField(registration, 'registrationId'),
        raceId: readApiField(registration, 'raceId'),
        raceName: readApiField(registration, 'raceName'),
        tournamentId: readApiField(registration, 'tournamentId'),
        tournamentName: readApiField(registration, 'tournamentName'),
        horseId: readApiField(registration, 'horseId'),
        horseName: readApiField(registration, 'horseName'),
        registrationStatus: readApiField(registration, 'status'),
        jockeyId: readApiField(registration, 'jockeyId'),
        jockeyName: readApiField(registration, 'jockeyName'),
    };
};

async function getRaceContextForReport({ registrationId, raceId } = {}) {
    if (registrationId) {
        try {
            return mapRegistrationRaceContext(await getRegistrationById(registrationId));
        } catch {
            // Fall through to race lookup below.
        }
    }

    if (raceId) {
        try {
            const registrations = await getRegistrations();
            const registration = (Array.isArray(registrations) ? registrations : [])
                .find((item) => Number(readApiField(item, 'raceId')) === Number(raceId));

            return mapRegistrationRaceContext(registration);
        } catch {
            return {};
        }
    }

    return {};
}

async function getRaceRegistrationContextMap(raceId) {
    try {
        const registrations = await getRegistrations();
        const contexts = (Array.isArray(registrations) ? registrations : [])
            .filter((registration) => Number(readApiField(registration, 'raceId')) === Number(raceId))
            .map(mapRegistrationRaceContext);

        return new Map(contexts.map((context) => [String(context.registrationId), context]));
    } catch {
        return new Map();
    }
}

const mergeReportContext = (report, context = {}) => ({
    ...report,
    registrationId: report.registrationId || context.registrationId,
    raceId: report.raceId || context.raceId,
    raceName: report.raceName || context.raceName,
    tournamentId: report.tournamentId || context.tournamentId,
    tournamentName: getDirectReportTournamentName(report) || context.tournamentName || report.raceName || report.RaceName,
    horseId: report.horseId || context.horseId,
    horseName: report.horseName || context.horseName,
    registrationStatus: report.registrationStatus || context.registrationStatus,
    jockeyId: report.jockeyId || context.jockeyId,
    jockeyName: report.jockeyName || context.jockeyName,
});

const mapRefereeReport = (report) => ({
    id: getAdminReportSlug(report),
    reportId: report.reportId,
    violationId: report.violationId,
    sourceType: report.type || (report.violationId ? 'Violation' : 'RefereeReport'),
    reportPhase: getReportPhase(report),
    status: report.status,
    revisionNumber: report.revisionNumber,
    returnReasonCategory: report.returnReasonCategory,
    returnReason: report.returnReason,
    canApprove: Boolean(report.canApprove),
    canReturn: Boolean(report.canReturn),
    raceId: report.raceId,
    tournamentName: getReportTournamentName(report),
    raceName: report.raceName,
    registrationId: report.registrationId,
    registrationStatus: report.registrationStatus,
    horseId: report.horseId,
    horseName: report.horseName,
    jockeyId: report.jockeyId,
    jockeyName: report.jockeyName,
    refereeId: report.refereeId,
    refereeName: report.refereeName,
    title: `${formatReportPhaseLabel(getReportPhase(report))} ${formatReportTypeLabel(report.type || (report.violationId ? 'Violation' : 'RefereeReport'))} #${report.reportId || report.violationId || '-'}`,
    content: report.reportContent || report.description || report.note || 'No report content provided.',
    description: report.description,
    submittedAt: report.submittedAt || report.createdAt,
    violationType: report.violationType,
    action: report.action,
    penaltyPoints: report.penaltyPoints,
});

const splitWorkflowReports = (reports) => ({
    preRace: reports.filter((report) => report.reportPhase === 'PreRace'),
    postRace: reports.filter((report) => report.reportPhase !== 'PreRace'),
});

const sortRaceResults = (results) => [...results].sort((current, next) => {
    const currentPosition = Number(current.finishPosition);
    const nextPosition = Number(next.finishPosition);

    if (Number.isFinite(currentPosition) && Number.isFinite(nextPosition)) {
        return currentPosition - nextPosition;
    }

    if (Number.isFinite(currentPosition)) {
        return -1;
    }

    if (Number.isFinite(nextPosition)) {
        return 1;
    }

    return String(current.horse || '').localeCompare(String(next.horse || ''));
});

async function getRaceWorkflowData(raceId, { refereeId, fallbackReports = [] } = {}) {
    const [reportsPayload, resultsPayload, contextMap] = await Promise.all([
        getReports().catch(() => []),
        apiRequest('/admin/results').catch(() => []),
        getRaceRegistrationContextMap(raceId),
    ]);
    const firstContext = contextMap.values().next().value || {};
    const reportRows = normalizeReports(reportsPayload)
        .filter((report) => Number(report.raceId) === Number(raceId))
        .filter((report) => !refereeId || !report.refereeId || Number(report.refereeId) === Number(refereeId));
    const fallbackRows = fallbackReports.filter((report) => (
        Number(report.raceId) === Number(raceId)
        && !reportRows.some((item) => getAdminReportSlug(item) === getAdminReportSlug(report))
    ));
    const reports = [...reportRows, ...fallbackRows]
        .map((report) => mapRefereeReport(mergeReportContext(
            report,
            contextMap.get(String(report.registrationId)) || firstContext
        )));
    const results = (Array.isArray(resultsPayload) ? resultsPayload : [])
        .filter((result) => Number(result.raceId) === Number(raceId))
        .filter((result) => !refereeId || !result.enteredByRefereeId || Number(result.enteredByRefereeId) === Number(refereeId))
        .filter(isAdminVisibleResult)
        .map((result) => {
            const context = contextMap.get(String(result.registrationId)) || firstContext;

            return mapRaceResult({
                ...result,
                raceName: context.raceName,
                tournamentId: context.tournamentId,
                tournamentName: context.tournamentName,
                horseId: context.horseId,
                horseName: context.horseName,
            });
        });
    const splitReports = splitWorkflowReports(reports);

    return {
        raceContext: firstContext,
        reports,
        results: sortRaceResults(results),
        preRaceReports: splitReports.preRace,
        postRaceReports: splitReports.postRace,
    };
}

async function getStandaloneReportDetail(idOrSlug) {
    const parsedReport = parseAdminReportSlug(idOrSlug);

    if (!parsedReport) {
        return null;
    }

    const reports = normalizeReports(await getReports());
    const report = reports.find((item) => {
        if (parsedReport.type === 'Violation') {
            return Number(item.violationId) === Number(parsedReport.id);
        }

        return Number(item.reportId) === Number(parsedReport.id);
    });

    if (!report) {
        throw new Error('Report not found.');
    }

    const reportContext = await getRaceContextForReport({
        registrationId: report.registrationId,
        raceId: report.raceId,
    });
    const mergedReport = mergeReportContext(report, reportContext);
    const mappedReport = mapRefereeReport(mergedReport);
    const reportType = report.type || (report.violationId ? 'Violation' : 'RefereeReport');
    const tournamentName = getReportTournamentName(mergedReport);
    const workflow = await getRaceWorkflowData(mergedReport.raceId, {
        refereeId: report.refereeId,
        fallbackReports: [mergedReport],
    });

    return {
        detailType: 'admin-report',
        reportId: report.reportId,
        violationId: report.violationId,
        raceId: mergedReport.raceId,
        tournamentId: mergedReport.tournamentId,
        tournamentName,
        raceName: mergedReport.raceName || `Race #${mergedReport.raceId || '-'}`,
        registrationId: mergedReport.registrationId,
        horseId: mergedReport.horseId,
        horseName: mergedReport.horseName,
        refereeId: report.refereeId,
        refereeName: report.refereeName,
        status: report.action || formatReportTypeLabel(reportType),
        submittedAt: report.submittedAt || report.createdAt,
        sourceType: reportType,
        reports: workflow.reports.length > 0 ? workflow.reports : [mappedReport],
        preRace: {
            reports: workflow.preRaceReports,
        },
        postRace: {
            results: workflow.results,
            reports: workflow.postRaceReports,
        },
        reportError: '',
    };
}

async function getGroupedResultReportDetail(idOrSlug) {
    const parsedSubmission = parseResultSubmissionSlug(idOrSlug);

    if (!parsedSubmission) {
        return null;
    }

    const workflow = await getRaceWorkflowData(parsedSubmission.raceId, {
        refereeId: parsedSubmission.refereeId,
    });
    const results = workflow.results;

    if (results.length === 0) {
        throw new Error('This result has not been submitted to admin yet.');
    }

    const firstResult = results[0];
    const latestResult = getLatestResult(results) || firstResult;
    const raceContext = workflow.raceContext || {};
    const workflowReports = workflow.reports;
    const splitReports = splitWorkflowReports(workflowReports);
    const raceName = raceContext.raceName || firstResult.raceName || firstResult.race;
    const tournamentName = raceContext.tournamentName || firstResult.tournamentName || firstResult.race;

    return {
        detailType: 'result-submission',
        resultId: firstResult.resultId,
        resultIds: results.map((result) => result.resultId).filter(Boolean),
        raceId: parsedSubmission.raceId,
        raceName,
        tournamentId: raceContext.tournamentId || firstResult.tournamentId,
        tournamentName,
        registrationId: firstResult.registrationId,
        refereeId: parsedSubmission.refereeId,
        status: getResultSubmissionStatus(results),
        submittedAt: latestResult.updatedAt || latestResult.createdAt,
        reports: workflowReports,
        preRace: {
            reports: splitReports.preRace,
        },
        postRace: {
            results,
            reports: splitReports.postRace,
        },
        reportError: '',
    };
}

async function getResultReportDetail(idOrSlug) {
    const standaloneReport = await getStandaloneReportDetail(idOrSlug);

    if (standaloneReport) {
        return standaloneReport;
    }

    const groupedSubmission = await getGroupedResultReportDetail(idOrSlug);

    if (groupedSubmission) {
        return groupedSubmission;
    }

    const id = String(idOrSlug).replace('result-', '');
    const result = await apiRequest(`/admin/results/${id}`);

    if (!isAdminVisibleResult(result)) {
        throw new Error('This result has not been submitted to admin yet.');
    }

    const mappedResult = mapRaceResult(result);
    const raceContext = await getRaceContextForReport({
        registrationId: result.registrationId,
        raceId: result.raceId,
    });
    const raceName = raceContext.raceName || mappedResult.race;
    const tournamentName = raceContext.tournamentName || mappedResult.tournamentName || mappedResult.race;
    const workflow = await getRaceWorkflowData(result.raceId, {
        refereeId: result.enteredByRefereeId,
    });
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
            .map((report) => mapRefereeReport(mergeReportContext(report, raceContext)));
    } catch (error) {
        reportError = error.message || 'Failed to load referee report.';
    }

    if (reports.length === 0 && result.note) {
        reports = [{
            id: `result-note-${result.resultId}`,
            raceId: result.raceId,
            raceName,
            tournamentId: raceContext.tournamentId,
            tournamentName,
            registrationId: result.registrationId,
            horseId: raceContext.horseId,
            horseName: raceContext.horseName,
            refereeId: result.enteredByRefereeId,
            sourceType: 'RefereeReport',
            reportPhase: 'PostRace',
            title: 'Result Note',
            content: result.note,
            submittedAt: result.updatedAt || result.createdAt,
        }];
    }
    const workflowReports = reports.length > 0 ? reports : workflow.reports;
    const splitReports = splitWorkflowReports(workflowReports);
    const resultContext = raceContext || {};
    const fallbackResult = mapRaceResult({
        ...result,
        raceName,
        tournamentId: resultContext.tournamentId,
        tournamentName,
        horseId: resultContext.horseId,
        horseName: resultContext.horseName,
    });

    return {
        resultId: result.resultId,
        raceId: result.raceId,
        raceName,
        tournamentId: raceContext.tournamentId,
        tournamentName,
        registrationId: result.registrationId,
        refereeId: result.enteredByRefereeId,
        status: result.status,
        submittedAt: result.updatedAt || result.createdAt,
        reports: workflowReports,
        preRace: {
            reports: splitReports.preRace,
        },
        postRace: {
            results: workflow.results.length > 0 ? workflow.results : [fallbackResult],
            reports: splitReports.postRace,
        },
        reportError,
    };
}

async function publishResult(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    return apiRequest(`/admin/results/${id}/approve`, { method: 'PUT' });
}

async function approveAllResults(raceId) {
    return apiRequest(`/admin/results/race/${raceId}/approve-all`, { method: 'PUT' });
}

async function publishRaceResults(raceId) {
    return approveAllResults(raceId);
}

async function reopenPublishedRaceResults(raceId, reason) {
    return apiRequest(`/admin/results/corrections/race/${raceId}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ Reason: reason }),
    });
}

async function rejectResult(id, reason = '') {
    return apiRequest(`/admin/results/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({
            Reason: String(reason || '').trim() || null,
        }),
    });
}

async function approveRefereeReport(reportId) {
    return apiRequest(`/admin/reports/${reportId}/approve`, { method: 'PUT' });
}

async function returnRefereeReport(reportId, reason, reasonCategory = 'Other') {
    return apiRequest(`/admin/reports/${reportId}/return`, {
        method: 'PUT',
        body: JSON.stringify({
            ReasonCategory: reasonCategory,
            Reason: String(reason || '').trim(),
        }),
    });
}

async function deleteResult(idOrSlug) {
    const id = String(idOrSlug).replace('result-', '');
    return apiRequest(`/admin/results/${id}`, { method: 'DELETE' });
}

async function getAdminRewards(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/admin/rewards${query}`);
}

async function getRewardInventory() {
    return apiRequest('/admin/reward-inventory');
}

async function createRewardInventoryItem(payload) {
    return apiRequest('/admin/reward-inventory', {
        method: 'POST',
        body: JSON.stringify({
            Name: payload.name ?? payload.Name ?? '',
            Sku: payload.sku ?? payload.Sku ?? '',
            Description: payload.description ?? payload.Description ?? null,
            ImageUrl: payload.imageUrl ?? payload.ImageUrl ?? null,
            InitialStock: Number(payload.initialStock ?? payload.InitialStock ?? 0),
        }),
    });
}

async function adjustRewardInventory(id, payload) {
    return apiRequest(`/admin/reward-inventory/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({
            QuantityDelta: Number(payload.quantityDelta ?? payload.QuantityDelta ?? 0),
            Note: payload.note ?? payload.Note ?? '',
        }),
    });
}

async function setRewardInventoryActive(id, value) {
    return apiRequest(`/admin/reward-inventory/${id}/active?value=${encodeURIComponent(Boolean(value))}`, {
        method: 'PUT',
    });
}

async function expireOverdueRewards() {
    return apiRequest('/admin/reward-inventory/expire-overdue', { method: 'POST' });
}

async function approveRewardPayment(id) {
    return apiRequest(`/admin/rewards/${id}/approve-payment`, { method: 'PUT' });
}

async function rejectRewardPayment(id) {
    return apiRequest(`/admin/rewards/${id}/reject`, { method: 'PUT' });
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
    const parsedReport = parseAdminReportSlug(id);

    if (parsedReport && parsedReport.type !== 'Violation') {
        throw new Error('Only violation reports can be resolved.');
    }

    const violationId = parsedReport?.id ?? String(id).replace('violation-', '');

    return apiRequest(`/admin/reports/${violationId}/resolve`, { method: 'PUT' });
}

async function rejectReport(id) {
    const parsedReport = parseAdminReportSlug(id);

    if (parsedReport && parsedReport.type !== 'Violation') {
        throw new Error('Only violation reports can be rejected.');
    }

    const violationId = parsedReport?.id ?? String(id).replace('violation-', '');

    return apiRequest(`/admin/reports/${violationId}/reject`, { method: 'PUT' });
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

// ─── Notifications ────────────────────────────────────────────────────────────

function formatNotificationTime(createdAt) {
    if (!createdAt) return '';
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function deriveNotificationTone(actionType, relatedType) {
    const s = `${actionType || ''} ${relatedType || ''}`.toLowerCase();
    if (s.includes('prediction')) return 'prediction';
    if (s.includes('report') || s.includes('violation')) return 'urgent';
    if (s.includes('race') || s.includes('result') || s.includes('tournament')) return 'race';
    return 'registration';
}

function deriveNotificationType(actionType, relatedType) {
    const s = `${actionType || ''} ${relatedType || ''}`.toLowerCase();
    if (s.includes('prediction')) return 'prediction';
    if (s.includes('report') || s.includes('violation')) return 'report';
    if (s.includes('race') || s.includes('result') || s.includes('tournament')) return 'race-result';
    return 'registration';
}

async function getNotifications() {
    const data = await apiRequest('/admin/notifications');
    return (Array.isArray(data) ? data : []).map((n) => ({
        id: n.notificationId,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        time: formatNotificationTime(n.createdAt),
        actionUrl: n.actionUrl,
        relatedType: n.relatedType,
        relatedId: n.relatedId,
        actionType: n.actionType,
        tone: deriveNotificationTone(n.actionType, n.relatedType),
        type: deriveNotificationType(n.actionType, n.relatedType),
        priority: 'medium-priority',
        status: n.isRead ? 'Read' : 'Pending',
    }));
}

async function getAdminUnreadCount() {
    const data = await apiRequest('/admin/notifications/unread-count');
    return data?.unreadCount ?? 0;
}

async function markNotificationRead(id) {
    return apiRequest(`/admin/notifications/${id}/read`, { method: 'PUT' });
}

async function markAllNotificationsRead() {
    return apiRequest('/admin/notifications/read-all', { method: 'PUT' });
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

async function evaluateRacePredictions(raceId) {
    return apiRequest(`/admin/predictions/races/${raceId}/evaluate`, {
        method: 'POST',
    });
}

// ─── Horse Reports (mapped to BE reports/violations) ─────────────────────────

async function closeHorseReport(id) {
    return resolveReport(id);
}

async function deleteHorseReport(id) {
    const value = String(id || '');
    const slug = parseAdminReportSlug(value) ? value : `violation-${value.replace('violation-', '')}`;

    return apiRequest(`/admin/reports/${slug}`, { method: 'DELETE' });
}

async function getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });
    const query = params.toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ''}`);
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
    approveTournament,
    closeTournamentRegistration,
    cancelTournament,
    updateTournament,
    deleteTournament,
    restoreTournament,
    getTournamentReferees,
    assignTournamentReferee,
    getTournamentRaces,
    createRace,
    updateRace,
    postponeRace,
    resumeRace,
    cancelRace,
    getTournamentStandings,
    recalculateTournamentStandings,
    finalizeTournamentStandings,

    // Seasons
    getSeasons,
    getSeasonById,
    createSeason,
    updateSeason,
    deleteSeason,
    activateSeason,
    closeSeason,
    cancelSeason,
    getSeasonLeaderboard,
    getSeasonRewardRules,
    upsertSeasonRewardRules,
    getSeasonRewards,
    updateSeasonRewardStatus,

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
    approveAllResults,
    publishRaceResults,
    reopenPublishedRaceResults,
    rejectResult,
    approveRefereeReport,
    returnRefereeReport,
    deleteResult,

    // Rewards
    getAdminRewards,
    getRewardInventory,
    createRewardInventoryItem,
    adjustRewardInventory,
    setRewardInventoryActive,
    expireOverdueRewards,
    approveRewardPayment,
    rejectRewardPayment,

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
    getAdminUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,

    // Predictions
    getPredictions,
    updatePredictionStatus,
    evaluateRacePredictions,

    // Horse reports
    closeHorseReport,
    deleteHorseReport,

    // Audit logs
    getAuditLogs,
};
