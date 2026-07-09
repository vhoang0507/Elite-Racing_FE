import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaEye,
    FaGift,
    FaPlay,
    FaPlus,
    FaSave,
    FaSyncAlt,
    FaTimesCircle,
    FaTrophy,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import {
    confirmAdminAction,
    showAdminSuccess,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';
const panelTitleClass = 'flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-[22px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:py-4';
const inputClass = 'min-h-10 w-full rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.86rem] font-bold text-[var(--admin-ink)] outline-0 focus:border-[var(--admin-primary)]';
const actionButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.76rem] font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]';
const primaryButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--admin-primary)] px-4 font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60';
const mutedButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-60';
const tableHeaderClass = 'border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-[22px] py-[18px] text-left text-[0.7rem] uppercase text-[#64748b]';
const tableCellClass = 'border-b border-[var(--admin-border)] px-[22px] py-[18px] align-middle text-[0.88rem] font-bold text-[var(--admin-ink)]';

const statusClass = {
    active: 'bg-[#e8f7ee] text-[#16864f] before:bg-[#16864f]',
    ongoing: 'bg-[#e8f7ee] text-[#16864f] before:bg-[#16864f]',
    draft: 'bg-[#fff7db] text-[#a17809] before:bg-[#a17809]',
    closed: 'bg-[#f3e8e6] text-[#7f645f] before:bg-[#7f645f]',
    completed: 'bg-[#e9f1ff] text-[#2457a6] before:bg-[#2457a6]',
    inactive: 'bg-[#f3e8e6] text-[#7f645f] before:bg-[#7f645f]',
};

const emptyCreateForm = {
    seasonName: '',
    startDate: '',
    endDate: '',
};

const defaultRewardRules = [
    { rank: 1, rewardAmount: '' },
    { rank: 2, rewardAmount: '' },
    { rank: 3, rewardAmount: '' },
];

const readApiField = (item, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) => item?.[camelKey] ?? item?.[pascalKey];

const formatClass = (value) => String(value || '').toLowerCase();

const normalizeDateInput = (value) => {
    if (!value) {
        return '';
    }

    return String(value).split('T')[0];
};

const normalizeList = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    return payload?.items
        || payload?.data
        || payload?.leaderboard
        || payload?.Leaderboard
        || payload?.rewards
        || payload?.Rewards
        || payload?.rules
        || payload?.Rules
        || [];
};

const mapSeason = (season) => ({
    id: readApiField(season, 'seasonId') ?? readApiField(season, 'id'),
    name: readApiField(season, 'seasonName') ?? readApiField(season, 'name') ?? `Season #${readApiField(season, 'seasonId') ?? readApiField(season, 'id') ?? '-'}`,
    startDate: normalizeDateInput(readApiField(season, 'startDate')),
    endDate: normalizeDateInput(readApiField(season, 'endDate')),
    status: readApiField(season, 'status') || 'Draft',
});

const parseRewardValue = (value) => {
    const text = String(value ?? '').trim();
    const number = Number(text);

    return text !== '' && Number.isFinite(number) ? number : text;
};

const getRewardAmount = (reward) => (
    readApiField(reward, 'rewardAmount')
    ?? readApiField(reward, 'amount')
    ?? readApiField(reward, 'value')
    ?? readApiField(reward, 'points')
    ?? ''
);

const mapRewardRules = (payload) => {
    const list = normalizeList(payload);

    if (list.length === 0 && payload && typeof payload === 'object') {
        return defaultRewardRules.map((rule) => ({
            rank: rule.rank,
            rewardAmount: payload[`top${rule.rank}`] ?? payload[`Top${rule.rank}`] ?? '',
        }));
    }

    return defaultRewardRules.map((rule) => {
        const matched = list.find((item) => Number(readApiField(item, 'rank') ?? readApiField(item, 'position') ?? readApiField(item, 'place')) === rule.rank);

        return {
            rank: rule.rank,
            rewardAmount: matched ? getRewardAmount(matched) : '',
        };
    });
};

