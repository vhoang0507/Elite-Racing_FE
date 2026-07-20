import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaCalendarAlt,
    FaCheck,
    FaEdit,
    FaEye,
    FaPlus,
    FaSyncAlt,
    FaTimes,
    FaTrashAlt,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import {
    confirmAdminAction,
    showAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]';
const panelHeaderClass = 'flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.68rem] font-black uppercase text-[#64748b]';
const controlClass = 'h-10 w-full rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.86rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
const actionButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[0.78rem] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const minDate = '2000-01-01';
const maxDate = '2100-12-31';
const maxPredictionPoints = 1000000;
const maxRewardRules = 100;
const maxRewardBonusPoints = 1000000;
const maxSeasonDurationDays = 3660;

const emptySeasonForm = {
    seasonName: '',
    startDate: '',
    endDate: '',
    pointsPerCorrectPrediction: 100,
};

const defaultRewardRules = [
    { rankPosition: 1, rewardName: 'Champion Bonus', rewardDescription: '', bonusPoints: 300, rewardItemId: '', quantity: 1 },
    { rankPosition: 2, rewardName: 'Runner-up Bonus', rewardDescription: '', bonusPoints: 200, rewardItemId: '', quantity: 1 },
    { rankPosition: 3, rewardName: 'Third Place Bonus', rewardDescription: '', bonusPoints: 100, rewardItemId: '', quantity: 1 },
];

const statusClass = {
    Draft: 'bg-[#f3f4f6] text-[#374151]',
    Active: 'bg-[#e8f7ee] text-[#16864f]',
    Closed: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    Cancelled: 'bg-[#f3e1df] text-[#a4392f]',
};

const rewardStatusTransitions = {
    Claimed: ['Approved', 'Rejected'],
    Approved: ['Preparing', 'Rejected'],
    Preparing: ['Delivered', 'Rejected'],
};

function readSeasonField(season, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return season?.[key] ?? season?.[pascalKey];
}

function getSeasonId(season) {
    return readSeasonField(season, 'seasonId');
}

function getCreatedSeasonId(payload) {
    return getSeasonId(payload)
        ?? getSeasonId(readSeasonField(payload, 'season'))
        ?? getSeasonId(readSeasonField(payload, 'data'));
}

function getSeasonLockKey(season) {
    const id = getSeasonId(season);

    return id === undefined || id === null ? '' : String(id);
}

function toDateOnly(value) {
    return value ? String(value).split('T')[0] : '';
}

function formatDate(value) {
    const date = toDateOnly(value);

    if (!date) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
}

function isDateYearInRange(dateValue) {
    const year = Number(String(dateValue || '').slice(0, 4));

    return Number.isInteger(year) && year >= 2000 && year <= 2100;
}

function getTodayDateValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function addDaysToDateValue(dateValue, days) {
    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    date.setDate(date.getDate() + days);

    return getTodayDateValue(date);
}

function getLaterDateValue(firstDate, secondDate) {
    if (!firstDate) {
        return secondDate || '';
    }

    if (!secondDate) {
        return firstDate;
    }

    return firstDate > secondDate ? firstDate : secondDate;
}

function getLatestSeasonDateRange(seasons) {
    return seasons.reduce((latestSeason, season) => {
        const startDate = toDateOnly(readSeasonField(season, 'startDate'));
        const endDate = toDateOnly(readSeasonField(season, 'endDate'));

        if (!startDate || !endDate) {
            return latestSeason;
        }

        if (!latestSeason || endDate > latestSeason.endDate || (endDate === latestSeason.endDate && startDate > latestSeason.startDate)) {
            return {
                endDate,
                seasonName: readSeasonField(season, 'seasonName') || 'the previous season',
                startDate,
            };
        }

        return latestSeason;
    }, null);
}

