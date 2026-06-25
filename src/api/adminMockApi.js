import { adminSeedData } from '../data/adminMockData';

const STORAGE_KEY = 'elite-racing-admin-mock-v2';
const MOCK_DELAY = 180;

const clone = (value) => JSON.parse(JSON.stringify(value));

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const mapStatus = (value, statusMap, fallback = 'Pending') => statusMap[normalizeStatus(value)] || fallback;

const tournamentStatusMap = {
    pending: 'Draft',
    draft: 'Draft',
    active: 'OpenRegistration',
    open: 'OpenRegistration',
    'open registration': 'OpenRegistration',
    openregistration: 'OpenRegistration',
    closed: 'ClosedRegistration',
    'closed registration': 'ClosedRegistration',
    closedregistration: 'ClosedRegistration',
    ongoing: 'Ongoing',
    inactive: 'Completed',
    completed: 'Completed',
    banned: 'Cancelled',
    cancelled: 'Cancelled',
};

const userStatusMap = {
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    banned: 'Banned',
    suspended: 'Banned',
};

const reportStatusMap = {
    pending: 'Pending',
    open: 'Pending',
    active: 'Active',
    closed: 'Active',
    inactive: 'Inactive',
    banned: 'Banned',
};

const predictionStatusMap = {
    pending: 'Pending',
    draft: 'Pending',
    active: 'Active',
    publish: 'Active',
    published: 'Active',
    inactive: 'Inactive',
    disabled: 'Inactive',
    banned: 'Banned',
};

const resultStatusMap = {
    pending: 'Pending',
    draft: 'Pending',
    'referee confirmed': 'Pending',
    active: 'Active',
    'admin approved': 'Active',
    published: 'Active',
    inactive: 'Inactive',
    returned: 'Inactive',
    banned: 'Banned',
};

const notificationStatusMap = {
    pending: 'Pending',
    unread: 'Pending',
    active: 'Active',
    read: 'Active',
    inactive: 'Inactive',
    banned: 'Banned',
};

const horseApprovalStatusMap = {
    pending: 'Pending',
    active: 'Active',
    approved: 'Active',
    inactive: 'Inactive',
    banned: 'Banned',
    rejected: 'Banned',
};

const horseHealthStatusMap = {
    pending: 'Pending',
    'needs review': 'Pending',
    active: 'Active',
    cleared: 'Active',
    inactive: 'Inactive',
    banned: 'Banned',
};

const migrateAdminStatuses = (store) => ({
    ...store,
    tournaments: store.tournaments.map((tournament) => ({
        ...tournament,
        status: mapStatus(tournament.status, tournamentStatusMap),
    })),
    users: store.users.map((user) => ({
        ...user,
        status: mapStatus(user.status, userStatusMap),
    })),
    horses: store.horses.map((horse) => ({
        ...horse,
        approval: mapStatus(horse.approval, horseApprovalStatusMap),
        healthStatus: mapStatus(horse.healthStatus, horseHealthStatusMap),
        reportStatus: mapStatus(horse.reportStatus, reportStatusMap),
    })),
    horseReports: store.horseReports.map((report) => ({
        ...report,
        status: mapStatus(report.status, reportStatusMap),
    })),
    predictions: store.predictions.map((prediction) => ({
        ...prediction,
        status: mapStatus(prediction.status, predictionStatusMap),
    })),
    resultSubmissions: store.resultSubmissions.map((submission) => ({
        ...submission,
        status: mapStatus(submission.status, resultStatusMap),
    })),
    raceResultDetails: Object.fromEntries(Object.entries(store.raceResultDetails).map(([slug, detail]) => [
        slug,
        {
            ...detail,
            results: detail.results.map((result) => ({
                ...result,
                status: mapStatus(result.status, resultStatusMap),
            })),
        },
    ])),
    notifications: store.notifications.map((notification) => ({
        ...notification,
        status: mapStatus(notification.status, notificationStatusMap),
    })),
});

