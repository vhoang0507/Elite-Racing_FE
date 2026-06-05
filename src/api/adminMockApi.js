import {
    adminBaseTotals,
    adminSeedData,
} from '../data/adminMockData';

const STORAGE_KEY = 'elite-racing-admin-mock-v2';
const MOCK_DELAY = 180;

const clone = (value) => JSON.parse(JSON.stringify(value));

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readStore = () => {
    if (!canUseStorage()) {
        return clone(adminSeedData);
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        const seeded = clone(adminSeedData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }

    try {
        return {
            ...clone(adminSeedData),
            ...JSON.parse(saved),
        };
    } catch {
        const seeded = clone(adminSeedData);
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

const countByStatus = (items, status) => items.filter((item) => item.status === status).length;

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
    const pendingUsers = store.users.filter((user) => user.status === 'Pending');
    const pendingHorses = store.horses.filter((horse) => horse.approval === 'Pending');
    const openReports = store.horseReports.filter((report) => report.status === 'Open');

    return {
        stats: [
            {
                label: 'Total Users',
                value: (adminBaseTotals.users + store.users.length).toLocaleString('en-US'),
                trend: `${pendingUsers.length} pending`,
                tone: 'users',
            },
            {
                label: 'Active Tournaments',
                value: String(countByStatus(store.tournaments, 'Active')),
                trend: `${countByStatus(store.tournaments, 'Draft')} drafts`,
                tone: 'tournaments',
            },
            {
                label: 'Pending Registrations',
                value: String(pendingUsers.length + pendingHorses.length),
                trend: `${pendingHorses.length} horses`,
                tone: 'registrations',
            },
            {
                label: 'Pending Results',
                value: String(store.resultSubmissions.filter((submission) => submission.status !== 'Published').length),
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

    createTournament: async (payload, status = 'Active') => updateStore((store) => ({
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
                status,
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
                    status,
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
                    status,
                    verified: status === 'Active',
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
                    approval,
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
                    status: 'Closed',
                }
                : report
        )),
        horses: store.horses.map((horse) => (
            horse.id === store.horseReports.find((report) => report.id === id)?.horseId
                ? {
                    ...horse,
                    reportStatus: 'Closed',
                    healthStatus: 'Cleared',
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
                    status,
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
                    status: 'Published',
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
                    status: 'Admin Approved',
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
                    status: 'Read',
                }
                : notification
        )),
    })),
};

export const adminMockTotals = adminBaseTotals;