function getDateDiffDays(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function formatStatus(status) {
    return status || '-';
}

function canDeleteSeason(status) {
    return status === 'Draft' || status === 'Cancelled';
}

function getSeasonFormValues(season) {
    return {
        seasonName: readSeasonField(season, 'seasonName') || '',
        startDate: toDateOnly(readSeasonField(season, 'startDate')),
        endDate: toDateOnly(readSeasonField(season, 'endDate')),
        pointsPerCorrectPrediction: readSeasonField(season, 'pointsPerCorrectPrediction') || 100,
    };
}

function validateSeasonForm(form, { disallowPastDates = false, previousSeason = null } = {}) {
    if (!form.seasonName.trim()) {
        return { error: 'Season name is required.' };
    }

    if (form.seasonName.trim().length < 3 || form.seasonName.trim().length > 200) {
        return { error: 'Season name must be between 3 and 200 characters.' };
    }

    if (!form.startDate || !form.endDate) {
        return { error: 'Season start and end dates are required.' };
    }

    if (!isDateYearInRange(form.startDate) || !isDateYearInRange(form.endDate)) {
        return { error: 'Season years must be between 2000 and 2100.' };
    }

    if (disallowPastDates) {
        const todayDate = getTodayDateValue();

        if (form.startDate < todayDate) {
            return { error: 'Season start date cannot be in the past.' };
        }

        if (form.endDate < todayDate) {
            return { error: 'Season end date cannot be in the past.' };
        }
    }

    if (form.endDate < form.startDate) {
        return { error: 'Season end date must be after start date.' };
    }

    if (previousSeason && (form.startDate <= previousSeason.endDate || form.endDate <= previousSeason.endDate)) {
        return {
            error: `New season must start and end after ${previousSeason.seasonName} (${formatDate(previousSeason.startDate)} - ${formatDate(previousSeason.endDate)}).`,
        };
    }

    if (getDateDiffDays(form.startDate, form.endDate) > maxSeasonDurationDays) {
        return { error: 'Season duration cannot exceed 3,660 days.' };
    }

    const pointsPerCorrectPrediction = Number(form.pointsPerCorrectPrediction);

    if (!Number.isInteger(pointsPerCorrectPrediction) || pointsPerCorrectPrediction < 1 || pointsPerCorrectPrediction > maxPredictionPoints) {
        return { error: 'Points per correct prediction must be an integer between 1 and 1,000,000.' };
    }

    return {
        error: '',
        payload: {
            ...form,
            seasonName: form.seasonName.trim(),
            pointsPerCorrectPrediction,
        },
    };
}

function normalizeRewardRules(payload) {
    const rules = payload?.rules ?? payload?.Rules ?? [];

    if (!Array.isArray(rules) || rules.length === 0) {
        return defaultRewardRules;
    }

    return rules.map((rule) => ({
        rankPosition: readSeasonField(rule, 'rankPosition') ?? 1,
        rewardName: readSeasonField(rule, 'rewardName') ?? '',
        rewardDescription: readSeasonField(rule, 'rewardDescription') ?? '',
        bonusPoints: readSeasonField(rule, 'bonusPoints') ?? 0,
        rewardItemId: readSeasonField(rule, 'rewardItemId') ?? '',
        quantity: readSeasonField(rule, 'quantity') ?? 1,
    }));
}

function sanitizeRewardRules(rules) {
    return rules.map((rule) => ({
        rankPosition: Number(rule.rankPosition),
        rewardName: String(rule.rewardName || '').trim(),
        rewardDescription: String(rule.rewardDescription || '').trim(),
        bonusPoints: Number(rule.bonusPoints || 0),
        rewardItemId: rule.rewardItemId ? Number(rule.rewardItemId) : null,
        quantity: Number(rule.quantity || 1),
    }));
}

function validateRewardRules(rules) {
    if (rules.length === 0 || rules.length > maxRewardRules) {
        return 'A season must have 1 to 100 reward rules.';
    }

    if (rules.some((rule) => !Number.isInteger(rule.rankPosition) || rule.rankPosition < 1 || rule.rankPosition > maxRewardRules)) {
        return 'Reward ranks must be integers between 1 and 100.';
    }

    const sortedRanks = rules.map((rule) => rule.rankPosition).sort((a, b) => a - b);
    const duplicateRank = sortedRanks.find((rank, index) => index > 0 && rank === sortedRanks[index - 1]);

    if (duplicateRank) {
        return `Duplicate reward rule for rank ${duplicateRank}.`;
    }

    const missingRankIndex = sortedRanks.findIndex((rank, index) => rank !== index + 1);

    if (missingRankIndex !== -1) {
        return `Reward ranks must be consecutive from 1. Missing or invalid rank: ${missingRankIndex + 1}.`;
    }

    if (rules.some((rule) => !rule.rewardName || rule.rewardName.length > 200)) {
        return 'Reward name is required and cannot exceed 200 characters.';
    }

    if (rules.some((rule) => rule.rewardDescription.length > 1000)) {
        return 'Reward description cannot exceed 1,000 characters.';
    }

    if (rules.some((rule) => !Number.isInteger(rule.bonusPoints) || rule.bonusPoints < 0 || rule.bonusPoints > maxRewardBonusPoints)) {
        return 'Bonus points must be an integer between 0 and 1,000,000.';
    }

    if (rules.some((rule) => !Number.isInteger(rule.quantity) || rule.quantity < 1 || rule.quantity > 1000000)) {
        return 'Reward quantity must be an integer between 1 and 1,000,000.';
    }

    return '';
}

function normalizeSeasonLeaderboard(payload) {
    const items = payload?.items ?? payload?.Items ?? [];

    return Array.isArray(items) ? items : [];
}

function normalizeSeasonRewards(payload) {
    const rewards = payload?.rewards ?? payload?.Rewards ?? [];

    return Array.isArray(rewards) ? rewards : [];
}

function AdminSeasonManagement() {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSeason, setEditingSeason] = useState(null);
    const [seasonForm, setSeasonForm] = useState(emptySeasonForm);
    const [editSeasonForm, setEditSeasonForm] = useState(emptySeasonForm);
    const [savingSeason, setSavingSeason] = useState(false);
    const [ruleSeason, setRuleSeason] = useState(null);
    const [createRewardRules, setCreateRewardRules] = useState(defaultRewardRules);
    const [editRewardRules, setEditRewardRules] = useState(defaultRewardRules);
    const [rewardEditorOpen, setRewardEditorOpen] = useState(false);
    const [lockedRewardRuleSeasonIds, setLockedRewardRuleSeasonIds] = useState([]);
    const [savingRules, setSavingRules] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [detailSeason, setDetailSeason] = useState(null);
    const [seasonDetail, setSeasonDetail] = useState(null);
    const [seasonLeaderboard, setSeasonLeaderboard] = useState([]);
    const [seasonRewards, setSeasonRewards] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [rewardItems, setRewardItems] = useState([]);
    const [rewardStatusLoadingId, setRewardStatusLoadingId] = useState('');

    const loadSeasons = async () => {
        setLoading(true);

        try {
            const payload = await adminApi.getSeasons();
            setSeasons(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setSeasons([]);
            showAdminError(err.message || 'Failed to load seasons.');
        } finally {
            setLoading(false);
        }
    };

    const loadRewardItems = async () => {
        try {
            const payload = await adminApi.getRewardInventory();
            setRewardItems(Array.isArray(payload) ? payload : []);
        } catch {
            setRewardItems([]);
        }
    };

    useEffect(() => {
        loadSeasons();
        loadRewardItems();
    }, []);

    const stats = useMemo(() => {
        const countByStatus = (status) => seasons.filter((season) => readSeasonField(season, 'status') === status).length;

        return [
            { label: 'Total Seasons', value: seasons.length, icon: FaCalendarAlt },
            { label: 'Active', value: countByStatus('Active'), icon: FaCheck },
            { label: 'Draft', value: countByStatus('Draft'), icon: FaEdit },
            { label: 'Closed', value: countByStatus('Closed'), icon: FaTrophy },
        ];
    }, [seasons]);
    const latestSeasonDateRange = useMemo(() => getLatestSeasonDateRange(seasons), [seasons]);
    const rewardRulesLocked = Boolean(ruleSeason && lockedRewardRuleSeasonIds.includes(getSeasonLockKey(ruleSeason)));
    const todayDate = getTodayDateValue();
    const createSeasonMinDate = getLaterDateValue(todayDate, addDaysToDateValue(latestSeasonDateRange?.endDate, 1));

    const resetSeasonForm = () => {
        setSeasonForm(emptySeasonForm);
        setCreateRewardRules(defaultRewardRules);
    };

    const closeEditSeason = () => {
        setEditingSeason(null);
        setEditSeasonForm(emptySeasonForm);
    };

    const handleSeasonFieldChange = (field) => (event) => {
        setSeasonForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleEditSeasonFieldChange = (field) => (event) => {
        setEditSeasonForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const startEditSeason = (season) => {
        if (readSeasonField(season, 'status') !== 'Draft') {
            showAdminError('Only draft seasons can be edited.');
            return;
        }

        setEditingSeason(season);
        setEditSeasonForm(getSeasonFormValues(season));
    };

    const handleSeasonSubmit = async (event) => {
        event.preventDefault();

        const validation = validateSeasonForm(seasonForm, {
            disallowPastDates: true,
            previousSeason: latestSeasonDateRange,
        });

        if (validation.error) {
            showAdminError(validation.error);
            return;
        }

        const sanitizedRewardRules = sanitizeRewardRules(createRewardRules);
        const rewardRulesError = validateRewardRules(sanitizedRewardRules);

        if (rewardRulesError) {
            showAdminError(rewardRulesError);
            return;
        }

        setSavingSeason(true);

        try {
            const createdSeason = await adminApi.createSeason(validation.payload);
            let createdSeasonId = getCreatedSeasonId(createdSeason);

            if (!createdSeasonId) {
                const refreshedSeasons = await adminApi.getSeasons();
                const createdSeasonFromList = Array.isArray(refreshedSeasons)
                    ? refreshedSeasons.find((season) => (
                        readSeasonField(season, 'seasonName') === validation.payload.seasonName
                        && toDateOnly(readSeasonField(season, 'startDate')) === validation.payload.startDate
                        && toDateOnly(readSeasonField(season, 'endDate')) === validation.payload.endDate
                    ))
                    : null;

                createdSeasonId = getSeasonId(createdSeasonFromList);
                setSeasons(Array.isArray(refreshedSeasons) ? refreshedSeasons : []);
            }

            if (!createdSeasonId) {
                throw new Error('Season was created, but reward rules could not be saved because the new season ID was not returned.');
            }

            await adminApi.upsertSeasonRewardRules(createdSeasonId, sanitizedRewardRules);
            showAdminSuccess('Season and reward rules created successfully.', 'Created');

            resetSeasonForm();
            await loadSeasons();
        } catch (err) {
            showAdminError(err.message || 'Failed to save season.');
        } finally {
            setSavingSeason(false);
        }
    };

    const handleEditSeasonSubmit = async (event) => {
        event.preventDefault();

        const validation = validateSeasonForm(editSeasonForm);

        if (validation.error) {
            showAdminError(validation.error);
            return;
        }

        setSavingSeason(true);

        try {
            await adminApi.updateSeason(getSeasonId(editingSeason), validation.payload);
            showAdminSuccess('Season updated successfully.', 'Saved');
            closeEditSeason();
            await loadSeasons();
        } catch (err) {
            showAdminError(err.message || 'Failed to save season.');
        } finally {
            setSavingSeason(false);
        }
    };

    const handleSeasonAction = async (season, action) => {
        const id = getSeasonId(season);
        const seasonName = readSeasonField(season, 'seasonName');
        const copy = {
            activate: {
                title: 'Activate season',
                message: `Activate "${seasonName}" and reset spectator betting points?`,
                confirmLabel: 'Activate',
                run: () => adminApi.activateSeason(id),
            },
            close: {
                title: 'Close season',
                message: `Close "${seasonName}" and award configured season rewards?`,
                confirmLabel: 'Close Season',
                run: () => adminApi.closeSeason(id),
            },
            cancel: {
                title: 'Cancel season',
                message: `Cancel draft season "${seasonName}"?`,
                confirmLabel: 'Cancel Season',
                tone: 'danger',
                run: () => adminApi.cancelSeason(id),
            },
        }[action];

        if (!copy) {
            return;
        }

        const confirmed = await confirmAdminAction({
            title: copy.title,
            message: copy.message,
            confirmLabel: copy.confirmLabel,
            tone: copy.tone || 'primary',
        });

        if (!confirmed) {
            return;
        }

        setActionLoading(`${action}-${id}`);

        try {
            const response = await copy.run();
            const successMessage = response?.message || response?.Message || 'Season updated successfully.';
            showAdminSuccess(successMessage, 'Updated');
            await loadSeasons();
        } catch (err) {
            showAdminError(err.message || 'Failed to update season.');
        } finally {
            setActionLoading('');
        }
    };

    const configureRewardRules = async (season) => {
        setRuleSeason(season);
        setEditRewardRules(defaultRewardRules);
        setRewardEditorOpen(true);
        setLockedRewardRuleSeasonIds((current) => current.filter((id) => id !== getSeasonLockKey(season)));

        try {
            const payload = await adminApi.getSeasonRewardRules(getSeasonId(season));
            setEditRewardRules(normalizeRewardRules(payload));
        } catch (err) {
            setEditRewardRules(defaultRewardRules);
            showAdminError(err.message || 'Failed to load reward rules.');
        }
    };

    const closeRewardEditor = () => {
        setRewardEditorOpen(false);
    };

    const closeSeasonDetail = () => {
        setDetailSeason(null);
        setSeasonDetail(null);
        setSeasonLeaderboard([]);
        setSeasonRewards([]);
        setDetailError('');
    };

    const handleDeleteSeason = async (season) => {
        const id = getSeasonId(season);
        const seasonName = readSeasonField(season, 'seasonName') || 'this season';
        const status = readSeasonField(season, 'status');

        if (!id || !canDeleteSeason(status)) {
            showAdminError('Only draft or cancelled seasons can be deleted.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Delete season',
            message: `Delete "${seasonName}" permanently? This action cannot be undone.`,
            confirmLabel: 'Delete Season',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        setActionLoading(`delete-${id}`);

        try {
            const response = await adminApi.deleteSeason(id);
            const successMessage = response?.message || response?.Message || 'Season deleted successfully.';
            showAdminSuccess(successMessage, 'Deleted');
            closeSeasonDetail();
            await loadSeasons();
        } catch (err) {
            showAdminError(err.message || 'Failed to delete season.');
        } finally {
            setActionLoading('');
        }
    };

    const openSeasonDetail = async (season) => {
        const id = getSeasonId(season);

        setDetailSeason(season);
        setSeasonDetail(null);
        setSeasonLeaderboard([]);
        setSeasonRewards([]);
        setDetailError('');
        setDetailLoading(true);

        try {
            const [detailPayload, leaderboardPayload, rewardsPayload] = await Promise.all([
                adminApi.getSeasonById(id),
                adminApi.getSeasonLeaderboard(id),
                adminApi.getSeasonRewards(id),
            ]);

            setSeasonDetail(detailPayload);
            setSeasonLeaderboard(normalizeSeasonLeaderboard(leaderboardPayload));
            setSeasonRewards(normalizeSeasonRewards(rewardsPayload));
        } catch (err) {
            setDetailError(err.message || 'Failed to load season detail.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreateRewardRuleChange = (index, field) => (event) => {
        setCreateRewardRules((current) => current.map((rule, ruleIndex) => (
            ruleIndex === index
                ? {
                    ...rule,
                    [field]: event.target.value,
                }
                : rule
        )));
    };

    const addCreateRewardRule = () => {
        setCreateRewardRules((current) => [
            ...current,
            {
                rankPosition: current.length + 1,
                rewardName: '',
                rewardDescription: '',
                bonusPoints: 0,
                rewardItemId: '',
                quantity: 1,
            },
        ]);
    };

    const removeCreateRewardRule = (index) => {
        setCreateRewardRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    };

    const handleEditRewardRuleChange = (index, field) => (event) => {
        if (rewardRulesLocked) {
            return;
        }

        setEditRewardRules((current) => current.map((rule, ruleIndex) => (
            ruleIndex === index
                ? {
                    ...rule,
                    [field]: event.target.value,
                }
                : rule
        )));
    };

    const addEditRewardRule = () => {
        if (rewardRulesLocked) {
            return;
        }

        setEditRewardRules((current) => [
            ...current,
            {
                rankPosition: current.length + 1,
                rewardName: '',
                rewardDescription: '',
                bonusPoints: 0,
                rewardItemId: '',
                quantity: 1,
            },
        ]);
    };

    const removeEditRewardRule = (index) => {
        if (rewardRulesLocked) {
            return;
        }

        setEditRewardRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    };

    const saveRewardRules = async () => {
        if (!ruleSeason) {
            showAdminError('Select a draft season before saving reward rules.');
            return;
        }

        if (readSeasonField(ruleSeason, 'status') !== 'Draft') {
            showAdminError('Reward rules can only be changed while the season is Draft.');
            return;
        }

        if (rewardRulesLocked) {
            showAdminError('Reward rules have already been saved and cannot be changed.');
            return;
        }

        const sanitizedRules = sanitizeRewardRules(editRewardRules);
        const rewardRulesError = validateRewardRules(sanitizedRules);

        if (rewardRulesError) {
            showAdminError(rewardRulesError);
            return;
        }

        setSavingRules(true);

        try {
            await adminApi.upsertSeasonRewardRules(getSeasonId(ruleSeason), sanitizedRules);
            setLockedRewardRuleSeasonIds((current) => {
                const lockKey = getSeasonLockKey(ruleSeason);

                return current.includes(lockKey) ? current : [...current, lockKey];
            });
            showAdminSuccess('Reward rules saved successfully.', 'Saved');
            closeRewardEditor();
            await loadSeasons();
        } catch (err) {
            showAdminError(err.message || 'Failed to save reward rules.');
        } finally {
            setSavingRules(false);
        }
    };

    const handleSeasonRewardStatus = async (reward, status) => {
        const rewardId = readSeasonField(reward, 'seasonRewardId');
        const rewardName = readSeasonField(reward, 'rewardName') || 'this reward';
        const note = window.prompt(`Admin note for ${status.toLowerCase()} "${rewardName}"?`, '');
        const adminNote = String(note || '').trim();

        if (note === null) {
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Update reward status',
            message: `Move "${rewardName}" to ${status}?`,
            confirmLabel: status,
            tone: status === 'Rejected' ? 'danger' : 'primary',
        });

        if (!confirmed) {
            return;
        }

        setRewardStatusLoadingId(`${rewardId}-${status}`);

        try {
            const response = await adminApi.updateSeasonRewardStatus(rewardId, {
                status,
                adminNote: adminNote || null,
            });
            showAdminSuccess(response?.message || response?.Message || 'Season reward status updated.', 'Updated');
            if (detailSeason) {
                await openSeasonDetail(detailSeason);
            }
        } catch (err) {
            showAdminError(err.message || 'Failed to update season reward status.');
        } finally {
            setRewardStatusLoadingId('');
        }
    };

    const detailSource = seasonDetail || detailSeason;
    const detailTournaments = Array.isArray(readSeasonField(seasonDetail, 'tournaments'))
        ? readSeasonField(seasonDetail, 'tournaments')
        : [];
    const detailRewardRules = Array.isArray(readSeasonField(seasonDetail, 'rewardRules'))
        ? readSeasonField(seasonDetail, 'rewardRules')
        : [];
    const detailSeasonId = getSeasonId(detailSource);
    const detailStatus = readSeasonField(detailSource, 'status');
    const detailCanDelete = canDeleteSeason(detailStatus);

    return (
        <AdminLayout
            activeKey="seasons"
            mainClassName="season-management-main"
            searchPlaceholder="Search seasons..."
        >
            <section className={pageShellClass}>
                <div className="flex items-start justify-between gap-4 max-[820px]:flex-col">
                    <div>
                        <h1 className="page-title">
                            Season Management
                        </h1>
                        <p className="page-subtitle">
                            Manage prediction seasons, lifecycle, and end-of-season rewards.
                        </p>
                    </div>
                    <button
                        className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                        disabled={loading}
                        onClick={loadSeasons}
                        type="button"
                    >
                        <FaSyncAlt aria-hidden="true" />
                        Refresh
                    </button>
                </div>

                <section aria-label="Season summary" className="grid grid-cols-4 gap-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <article className={panelClass} key={stat.label}>
                                <div className="flex min-h-[118px] items-start justify-between gap-3 px-5 py-5">
                                    <div>
                                        <span className="block text-[0.72rem] font-black uppercase text-[#64748b]">{stat.label}</span>
                                        <strong className="mt-3 block text-[2rem] leading-none text-[var(--admin-primary-dark)]">{stat.value}</strong>
                                    </div>
                                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-gold-dark,var(--admin-primary))]">
                                        <Icon aria-hidden="true" />
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <form className={`${panelClass} overflow-hidden`} onSubmit={handleSeasonSubmit}>
                    <div className={panelHeaderClass}>
                        <div>
                            <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Create Season</h2>
                            <p className="m-0 mt-1 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                Season details and reward rules are saved together.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[minmax(300px,0.9fr)_minmax(520px,1.1fr)] max-[1180px]:grid-cols-1">
                        <section className="border-r border-[var(--admin-border)] bg-white p-6 max-[1180px]:border-b max-[1180px]:border-r-0 max-[720px]:p-4">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f7ef] text-[var(--admin-primary-dark)]">
                                    <FaCalendarAlt aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Season Details</h3>
                                    <p className="m-0 mt-1 text-[0.75rem] font-bold text-[var(--admin-muted)]">Choose an upcoming season window.</p>
                                </div>
                            </div>

                            <div className="grid gap-5">
                                <label className={fieldClass}>
                                    <span className={labelClass}>Season Name</span>
                                    <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} maxLength={200} minLength={3} onChange={handleSeasonFieldChange('seasonName')} required type="text" value={seasonForm.seasonName} />
                                </label>

                                <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Start Date</span>
                                        <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} lang="en-US" max={maxDate} min={createSeasonMinDate} onChange={handleSeasonFieldChange('startDate')} required type="date" value={seasonForm.startDate} />
                                    </label>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>End Date</span>
                                        <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} lang="en-US" max={maxDate} min={createSeasonMinDate} onChange={handleSeasonFieldChange('endDate')} required type="date" value={seasonForm.endDate} />
                                    </label>
                                </div>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Points Per Correct Prediction</span>
                                    <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} max={maxPredictionPoints} min="1" onChange={handleSeasonFieldChange('pointsPerCorrectPrediction')} required step="1" type="number" value={seasonForm.pointsPerCorrectPrediction} />
                                </label>

                                <div className="mt-1 flex items-center justify-between gap-4 border-t border-[var(--admin-border)] pt-5 max-[720px]:flex-col max-[720px]:items-stretch">
                                    <p className="m-0 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                        Reward rules will be attached to this season.
                                    </p>
                                    <button
                                        className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] max-[720px]:w-full`}
                                        disabled={savingSeason}
                                        type="submit"
                                    >
                                        <FaCheck aria-hidden="true" />
                                        {savingSeason ? 'Saving...' : 'Create Season'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#fffaf6] p-6 max-[720px]:p-4">
                            <div className="mb-5 flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-stretch">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-gold-dark,var(--admin-primary))]">
                                        <FaTrophy aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Reward Rules</h3>
                                        <p className="m-0 mt-1 text-[0.75rem] font-bold text-[var(--admin-muted)]">Saved with the new season.</p>
                                    </div>
                                </div>
                                <button
                                    className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef] max-[720px]:w-full`}
                                    disabled={savingSeason}
                                    onClick={addCreateRewardRule}
                                    type="button"
                                >
                                    <FaPlus aria-hidden="true" />
                                    Add Rule
                                </button>
                            </div>

                            <div className="grid max-h-[720px] gap-4 overflow-y-auto pr-1 max-[720px]:max-h-none max-[720px]:overflow-visible max-[720px]:pr-0">
                                {createRewardRules.map((rule, index) => (
                                    <article className="rounded-lg border border-[var(--admin-border)] bg-white p-4 shadow-[0_10px_24px_rgba(81,31,22,0.06)]" key={`${index}-${rule.rankPosition}`}>
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f4f6] text-[0.8rem] font-black text-[var(--admin-primary-dark)]">
                                                    #{index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <h4 className="m-0 text-[0.9rem] font-black text-[var(--admin-ink)]">Reward Rule</h4>
                                                    <p className="m-0 mt-0.5 text-[0.72rem] font-bold text-[var(--admin-muted)]">Rank, reward, inventory, and description.</p>
                                                </div>
                                            </div>
                                            <button
                                                aria-label="Remove reward rule"
                                                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[#a4392f] transition-colors hover:border-[#a4392f] hover:bg-[#f3e1df]"
                                                disabled={savingSeason || createRewardRules.length === 1}
                                                onClick={() => removeCreateRewardRule(index)}
                                                type="button"
                                            >
                                                <FaTrashAlt aria-hidden="true" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-[96px_minmax(190px,1fr)_minmax(132px,0.7fr)] gap-3 max-[720px]:grid-cols-1">
                                            <label className={fieldClass}>
                                                <span className={labelClass}>Rank</span>
                                                <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} disabled={savingSeason} max={maxRewardRules} min="1" onChange={handleCreateRewardRuleChange(index, 'rankPosition')} step="1" type="number" value={rule.rankPosition} />
                                            </label>
                                            <label className={fieldClass}>
                                                <span className={labelClass}>Reward</span>
                                                <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} disabled={savingSeason} maxLength={200} onChange={handleCreateRewardRuleChange(index, 'rewardName')} type="text" value={rule.rewardName} />
                                            </label>
                                            <label className={fieldClass}>
                                                <span className={labelClass}>Bonus Points</span>
                                                <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} disabled={savingSeason} max={maxRewardBonusPoints} min="0" onChange={handleCreateRewardRuleChange(index, 'bonusPoints')} step="1" type="number" value={rule.bonusPoints} />
                                            </label>
                                            <label className={`${fieldClass} col-span-2 max-[720px]:col-span-1`}>
                                                <span className={labelClass}>Inventory Item</span>
                                                <select className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} disabled={savingSeason} onChange={handleCreateRewardRuleChange(index, 'rewardItemId')} value={rule.rewardItemId || ''}>
                                                    <option value="">No item</option>
                                                    {rewardItems.map((item) => (
                                                        <option key={readSeasonField(item, 'rewardItemId')} value={readSeasonField(item, 'rewardItemId')}>
                                                            {readSeasonField(item, 'name')} ({readSeasonField(item, 'availableQuantity') ?? 0} left)
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className={fieldClass}>
                                                <span className={labelClass}>Qty</span>
                                                <input className={`${controlClass} h-12 rounded-lg px-4 text-[0.92rem]`} disabled={savingSeason} max="1000000" min="1" onChange={handleCreateRewardRuleChange(index, 'quantity')} step="1" type="number" value={rule.quantity || 1} />
                                            </label>
                                            <label className={`${fieldClass} col-span-3 max-[720px]:col-span-1`}>
                                                <span className={labelClass}>Description</span>
                                                <textarea className={`${controlClass} min-h-[74px] resize-y rounded-lg px-4 py-3 text-[0.92rem] leading-relaxed`} disabled={savingSeason} maxLength={1000} onChange={handleCreateRewardRuleChange(index, 'rewardDescription')} value={rule.rewardDescription} />
                                            </label>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </form>

                <section className={panelClass}>
                    <div className={panelHeaderClass}>
                        <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">All Seasons</h2>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse max-[900px]:min-w-[980px]">
                            <thead>
                                <tr>
                                    {['Season', 'Date Range', 'Points', 'Tournaments', 'Rewards', 'Status', 'Actions'].map((heading) => (
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 text-left text-[0.68rem] font-black uppercase text-[#64748b]" key={heading}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="7">Loading seasons...</td>
                                    </tr>
                                ) : seasons.length === 0 ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="7">No seasons found.</td>
                                    </tr>
                                ) : seasons.map((season) => {
                                    const id = getSeasonId(season);
                                    const status = readSeasonField(season, 'status');
                                    const isDraft = status === 'Draft';
                                    const isActive = status === 'Active';

                                    return (
                                        <tr key={id}>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.88rem] font-black text-[var(--admin-ink)]">
                                                {readSeasonField(season, 'seasonName')}
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">
                                                {formatDate(readSeasonField(season, 'startDate'))} - {formatDate(readSeasonField(season, 'endDate'))}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">
                                                {readSeasonField(season, 'pointsPerCorrectPrediction')}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">
                                                {readSeasonField(season, 'tournamentCount') ?? 0}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">
                                                {readSeasonField(season, 'rewardRuleCount') ?? 0}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${statusClass[status] || 'bg-[#f3f4f6] text-[#374151]'}`}>
                                                    {formatStatus(status)}
                                                </span>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} onClick={() => openSeasonDetail(season)} type="button">
                                                        <FaEye aria-hidden="true" />
                                                        View
                                                    </button>
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={!isDraft} onClick={() => startEditSeason(season)} type="button">
                                                        <FaEdit aria-hidden="true" />
                                                        Edit
                                                    </button>
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={!isDraft} onClick={() => configureRewardRules(season)} type="button">
                                                        <FaTrophy aria-hidden="true" />
                                                        Edit Reward
                                                    </button>
                                                    <button className={`${actionButtonClass} bg-[#e8f7ef] text-[var(--admin-primary)] hover:bg-[#d7f2e4]`} disabled={!isDraft || actionLoading === `activate-${id}`} onClick={() => handleSeasonAction(season, 'activate')} type="button">
                                                        <FaCheck aria-hidden="true" />
                                                        Activate
                                                    </button>
                                                    <button className={`${actionButtonClass} bg-[var(--admin-surface-strong)] text-[var(--admin-primary)] hover:bg-[#d8e0ea]`} disabled={!isActive || actionLoading === `close-${id}`} onClick={() => handleSeasonAction(season, 'close')} type="button">
                                                        <FaTrophy aria-hidden="true" />
                                                        Close
                                                    </button>
                                                    <button className={`${actionButtonClass} border border-[#f0b4b4] bg-white text-[#b91c1c] hover:bg-[#fff3f3]`} disabled={!isDraft || actionLoading === `cancel-${id}`} onClick={() => handleSeasonAction(season, 'cancel')} type="button">
                                                        <FaTimes aria-hidden="true" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {rewardEditorOpen && ruleSeason && (
                    <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={closeRewardEditor} role="presentation">
                        <form
                            aria-label={`Edit reward for ${readSeasonField(ruleSeason, 'seasonName') || 'season'}`}
                            className="grid max-h-[calc(100vh-48px)] w-[min(860px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                            onClick={(event) => event.stopPropagation()}
                            onSubmit={(event) => {
                                event.preventDefault();
                                saveRewardRules();
                            }}
                        >
                            <div className="flex items-start justify-between gap-4 max-[720px]:flex-col">
                                <div>
                                    <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">Edit Reward</h2>
                                    <p className="m-0 mt-1 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                        {readSeasonField(ruleSeason, 'seasonName')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2 max-[720px]:w-full max-[720px]:justify-start">
                                    <button
                                        className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                                        disabled={rewardRulesLocked}
                                        onClick={addEditRewardRule}
                                        type="button"
                                    >
                                        <FaPlus aria-hidden="true" />
                                        Add Rule
                                    </button>
                                    <button aria-label="Close edit reward" className="grid h-10 w-10 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeRewardEditor} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {editRewardRules.map((rule, index) => (
                                    <div className="grid grid-cols-[88px_minmax(170px,1fr)_minmax(132px,0.7fr)_44px] gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3 max-[720px]:grid-cols-1" key={`${index}-${rule.rankPosition}`}>
                                        <label className={fieldClass}>
                                            <span className={labelClass}>Rank</span>
                                            <input className={controlClass} disabled={rewardRulesLocked} max={maxRewardRules} min="1" onChange={handleEditRewardRuleChange(index, 'rankPosition')} step="1" type="number" value={rule.rankPosition} />
                                        </label>
                                        <label className={fieldClass}>
                                            <span className={labelClass}>Reward</span>
                                            <input className={controlClass} disabled={rewardRulesLocked} maxLength={200} onChange={handleEditRewardRuleChange(index, 'rewardName')} type="text" value={rule.rewardName} />
                                        </label>
                                        <label className={fieldClass}>
                                            <span className={labelClass}>Bonus Points</span>
                                            <input className={controlClass} disabled={rewardRulesLocked} max={maxRewardBonusPoints} min="0" onChange={handleEditRewardRuleChange(index, 'bonusPoints')} step="1" type="number" value={rule.bonusPoints} />
                                        </label>
                                        <button
                                            aria-label="Remove reward rule"
                                            className="mt-[22px] grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[#a4392f] transition-colors hover:border-[#a4392f] hover:bg-[#f3e1df] max-[720px]:mt-0"
                                            disabled={rewardRulesLocked || editRewardRules.length === 1}
                                            onClick={() => removeEditRewardRule(index)}
                                            type="button"
                                        >
                                            <FaTrashAlt aria-hidden="true" />
                                        </button>
                                        <label className={`${fieldClass} col-span-2 max-[720px]:col-span-1`}>
                                            <span className={labelClass}>Inventory Item</span>
                                            <select className={controlClass} disabled={rewardRulesLocked} onChange={handleEditRewardRuleChange(index, 'rewardItemId')} value={rule.rewardItemId || ''}>
                                                <option value="">No item</option>
                                                {rewardItems.map((item) => (
                                                    <option key={readSeasonField(item, 'rewardItemId')} value={readSeasonField(item, 'rewardItemId')}>
                                                        {readSeasonField(item, 'name')} ({readSeasonField(item, 'availableQuantity') ?? 0} left)
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className={fieldClass}>
                                            <span className={labelClass}>Qty</span>
                                            <input className={controlClass} disabled={rewardRulesLocked} max="1000000" min="1" onChange={handleEditRewardRuleChange(index, 'quantity')} step="1" type="number" value={rule.quantity || 1} />
                                        </label>
                                        <label className={`${fieldClass} col-span-4 max-[720px]:col-span-1`}>
                                            <span className={labelClass}>Description</span>
                                            <input className={controlClass} disabled={rewardRulesLocked} maxLength={1000} onChange={handleEditRewardRuleChange(index, 'rewardDescription')} type="text" value={rule.rewardDescription} />
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeRewardEditor} type="button">
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={rewardRulesLocked || savingRules || readSeasonField(ruleSeason, 'status') !== 'Draft'}
                                    type="submit"
                                >
                                    {rewardRulesLocked ? 'Reward Saved' : savingRules ? 'Saving...' : 'Save Reward'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {editingSeason && (
                    <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={closeEditSeason} role="presentation">
                        <form
                            aria-label={`Edit ${readSeasonField(editingSeason, 'seasonName') || 'season'}`}
                            className="grid max-h-[calc(100vh-48px)] w-[min(640px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                            onClick={(event) => event.stopPropagation()}
                            onSubmit={handleEditSeasonSubmit}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="m-0 text-[1.35rem] leading-[1.15] text-[var(--admin-primary-dark)]">Edit Season</h2>
                                </div>
                                <button aria-label="Close edit season" className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeEditSeason} type="button">
                                    <FaTimes aria-hidden="true" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                                <label className={`${fieldClass} col-span-2 max-[720px]:col-span-1`}>
                                    <span className={labelClass}>Season Name</span>
                                    <input className={controlClass} maxLength={200} minLength={3} onChange={handleEditSeasonFieldChange('seasonName')} required type="text" value={editSeasonForm.seasonName} />
                                </label>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Start Date</span>
                                    <input className={controlClass} lang="en-US" max={maxDate} min={minDate} onChange={handleEditSeasonFieldChange('startDate')} required type="date" value={editSeasonForm.startDate} />
                                </label>

                                <label className={fieldClass}>
                                    <span className={labelClass}>End Date</span>
                                    <input className={controlClass} lang="en-US" max={maxDate} min={minDate} onChange={handleEditSeasonFieldChange('endDate')} required type="date" value={editSeasonForm.endDate} />
                                </label>

                                <label className={`${fieldClass} col-span-2 max-[720px]:col-span-1`}>
                                    <span className={labelClass}>Points Per Correct Prediction</span>
                                    <input className={controlClass} max={maxPredictionPoints} min="1" onChange={handleEditSeasonFieldChange('pointsPerCorrectPrediction')} required step="1" type="number" value={editSeasonForm.pointsPerCorrectPrediction} />
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 max-[720px]:flex-col">
                                <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]" onClick={closeEditSeason} type="button">
                                    Cancel
                                </button>
                                <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60" disabled={savingSeason} type="submit">
                                    {savingSeason ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {detailSeason && (
                    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8" onClick={closeSeasonDetail} role="presentation">
                        <section
                            aria-label={`Details for ${readSeasonField(detailSource, 'seasonName') || 'season'}`}
                            className="grid max-h-[calc(100vh-48px)] w-[min(980px,100%)] gap-5 overflow-y-auto rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_20px_48px_rgba(45,32,32,0.22)]"
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="m-0 text-[1.45rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                                        {readSeasonField(detailSource, 'seasonName') || 'Season Detail'}
                                    </h2>
                                    <p className="mb-0 mt-1.5 text-[0.86rem] font-semibold text-[var(--admin-muted)]">
                                        Detail, predictor leaderboard, and awarded rewards.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                    <button
                                        className={`${actionButtonClass} border border-[#f0b4b4] bg-white text-[#b91c1c] hover:bg-[#fff3f3]`}
                                        disabled={!detailCanDelete || actionLoading === `delete-${detailSeasonId}`}
                                        onClick={() => handleDeleteSeason(detailSource)}
                                        title={detailCanDelete ? 'Delete season' : 'Only draft or cancelled seasons can be deleted'}
                                        type="button"
                                    >
                                        <FaTrashAlt aria-hidden="true" />
                                        {actionLoading === `delete-${detailSeasonId}` ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button aria-label="Close season details" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-gold)]" onClick={closeSeasonDetail} type="button">
                                        <FaTimes aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {detailLoading ? (
                                <div className="rounded-md border border-[var(--admin-border)] bg-[#f8fbff] px-4 py-5 text-[0.9rem] font-bold text-[var(--admin-muted)]">
                                    Loading season detail...
                                </div>
                            ) : detailError ? (
                                <div className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.86rem] font-bold text-[var(--admin-primary)]">
                                    {detailError}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
                                        {[
                                            ['Status', readSeasonField(detailSource, 'status')],
                                            ['Date Range', `${formatDate(readSeasonField(detailSource, 'startDate'))} - ${formatDate(readSeasonField(detailSource, 'endDate'))}`],
                                            ['Points', readSeasonField(detailSource, 'pointsPerCorrectPrediction')],
                                            ['Tournaments', detailTournaments.length || readSeasonField(detailSource, 'tournamentCount') || 0],
                                        ].map(([label, value]) => (
                                            <div className="grid gap-1 rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-3" key={label}>
                                                <span className="text-[0.66rem] font-black uppercase text-[#64748b]">{label}</span>
                                                <strong className="text-[0.9rem] text-[var(--admin-ink)]">{value ?? '-'}</strong>
                                            </div>
                                        ))}
                                    </div>

                                    <section className="overflow-hidden rounded-md border border-[var(--admin-border)]">
                                        <div className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3">
                                            <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Leaderboard</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[720px] border-collapse">
                                                <thead>
                                                    <tr>
                                                        {['Rank', 'Spectator', 'Points', 'Correct', 'Accuracy', 'Predictions'].map((heading) => (
                                                            <th className="border-b border-[var(--admin-border)] px-4 py-3 text-left text-[0.64rem] font-black uppercase text-[#64748b]" key={heading}>{heading}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {seasonLeaderboard.length === 0 ? (
                                                        <tr>
                                                            <td className="px-4 py-5 text-center text-[0.86rem] font-bold text-[var(--admin-muted)]" colSpan="6">No leaderboard data.</td>
                                                        </tr>
                                                    ) : seasonLeaderboard.map((item) => (
                                                        <tr key={`${readSeasonField(item, 'rank')}-${readSeasonField(item, 'spectatorId')}`}>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">#{readSeasonField(item, 'rank')}</td>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-ink)]">{readSeasonField(item, 'spectatorName')}</td>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-ink)]">{readSeasonField(item, 'points')}</td>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readSeasonField(item, 'correctPredictions')}</td>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readSeasonField(item, 'accuracy')}%</td>
                                                            <td className="border-b border-[var(--admin-border)] px-4 py-3 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readSeasonField(item, 'totalPredictions')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    <section className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
                                        <div className="overflow-hidden rounded-md border border-[var(--admin-border)]">
                                            <div className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3">
                                                <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Reward Rules</h3>
                                            </div>
                                            <div className="divide-y divide-[var(--admin-border)]">
                                                {detailRewardRules.length === 0 ? (
                                                    <div className="px-4 py-5 text-[0.86rem] font-bold text-[var(--admin-muted)]">No reward rules configured.</div>
                                                ) : detailRewardRules.map((rule) => (
                                                    <div className="grid gap-1 px-4 py-3" key={readSeasonField(rule, 'seasonRewardRuleId') || readSeasonField(rule, 'rankPosition')}>
                                                        <strong className="text-[0.86rem] text-[var(--admin-ink)]">#{readSeasonField(rule, 'rankPosition')} - {readSeasonField(rule, 'rewardName')}</strong>
                                                        <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">{readSeasonField(rule, 'bonusPoints')} bonus points</span>
                                                        {(readSeasonField(rule, 'rewardItemName') || readSeasonField(rule, 'quantity')) && (
                                                            <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                                                Item: {readSeasonField(rule, 'rewardItemName') || 'Inventory item'} x{readSeasonField(rule, 'quantity') || 1}
                                                            </span>
                                                        )}
                                                        {readSeasonField(rule, 'rewardDescription') && (
                                                            <span className="text-[0.78rem] font-semibold text-[var(--admin-muted)]">{readSeasonField(rule, 'rewardDescription')}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-md border border-[var(--admin-border)]">
                                            <div className="border-b border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3">
                                                <h3 className="m-0 text-[0.95rem] font-black text-[var(--admin-primary-dark)]">Awarded Rewards</h3>
                                            </div>
                                            <div className="divide-y divide-[var(--admin-border)]">
                                                {seasonRewards.length === 0 ? (
                                                    <div className="px-4 py-5 text-[0.86rem] font-bold text-[var(--admin-muted)]">No season rewards awarded yet.</div>
                                                ) : seasonRewards.map((reward) => {
                                                    const rewardId = readSeasonField(reward, 'seasonRewardId');
                                                    const rewardStatus = readSeasonField(reward, 'status');
                                                    const transitions = rewardStatusTransitions[rewardStatus] || [];

                                                    return (
                                                        <div className="grid gap-2 px-4 py-3" key={rewardId || `${readSeasonField(reward, 'rankPosition')}-${readSeasonField(reward, 'spectatorId')}`}>
                                                            <strong className="text-[0.86rem] text-[var(--admin-ink)]">#{readSeasonField(reward, 'rankPosition')} - {readSeasonField(reward, 'spectatorName')}</strong>
                                                            <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                                                {readSeasonField(reward, 'rewardName')} | {readSeasonField(reward, 'bonusPoints')} bonus points
                                                            </span>
                                                            {(readSeasonField(reward, 'rewardItemName') || readSeasonField(reward, 'quantity')) && (
                                                                <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                                                    Item: {readSeasonField(reward, 'rewardItemName') || 'Inventory item'} x{readSeasonField(reward, 'quantity') || 1}
                                                                </span>
                                                            )}
                                                            <span className="text-[0.78rem] font-semibold text-[var(--admin-muted)]">
                                                                Final points: {readSeasonField(reward, 'finalPoints')} | Status: {rewardStatus}
                                                            </span>
                                                            {(readSeasonField(reward, 'receiverName') || readSeasonField(reward, 'deliveryAddress')) && (
                                                                <span className="text-[0.74rem] font-semibold text-[var(--admin-muted)]">
                                                                    Receiver: {readSeasonField(reward, 'receiverName') || '-'} | Phone: {readSeasonField(reward, 'receiverPhone') || '-'} | Address: {readSeasonField(reward, 'deliveryAddress') || '-'}
                                                                </span>
                                                            )}
                                                            {transitions.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {transitions.map((nextStatus) => (
                                                                        <button
                                                                            className={`${actionButtonClass} ${nextStatus === 'Rejected' ? 'border border-[#f0b4b4] bg-white text-[#b91c1c] hover:bg-[#fff3f3]' : 'bg-[#e8f7ef] text-[var(--admin-primary)] hover:bg-[#d7f2e4]'}`}
                                                                            disabled={rewardStatusLoadingId !== ''}
                                                                            key={nextStatus}
                                                                            onClick={() => handleSeasonRewardStatus(reward, nextStatus)}
                                                                            type="button"
                                                                        >
                                                                            {rewardStatusLoadingId === `${rewardId}-${nextStatus}` ? 'Saving...' : nextStatus}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}

export default AdminSeasonManagement;
