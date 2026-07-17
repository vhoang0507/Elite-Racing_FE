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
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]';
const panelHeaderClass = 'flex min-h-[62px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.68rem] font-black uppercase text-[#64748b]';
const controlClass = 'h-10 w-full rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.86rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
const actionButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[0.78rem] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const emptySeasonForm = {
    seasonName: '',
    startDate: '',
    endDate: '',
    pointsPerCorrectPrediction: 100,
};

const defaultRewardRules = [
    { rankPosition: 1, rewardName: 'Champion Bonus', rewardDescription: '', bonusPoints: 300 },
    { rankPosition: 2, rewardName: 'Runner-up Bonus', rewardDescription: '', bonusPoints: 200 },
    { rankPosition: 3, rewardName: 'Third Place Bonus', rewardDescription: '', bonusPoints: 100 },
];

const statusClass = {
    Draft: 'bg-[#f3f4f6] text-[#374151]',
    Active: 'bg-[#e8f7ee] text-[#16864f]',
    Closed: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    Cancelled: 'bg-[#f3e1df] text-[#a4392f]',
};

function readSeasonField(season, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return season?.[key] ?? season?.[pascalKey];
}

function getSeasonId(season) {
    return readSeasonField(season, 'seasonId');
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

function formatStatus(status) {
    return status || '-';
}

function canDeleteSeason(status) {
    return status === 'Draft' || status === 'Cancelled';
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
    }));
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
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [editingSeason, setEditingSeason] = useState(null);
    const [seasonForm, setSeasonForm] = useState(emptySeasonForm);
    const [savingSeason, setSavingSeason] = useState(false);
    const [ruleSeason, setRuleSeason] = useState(null);
    const [rewardRules, setRewardRules] = useState(defaultRewardRules);
    const [savingRules, setSavingRules] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [detailSeason, setDetailSeason] = useState(null);
    const [seasonDetail, setSeasonDetail] = useState(null);
    const [seasonLeaderboard, setSeasonLeaderboard] = useState([]);
    const [seasonRewards, setSeasonRewards] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    const loadSeasons = async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await adminApi.getSeasons();
            setSeasons(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setSeasons([]);
            setError(err.message || 'Failed to load seasons.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSeasons();
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

    const resetSeasonForm = () => {
        setEditingSeason(null);
        setSeasonForm(emptySeasonForm);
        setError('');
        setMessage('');
    };

    const handleSeasonFieldChange = (field) => (event) => {
        setSeasonForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const startEditSeason = (season) => {
        if (readSeasonField(season, 'status') !== 'Draft') {
            setError('Only draft seasons can be edited.');
            return;
        }

        setEditingSeason(season);
        setSeasonForm({
            seasonName: readSeasonField(season, 'seasonName') || '',
            startDate: toDateOnly(readSeasonField(season, 'startDate')),
            endDate: toDateOnly(readSeasonField(season, 'endDate')),
            pointsPerCorrectPrediction: readSeasonField(season, 'pointsPerCorrectPrediction') || 100,
        });
        setError('');
        setMessage('');
    };

    const handleSeasonSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!seasonForm.seasonName.trim()) {
            setError('Season name is required.');
            return;
        }

        if (!seasonForm.startDate || !seasonForm.endDate) {
            setError('Season start and end dates are required.');
            return;
        }

        if (seasonForm.endDate < seasonForm.startDate) {
            setError('Season end date must be after start date.');
            return;
        }

        if (Number(seasonForm.pointsPerCorrectPrediction) <= 0) {
            setError('Points per correct prediction must be greater than 0.');
            return;
        }

        setSavingSeason(true);

        try {
            const payload = {
                ...seasonForm,
                pointsPerCorrectPrediction: Number(seasonForm.pointsPerCorrectPrediction),
            };

            if (editingSeason) {
                await adminApi.updateSeason(getSeasonId(editingSeason), payload);
                setMessage('Season updated successfully.');
                showAdminSuccess('Season updated successfully.', 'Saved');
            } else {
                await adminApi.createSeason(payload);
                setMessage('Season created successfully.');
                showAdminSuccess('Season created successfully.', 'Created');
            }

            resetSeasonForm();
            await loadSeasons();
        } catch (err) {
            setError(err.message || 'Failed to save season.');
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
        setError('');
        setMessage('');

        try {
            const response = await copy.run();
            const successMessage = response?.message || response?.Message || 'Season updated successfully.';
            setMessage(successMessage);
            showAdminSuccess(successMessage, 'Updated');
            await loadSeasons();
        } catch (err) {
            setError(err.message || 'Failed to update season.');
        } finally {
            setActionLoading('');
        }
    };

    const configureRewardRules = async (season) => {
        setRuleSeason(season);
        setError('');
        setMessage('');

        try {
            const payload = await adminApi.getSeasonRewardRules(getSeasonId(season));
            setRewardRules(normalizeRewardRules(payload));
        } catch (err) {
            setRewardRules(defaultRewardRules);
            setError(err.message || 'Failed to load reward rules.');
        }
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
            setDetailError('Only draft or cancelled seasons can be deleted.');
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
        setDetailError('');
        setError('');
        setMessage('');

        try {
            const response = await adminApi.deleteSeason(id);
            const successMessage = response?.message || response?.Message || 'Season deleted successfully.';
            setMessage(successMessage);
            showAdminSuccess(successMessage, 'Deleted');
            closeSeasonDetail();
            await loadSeasons();
        } catch (err) {
            setDetailError(err.message || 'Failed to delete season.');
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

    const handleRewardRuleChange = (index, field) => (event) => {
        setRewardRules((current) => current.map((rule, ruleIndex) => (
            ruleIndex === index
                ? {
                    ...rule,
                    [field]: event.target.value,
                }
                : rule
        )));
    };

    const addRewardRule = () => {
        setRewardRules((current) => [
            ...current,
            {
                rankPosition: current.length + 1,
                rewardName: '',
                rewardDescription: '',
                bonusPoints: 0,
            },
        ]);
    };

    const removeRewardRule = (index) => {
        setRewardRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    };

    const saveRewardRules = async () => {
        if (!ruleSeason) {
            setError('Select a draft season before saving reward rules.');
            return;
        }

        if (readSeasonField(ruleSeason, 'status') !== 'Draft') {
            setError('Reward rules can only be changed while the season is Draft.');
            return;
        }

        const sanitizedRules = rewardRules.map((rule) => ({
            rankPosition: Number(rule.rankPosition),
            rewardName: String(rule.rewardName || '').trim(),
            rewardDescription: String(rule.rewardDescription || '').trim(),
            bonusPoints: Number(rule.bonusPoints || 0),
        }));

        if (sanitizedRules.some((rule) => !rule.rankPosition || rule.rankPosition <= 0 || !rule.rewardName || rule.bonusPoints < 0)) {
            setError('Each reward rule needs a rank, reward name, and non-negative bonus points.');
            return;
        }

        setSavingRules(true);
        setError('');
        setMessage('');

        try {
            await adminApi.upsertSeasonRewardRules(getSeasonId(ruleSeason), sanitizedRules);
            setMessage('Reward rules saved successfully.');
            showAdminSuccess('Reward rules saved successfully.', 'Saved');
            await loadSeasons();
        } catch (err) {
            setError(err.message || 'Failed to save reward rules.');
        } finally {
            setSavingRules(false);
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

                {(error || message) && (
                    <section className={`rounded-md border px-4 py-3 text-[0.86rem] font-bold ${error ? 'border-[#f0b4b4] bg-[#fff3f3] text-[var(--admin-primary)]' : 'border-[#afe2c4] bg-[#effcf4] text-[#15803d]'}`}>
                        {error || message}
                    </section>
                )}

                <section className="grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 max-[1180px]:grid-cols-1">
                    <form className={panelClass} onSubmit={handleSeasonSubmit}>
                        <div className={panelHeaderClass}>
                            <div>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">{editingSeason ? 'Edit Season' : 'Create Season'}</h2>
                            </div>
                            {editingSeason && (
                                <button
                                    className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                                    onClick={resetSeasonForm}
                                    type="button"
                                >
                                    <FaTimes aria-hidden="true" />
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4 p-5">
                            <label className={fieldClass}>
                                <span className={labelClass}>Season Name</span>
                                <input className={controlClass} onChange={handleSeasonFieldChange('seasonName')} required type="text" value={seasonForm.seasonName} />
                            </label>

                            <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                                <label className={fieldClass}>
                                    <span className={labelClass}>Start Date</span>
                                    <input className={controlClass} onChange={handleSeasonFieldChange('startDate')} required type="date" value={seasonForm.startDate} />
                                </label>
                                <label className={fieldClass}>
                                    <span className={labelClass}>End Date</span>
                                    <input className={controlClass} onChange={handleSeasonFieldChange('endDate')} required type="date" value={seasonForm.endDate} />
                                </label>
                            </div>

                            <label className={fieldClass}>
                                <span className={labelClass}>Points Per Correct Prediction</span>
                                <input className={controlClass} min="1" onChange={handleSeasonFieldChange('pointsPerCorrectPrediction')} required type="number" value={seasonForm.pointsPerCorrectPrediction} />
                            </label>

                            <button
                                className={`${actionButtonClass} w-fit bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] max-[720px]:w-full`}
                                disabled={savingSeason}
                                type="submit"
                            >
                                <FaCheck aria-hidden="true" />
                                {savingSeason ? 'Saving...' : editingSeason ? 'Save Season' : 'Create Season'}
                            </button>
                        </div>
                    </form>

                    <section className={panelClass}>
                        <div className={panelHeaderClass}>
                            <div>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Reward Rules</h2>
                                <p className="m-0 mt-1 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                    {ruleSeason ? readSeasonField(ruleSeason, 'seasonName') : 'Select a draft season'}
                                </p>
                            </div>
                            <button
                                className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                                disabled={!ruleSeason}
                                onClick={addRewardRule}
                                type="button"
                            >
                                <FaPlus aria-hidden="true" />
                                Add Rule
                            </button>
                        </div>

                        <div className="grid gap-3 p-5">
                            {rewardRules.map((rule, index) => (
                                <div className="grid grid-cols-[82px_minmax(0,1fr)_120px_38px] gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3 max-[720px]:grid-cols-1" key={`${index}-${rule.rankPosition}`}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Rank</span>
                                        <input className={controlClass} min="1" onChange={handleRewardRuleChange(index, 'rankPosition')} type="number" value={rule.rankPosition} />
                                    </label>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Reward</span>
                                        <input className={controlClass} onChange={handleRewardRuleChange(index, 'rewardName')} type="text" value={rule.rewardName} />
                                    </label>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Bonus Points</span>
                                        <input className={controlClass} min="0" onChange={handleRewardRuleChange(index, 'bonusPoints')} type="number" value={rule.bonusPoints} />
                                    </label>
                                    <button
                                        aria-label="Remove reward rule"
                                        className="mt-[22px] grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[#a4392f] transition-colors hover:border-[#a4392f] hover:bg-[#f3e1df] max-[720px]:mt-0"
                                        disabled={rewardRules.length === 1}
                                        onClick={() => removeRewardRule(index)}
                                        type="button"
                                    >
                                        <FaTrashAlt aria-hidden="true" />
                                    </button>
                                    <label className={`${fieldClass} col-span-4 max-[720px]:col-span-1`}>
                                        <span className={labelClass}>Description</span>
                                        <input className={controlClass} onChange={handleRewardRuleChange(index, 'rewardDescription')} type="text" value={rule.rewardDescription} />
                                    </label>
                                </div>
                            ))}

                            <button
                                className={`${actionButtonClass} w-fit bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] max-[720px]:w-full`}
                                disabled={!ruleSeason || savingRules || readSeasonField(ruleSeason, 'status') !== 'Draft'}
                                onClick={saveRewardRules}
                                type="button"
                            >
                                <FaCheck aria-hidden="true" />
                                {savingRules ? 'Saving...' : 'Save Reward Rules'}
                            </button>
                        </div>
                    </section>
                </section>

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
                                                        Rewards
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
                                                ) : seasonRewards.map((reward) => (
                                                    <div className="grid gap-1 px-4 py-3" key={readSeasonField(reward, 'seasonRewardId') || `${readSeasonField(reward, 'rankPosition')}-${readSeasonField(reward, 'spectatorId')}`}>
                                                        <strong className="text-[0.86rem] text-[var(--admin-ink)]">#{readSeasonField(reward, 'rankPosition')} - {readSeasonField(reward, 'spectatorName')}</strong>
                                                        <span className="text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                                            {readSeasonField(reward, 'rewardName')} | {readSeasonField(reward, 'bonusPoints')} bonus points
                                                        </span>
                                                        <span className="text-[0.78rem] font-semibold text-[var(--admin-muted)]">
                                                            Final points: {readSeasonField(reward, 'finalPoints')} | Status: {readSeasonField(reward, 'status')}
                                                        </span>
                                                    </div>
                                                ))}
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