const readStore = () => {
    if (!canUseStorage()) {
        return migrateAdminStatuses(clone(adminSeedData));
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        const seeded = migrateAdminStatuses(clone(adminSeedData));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }

    try {
        const store = {
            ...clone(adminSeedData),
            ...JSON.parse(saved),
        };
        const migratedStore = migrateAdminStatuses(store);

        writeStore(migratedStore);
        return migratedStore;
    } catch {
        const seeded = migrateAdminStatuses(clone(adminSeedData));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
};

const writeStore = (store) => {
    if (canUseStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
};

const wait = (value) => new Promise((resolve) => {
    setTimeout(() => resolve(clone(value)), MOCK_DELAY);
});

const updateStore = async (updater) => {
    const store = readStore();
    const nextStore = updater(store);
    writeStore(nextStore);
    return wait(nextStore);
};

const countByStatus = (items, status) => items.filter((item) => normalizeStatus(item.status) === normalizeStatus(status)).length;

const countByApproval = (items, approval) => items.filter((item) => normalizeStatus(item.approval) === normalizeStatus(approval)).length;

const isPendingResult = (submission) => normalizeStatus(submission.status) === 'pending';

const toMoney = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

const toDateLabel = (dateValue) => new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
}).format(new Date(`${dateValue}T00:00:00`));

const toShortDateParts = (startDate, endDate) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const startLabel = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
    }).format(start);
    const endMonth = new Intl.DateTimeFormat('en-US', {
        month: 'short',
    }).format(end);
    const endDay = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
    }).format(end);

    return [`${startLabel} - ${endDay}`, endMonth, String(end.getFullYear())];
};

const createDashboard = (store) => {
    const pendingUsers = store.users.filter((user) => normalizeStatus(user.status) === 'pending');
    const pendingHorses = store.horses.filter((horse) => normalizeStatus(horse.approval) === 'pending');
    const openReports = store.horseReports.filter((report) => normalizeStatus(report.status) === 'open');
    const pendingResults = store.resultSubmissions.filter(isPendingResult);

    return {
        stats: [
            {
                label: 'Total Users',
                value: store.users.length.toLocaleString('en-US'),
                trend: `${pendingUsers.length} pending`,
                tone: 'users',
            },
            {
                label: 'Active Tournaments',
                value: String(countByStatus(store.tournaments, 'Active')),
                trend: `${countByStatus(store.tournaments, 'Pending')} pending`,
                tone: 'tournaments',
            },
            {
                label: 'Pending Registrations',
                value: String(countByApproval(store.horses, 'Pending')),
                trend: `${pendingHorses.length} horses`,
                tone: 'registrations',
            },
            {
                label: 'Pending Results',
                value: String(pendingResults.length),
                trend: `${openReports.length} disputed`,
                tone: 'results',
            },
        ],
        tournaments: store.tournaments.slice(0, 5),
        approvals: [
            ...pendingUsers.map((user) => ({
                id: user.id,
                name: user.name,
                role: user.role,
                request: 'Account verification',
                progress: 42,
                avatar: user.avatar,
                source: 'user',
            })),
            ...pendingHorses.map((horse) => ({
                id: horse.id,
                name: horse.name,
                role: horse.breed,
                request: 'New horse registration',
                progress: 72,
                avatar: horse.name.split(' ').map((part) => part[0]).join('').slice(0, 2),
                source: 'horse',
            })),
        ],
        users: store.users.slice(0, 6),
    };
};