const matchesQuery = (season, query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return true;
    }

    return [
        season.name,
        season.startDate,
        season.endDate,
        season.status,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

const getLeaderboardName = (row) => (
    readApiField(row, 'horseName')
    ?? readApiField(row, 'ownerName')
    ?? readApiField(row, 'userName')
    ?? readApiField(row, 'name')
    ?? `Entry #${readApiField(row, 'id') ?? '-'}`
);

const getLeaderboardPoints = (row) => (
    readApiField(row, 'points')
    ?? readApiField(row, 'score')
    ?? readApiField(row, 'totalPoints')
    ?? readApiField(row, 'rewardPoints')
    ?? '-'
);

function SeasonManagement() {
    const [seasons, setSeasons] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [rewardRules, setRewardRules] = useState(defaultRewardRules);
    const [leaderboardRows, setLeaderboardRows] = useState([]);
    const [rewardRows, setRewardRows] = useState([]);
    const [detailMode, setDetailMode] = useState('rewards');
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionBusy, setActionBusy] = useState('');

    const loadSeasons = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await adminApi.getSeasons();
            setSeasons(normalizeList(payload).map(mapSeason));
        } catch (err) {
            setError(err.message || 'Failed to load seasons.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSeasons();
    }, [loadSeasons]);

    const filteredSeasons = useMemo(() => seasons.filter((season) => matchesQuery(season, query)), [query, seasons]);

    const handleCreateFormChange = (field) => (event) => {
        setCreateForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleRewardChange = (rank) => (event) => {
        setRewardRules((current) => current.map((rule) => (
            rule.rank === rank
                ? { ...rule, rewardAmount: event.target.value }
                : rule
        )));
    };

    const handleCreateSeason = async (event) => {
        event.preventDefault();

        const seasonName = createForm.seasonName.trim();

        if (!seasonName || !createForm.startDate || !createForm.endDate) {
            setError('Please enter season name, start date and end date.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Create season',
            message: `Are you sure you want to create "${seasonName}"?`,
            confirmLabel: 'Create',
        });

        if (!confirmed) {
            return;
        }

        setActionBusy('create');

        try {
            await adminApi.createSeason({
                seasonName,
                startDate: createForm.startDate,
                endDate: createForm.endDate,
            });
            setCreateForm(emptyCreateForm);
            await loadSeasons();
            showAdminSuccess('Season created successfully.', 'Created');
        } catch (err) {
            setError(err.message || 'Failed to create season.');
        } finally {
            setActionBusy('');
        }
    };

    const handleSeasonAction = async (season, action) => {
        const isActivate = action === 'activate';
        const confirmed = await confirmAdminAction({
            title: isActivate ? 'Activate season' : 'Close season',
            message: `Are you sure you want to ${isActivate ? 'activate' : 'close'} "${season.name}"?`,
            confirmLabel: isActivate ? 'Activate' : 'Close',
            tone: isActivate ? 'primary' : 'danger',
        });

        if (!confirmed) {
            return;
        }

        setActionBusy(`${action}-${season.id}`);

        try {
            if (isActivate) {
                await adminApi.activateSeason(season.id);
            } else {
                await adminApi.closeSeason(season.id);
            }

            await loadSeasons();
            showAdminSuccess(`Season ${isActivate ? 'activated' : 'closed'} successfully.`, 'Updated');
        } catch (err) {
            setError(err.message || `Failed to ${action} season.`);
        } finally {
            setActionBusy('');
        }
    };

    const handleEditRewards = async (season) => {
        setSelectedSeason(season);
        setDetailMode('rewards');
        setDetailLoading(true);
        setError('');

        try {
            const payload = await adminApi.getSeasonRewards(season.id);
            setRewardRows(normalizeList(payload));
            setRewardRules(mapRewardRules(payload));
        } catch (err) {
            setRewardRows([]);
            setRewardRules(defaultRewardRules);
            setError(err.message || 'Failed to load season rewards.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewLeaderboard = async (season) => {
        setSelectedSeason(season);
        setDetailMode('leaderboard');
        setDetailLoading(true);
        setError('');

        try {
            const payload = await adminApi.getSeasonLeaderboard(season.id);
            setLeaderboardRows(normalizeList(payload));
        } catch (err) {
            setLeaderboardRows([]);
            setError(err.message || 'Failed to load season leaderboard.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewRewards = async (season) => {
        setSelectedSeason(season);
        setDetailMode('reward-list');
        setDetailLoading(true);
        setError('');

        try {
            const payload = await adminApi.getSeasonRewards(season.id);
            setRewardRows(normalizeList(payload));
            setRewardRules(mapRewardRules(payload));
        } catch (err) {
            setRewardRows([]);
            setError(err.message || 'Failed to load season rewards.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSaveRewards = async (event) => {
        event.preventDefault();

        if (!selectedSeason?.id) {
            setError('Please choose a season before saving rewards.');
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Update reward rules',
            message: `Are you sure you want to update reward rules for "${selectedSeason.name}"?`,
            confirmLabel: 'Save',
        });

        if (!confirmed) {
            return;
        }

        setActionBusy(`rewards-${selectedSeason.id}`);

        try {
            const rules = rewardRules.map((rule) => ({
                rank: rule.rank,
                rewardAmount: parseRewardValue(rule.rewardAmount),
            }));

            await adminApi.updateSeasonRewardRules(selectedSeason.id, rules);
            showAdminSuccess('Season reward rules updated successfully.', 'Updated');
            await handleViewRewards(selectedSeason);
        } catch (err) {
            setError(err.message || 'Failed to update reward rules.');
        } finally {
            setActionBusy('');
        }
    };

    return (
        <AdminLayout
            activeKey="seasons"
            mainClassName="season-management-main"
            onSearchChange={setQuery}
            searchPlaceholder="Search seasons..."
            searchValue={query}
        >
            <section className={pageShellClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Season Management
                        </h1>
                    </div>
                    <button className={mutedButtonClass} disabled={loading} onClick={loadSeasons} type="button">
                        <FaSyncAlt aria-hidden="true" />
                        <span>Refresh</span>
                    </button>
                </div>

                {error && (
                    <div className="rounded-md border border-[#f0b8ad] bg-[#fff8f6] px-4 py-3 text-[0.86rem] font-bold text-[#b91c1c]">
                        {error}
                    </div>
                )}

                <section className="grid grid-cols-[minmax(0,1fr)_360px] gap-7 max-[1180px]:grid-cols-1">
                    <div className="grid gap-7">
                        <section className={panelClass}>
                            <div className={panelTitleClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Season List</h2>
                                <span className="text-[0.8rem] font-black uppercase text-[#64748b]">{filteredSeasons.length} records</span>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse max-[920px]:min-w-[920px]">
                                    <thead>
                                        <tr>
                                            {['Season Name', 'Start Date', 'End Date', 'Status', 'Actions'].map((heading) => (
                                                <th className={tableHeaderClass} key={heading}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td className={tableCellClass} colSpan={5}>Loading seasons...</td>
                                            </tr>
                                        )}

                                        {!loading && filteredSeasons.length === 0 && (
                                            <tr>
                                                <td className={tableCellClass} colSpan={5}>No seasons found.</td>
                                            </tr>
                                        )}

                                        {!loading && filteredSeasons.map((season) => {
                                            const normalizedStatus = formatClass(season.status);

                                            return (
                                                <tr key={season.id || season.name}>
                                                    <td className={tableCellClass}>{season.name}</td>
                                                    <td className={tableCellClass}>{adminApi.formatters.toDateLabel(season.startDate) || '-'}</td>
                                                    <td className={tableCellClass}>{adminApi.formatters.toDateLabel(season.endDate) || '-'}</td>
                                                    <td className={tableCellClass}>
                                                        <span className={`relative inline-flex min-h-6 items-center rounded px-2.5 pl-5 text-[0.68rem] font-black uppercase before:absolute before:left-2 before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${statusClass[normalizedStatus] || statusClass.draft}`}>
                                                            {season.status}
                                                        </span>
                                                    </td>
                                                    <td className={tableCellClass}>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button className={actionButtonClass} onClick={() => handleEditRewards(season)} type="button">
                                                                <FaGift aria-hidden="true" />
                                                                <span>Edit Rewards</span>
                                                            </button>
                                                            <button className={actionButtonClass} disabled={actionBusy === `activate-${season.id}`} onClick={() => handleSeasonAction(season, 'activate')} type="button">
                                                                <FaPlay aria-hidden="true" />
                                                                <span>Activate</span>
                                                            </button>
                                                            <button className={actionButtonClass} disabled={actionBusy === `close-${season.id}`} onClick={() => handleSeasonAction(season, 'close')} type="button">
                                                                <FaTimesCircle aria-hidden="true" />
                                                                <span>Close</span>
                                                            </button>
                                                            <button className={actionButtonClass} onClick={() => handleViewLeaderboard(season)} type="button">
                                                                <FaTrophy aria-hidden="true" />
                                                                <span>View Leaderboard</span>
                                                            </button>
                                                            <button className={actionButtonClass} onClick={() => handleViewRewards(season)} type="button">
                                                                <FaEye aria-hidden="true" />
                                                                <span>View Rewards</span>
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
                    </div>

                    <aside className="grid content-start gap-7">
                        <section className={panelClass}>
                            <div className={panelTitleClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Create Season</h2>
                            </div>

                            <form className="grid gap-4 p-5" onSubmit={handleCreateSeason}>
                                <label className="grid gap-2 text-[0.78rem] font-black uppercase text-[#64748b]">
                                    <span>Season Name</span>
                                    <input className={inputClass} onChange={handleCreateFormChange('seasonName')} type="text" value={createForm.seasonName} />
                                </label>
                                <label className="grid gap-2 text-[0.78rem] font-black uppercase text-[#64748b]">
                                    <span>Start Date</span>
                                    <input className={inputClass} onChange={handleCreateFormChange('startDate')} type="date" value={createForm.startDate} />
                                </label>
                                <label className="grid gap-2 text-[0.78rem] font-black uppercase text-[#64748b]">
                                    <span>End Date</span>
                                    <input className={inputClass} onChange={handleCreateFormChange('endDate')} type="date" value={createForm.endDate} />
                                </label>
                                <button className={primaryButtonClass} disabled={actionBusy === 'create'} type="submit">
                                    <FaPlus aria-hidden="true" />
                                    <span>Create Season</span>
                                </button>
                            </form>
                        </section>

                        <section className={panelClass}>
                            <div className={panelTitleClass}>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Reward Rules</h2>
                                {selectedSeason && (
                                    <span className="text-[0.8rem] font-black text-[var(--admin-primary)]">{selectedSeason.name}</span>
                                )}
                            </div>

                            <form className="grid gap-4 p-5" onSubmit={handleSaveRewards}>
                                {rewardRules.map((rule) => (
                                    <label className="grid gap-2 text-[0.78rem] font-black uppercase text-[#64748b]" key={rule.rank}>
                                        <span>Top {rule.rank}</span>
                                        <input className={inputClass} onChange={handleRewardChange(rule.rank)} type="text" value={rule.rewardAmount} />
                                    </label>
                                ))}
                                <button className={primaryButtonClass} disabled={!selectedSeason || actionBusy === `rewards-${selectedSeason?.id}`} type="submit">
                                    <FaSave aria-hidden="true" />
                                    <span>Save Rewards</span>
                                </button>
                            </form>
                        </section>

                        {selectedSeason && (
                            <section className={panelClass}>
                                <div className={panelTitleClass}>
                                    <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">
                                        {detailMode === 'leaderboard' ? 'Leaderboard' : 'Rewards'}
                                    </h2>
                                </div>

                                <div className="grid gap-3 p-5">
                                    {detailLoading && (
                                        <div className="text-[0.86rem] font-bold text-[var(--admin-muted)]">Loading...</div>
                                    )}

                                    {!detailLoading && detailMode === 'leaderboard' && leaderboardRows.length === 0 && (
                                        <div className="text-[0.86rem] font-bold text-[var(--admin-muted)]">No leaderboard rows.</div>
                                    )}

                                    {!detailLoading && detailMode === 'leaderboard' && leaderboardRows.map((row, index) => (
                                        <article className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3" key={readApiField(row, 'id') ?? index}>
                                            <strong className="grid h-9 w-9 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                                {readApiField(row, 'rank') ?? readApiField(row, 'position') ?? index + 1}
                                            </strong>
                                            <span className="min-w-0 truncate font-bold text-[var(--admin-ink)]">{getLeaderboardName(row)}</span>
                                            <span className="font-black text-[var(--admin-primary-dark)]">{getLeaderboardPoints(row)}</span>
                                        </article>
                                    ))}

                                    {!detailLoading && detailMode !== 'leaderboard' && rewardRows.length === 0 && (
                                        <div className="text-[0.86rem] font-bold text-[var(--admin-muted)]">No rewards found.</div>
                                    )}

                                    {!detailLoading && detailMode !== 'leaderboard' && rewardRows.map((row, index) => (
                                        <article className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-3" key={readApiField(row, 'id') ?? index}>
                                            <strong className="grid h-9 w-9 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                                {readApiField(row, 'rank') ?? readApiField(row, 'position') ?? index + 1}
                                            </strong>
                                            <span className="min-w-0 truncate font-bold text-[var(--admin-ink)]">{getRewardAmount(row) || '-'}</span>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </section>
            </section>
        </AdminLayout>
    );
}

export default SeasonManagement;