const createId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export const adminMockApi = {
    formatters: {
        toDateLabel,
        toMoney,
        toShortDateParts,
    },

    getDashboard: async () => wait(createDashboard(readStore())),

    getTournaments: async () => wait(readStore().tournaments),

    createTournament: async (payload, status = 'Draft') => updateStore((store) => ({
        ...store,
        tournaments: [
            {
                id: createId('TRN'),
                name: payload.name || 'Untitled Tournament',
                className: payload.className || payload.breed || 'Open Class',
                startDate: payload.startDate || new Date().toISOString().slice(0, 10),
                endDate: payload.endDate || payload.startDate || new Date().toISOString().slice(0, 10),
                location: payload.location || 'Unassigned Track',
                city: payload.city || payload.location || 'TBA',
                maxHorses: Number(payload.maxHorses || 20),
                registeredHorses: 0,
                prizePool: Number(payload.goldPrize || 0) + Number(payload.silverPrize || 0) + Number(payload.bronzePrize || 0),
                status: mapStatus(status, tournamentStatusMap, 'Draft'),
                imagePosition: '50% center',
                createdAt: new Date().toISOString().slice(0, 10),
            },
            ...store.tournaments,
        ],
    })),

    updateTournamentStatus: async (id, status) => updateStore((store) => ({
        ...store,
        tournaments: store.tournaments.map((tournament) => (
            tournament.id === id
                ? {
                    ...tournament,
                    status: mapStatus(status, tournamentStatusMap, tournament.status),
                }
                : tournament
        )),
    })),

    deleteTournament: async (id) => updateStore((store) => ({
        ...store,
        tournaments: store.tournaments.filter((tournament) => tournament.id !== id),
    })),

    updateTournament: async (id, patch) => updateStore((store) => ({
        ...store,
        tournaments: store.tournaments.map((tournament) => (
            tournament.id === id
                ? {
                    ...tournament,
                    ...patch,
                    status: patch.status ? mapStatus(patch.status, tournamentStatusMap, tournament.status) : tournament.status,
                }
                : tournament
        )),
    })),

    getUsers: async () => wait(readStore().users),

    updateUserStatus: async (id, status) => updateStore((store) => ({
        ...store,
        users: store.users.map((user) => (
            user.id === id
                ? {
                    ...user,
                    status: mapStatus(status, userStatusMap),
                    verified: normalizeStatus(status) === 'active',
                }
                : user
        )),
    })),

    getHorses: async () => {
        const store = readStore();
        return wait({
            horses: store.horses,
            reports: store.horseReports,
        });
    },

    updateHorseApproval: async (id, approval) => updateStore((store) => ({
        ...store,
        horses: store.horses.map((horse) => (
            horse.id === id
                ? {
                    ...horse,
                    approval: mapStatus(approval, horseApprovalStatusMap),
                }
                : horse
        )),
    })),

    closeHorseReport: async (id) => updateStore((store) => ({
        ...store,
        horseReports: store.horseReports.map((report) => (
            report.id === id
                ? {
                    ...report,
                    status: 'Active',
                }
                : report
        )),
        horses: store.horses.map((horse) => (
            horse.id === store.horseReports.find((report) => report.id === id)?.horseId
                ? {
                    ...horse,
                    reportStatus: 'Active',
                    healthStatus: 'Active',
                }
                : horse
        )),
    })),

    deleteHorseReport: async (id) => updateStore((store) => ({
        ...store,
        horseReports: store.horseReports.filter((report) => report.id !== id),
    })),

    getPredictions: async () => wait(readStore().predictions),

    updatePredictionStatus: async (id, status) => updateStore((store) => ({
        ...store,
        predictions: store.predictions.map((prediction) => (
            prediction.id === id
                ? {
                    ...prediction,
                    status: mapStatus(status, predictionStatusMap),
                }
                : prediction
        )),
    })),

    getResultSubmissions: async () => wait(readStore().resultSubmissions),

    getResultDetail: async (slug) => {
        const store = readStore();
        return wait(store.raceResultDetails[slug] || store.raceResultDetails['dubai-sprint-cup']);
    },

    publishResult: async (slug) => updateStore((store) => ({
        ...store,
        resultSubmissions: store.resultSubmissions.map((submission) => (
            submission.slug === slug
                ? {
                    ...submission,
                    status: 'Active',
                    tone: 'red',
                }
                : submission
        )),
        raceResultDetails: {
            ...store.raceResultDetails,
            [slug]: {
                ...store.raceResultDetails[slug],
                results: store.raceResultDetails[slug].results.map((result) => ({
                    ...result,
                    status: 'Active',
                })),
            },
        },
    })),

    getNotifications: async () => wait(readStore().notifications),

    markNotificationRead: async (id) => updateStore((store) => ({
        ...store,
        notifications: store.notifications.map((notification) => (
            notification.id === id
                ? {
                    ...notification,
                    status: 'Active',
                }
                : notification
        )),
    })),
};
