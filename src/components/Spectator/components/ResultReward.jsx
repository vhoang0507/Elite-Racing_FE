import { useEffect, useState } from 'react';
import {
    FaCoins,
    FaGift,
    FaListOl,
    FaPercent,
} from 'react-icons/fa';

import { spectatorApi } from '../../../api/spectatorApi';
import { resolveFileUrl } from '../../../api/uploadApi';

const emptyClaimForm = {
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
};

const rewardTiePolicyText = 'Rankings compare season score, correct predictions, accuracy, and total predictions. If all four values are equal, spectators share the same rank and each receives the full reward for that rank. The next rank is skipped (for example: 1, 1, 3). Physical rewards require enough stock for every tied winner.';

function readField(item, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);
    return item?.[key] ?? item?.[pascalKey];
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

function statusBadgeClass(status) {
    if (status === 'Delivered' || status === 'Approved') return 'bg-[#e8f7ee] text-[#16864f]';
    if (status === 'Rejected' || status === 'Expired') return 'bg-[#f3e1df] text-[#a4392f]';
    if (status === 'Claimed' || status === 'Preparing') return 'bg-[#faf2e0] text-[#8a6209]';
    return 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]';
}

export default function ResultReward() {
    const [rewards, setRewards] = useState(null);
    const [season, setSeason] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claimReward, setClaimReward] = useState(null);
    const [claimForm, setClaimForm] = useState(emptyClaimForm);
    const [claimSaving, setClaimSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [rewardPayload, seasonPayload] = await Promise.all([
                spectatorApi.getSpectatorRewards().catch(() => null),
                spectatorApi.getCurrentSeason().catch(() => null),
            ]);
            setRewards(rewardPayload);
            setSeason(seasonPayload);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const hasActiveSeason = rewards?.hasActiveSeason ?? false;
    const bettingPoints = rewards?.bettingPoints ?? 0;
    const seasonScore = rewards?.seasonScore ?? rewards?.rewardPoints ?? 0;
    const netPoints = rewards?.netPoints ?? 0;
    const baseOpeningPoints = rewards?.baseOpeningPoints ?? 0;
    const carriedBonusPoints = rewards?.carriedBonusPoints ?? 0;
    const openingTotalPoints = rewards?.openingTotalPoints ?? 0;
    const historySeasonName = rewards?.historySeasonName ?? null;
    const accuracy = rewards?.predictionAccuracy ?? 0;
    const myRank = rewards?.myRank ?? null;
    const history = rewards?.pointHistory ?? [];
    const rewardRules = rewards?.activeRewardRules ?? [];
    const mySeasonRewards = rewards?.mySeasonRewards ?? [];
    const walletTransactions = rewards?.walletTransactions ?? [];

    const seasonPct = season?.daysLeft != null && season?.totalDays
        ? Math.max(0, Math.min(100, Math.round((1 - season.daysLeft / season.totalDays) * 100)))
        : null;

    const stats = [
        { label: 'Wallet Balance', value: bettingPoints, suffix: 'pts', icon: FaCoins, tone: 'gold' },
        { label: 'Season Score', value: seasonScore, suffix: 'pts', icon: FaCoins, tone: 'green' },
        { label: 'Prediction Accuracy', value: `${accuracy}%`, icon: FaPercent, tone: 'blue' },
        { label: 'My Season Rank', value: myRank ? `#${myRank}` : '-', icon: FaListOl, tone: '' },
    ];

    const openClaim = (reward) => {
        setClaimReward(reward);
        setClaimForm({
            receiverName: readField(reward, 'receiverName') || '',
            receiverPhone: readField(reward, 'receiverPhone') || '',
            deliveryAddress: readField(reward, 'deliveryAddress') || '',
        });
        setMessage('');
        setError('');
    };

    const handleClaimFieldChange = (field) => (event) => {
        setClaimForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const submitClaim = async (event) => {
        event.preventDefault();

        const receiverName = claimForm.receiverName.trim();
        const receiverPhone = claimForm.receiverPhone.trim();
        const deliveryAddress = claimForm.deliveryAddress.trim();

        if (receiverName.length < 2 || receiverName.length > 200) {
            setError('Receiver name must be between 2 and 200 characters.');
            return;
        }

        if (!/^[0-9+\-\s()]{8,30}$/.test(receiverPhone)) {
            setError('Receiver phone is invalid.');
            return;
        }

        if (deliveryAddress.length < 5 || deliveryAddress.length > 500) {
            setError('Delivery address must be between 5 and 500 characters.');
            return;
        }

        setClaimSaving(true);
        setError('');

        try {
            const response = await spectatorApi.claimSeasonReward(readField(claimReward, 'seasonRewardId'), {
                receiverName,
                receiverPhone,
                deliveryAddress,
            });
            setMessage(response?.message || response?.Message || 'Reward claim submitted successfully.');
            setClaimReward(null);
            setClaimForm(emptyClaimForm);
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to claim reward.');
        } finally {
            setClaimSaving(false);
        }
    };

    return (
        <div className="grid gap-7">
            <div>
                <h1 className="page-title">Results & Rewards</h1>
                <p className="page-subtitle">
                    Your prediction performance, season rewards, and point transactions.
                </p>
            </div>

            {message && (
                <div className="rounded-[8px] border border-[#bfe6d0] bg-[#e8f7ee] px-5 py-3 text-sm font-bold text-[#16864f]">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-[8px] border border-[#e3bcb7] bg-[#f3e1df] px-5 py-3 text-sm font-bold text-[#a4392f]">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="m-0 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>
            ) : (
                <>
                    <div className={`rounded-[8px] border px-5 py-4 text-sm font-semibold ${hasActiveSeason ? 'border-[#bfe6d0] bg-[#e8f7ee] text-[#145f3d]' : 'border-[var(--admin-border)] bg-[#fffaf8] text-[var(--admin-muted)]'}`}>
                        {hasActiveSeason ? (
                            <>
                                New-season opening wallet: <strong>{baseOpeningPoints.toLocaleString()} base</strong>
                                {' + '}<strong>{carriedBonusPoints.toLocaleString()} carry bonus</strong>
                                {' = '}<strong>{openingTotalPoints.toLocaleString()} points</strong>.
                                Season score starts from 0 and only increases from evaluated prediction results.
                            </>
                        ) : (
                            <>
                                No active season. The spendable wallet has been reset to <strong>0</strong>.
                                {historySeasonName ? ` Transactions and bet history below are from ${historySeasonName}.` : ''}
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <article key={stat.label} className="stat-card min-h-[110px]">
                                    <div className={`stat-icon ${stat.tone === 'gold' ? 'bg-[#faf2e0] text-[#8a6209]' : stat.tone === 'green' ? 'bg-[#e8f7ee] text-[#16864f]' : stat.tone === 'blue' ? 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]' : stat.tone === 'red' ? 'bg-[#f3e1df] text-[#a4392f]' : ''}`}>
                                        <Icon aria-hidden="true" />
                                    </div>
                                    <small className="stat-label">{stat.label}</small>
                                    <h3 className="stat-value text-[1.7rem]">
                                        {stat.value}{stat.suffix && <span className="text-[0.8rem] font-semibold text-[var(--admin-muted)]"> {stat.suffix}</span>}
                                    </h3>
                                </article>
                            );
                        })}
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <div className="surface-card p-5">
                            <h2 className="m-0 mb-4 text-[1.05rem] font-bold">Season Progress</h2>
                            {season ? (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Period</p>
                                            <p className="m-0 mt-1 font-bold">{formatDate(season.startDate)} - {formatDate(season.endDate)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="m-0 text-[2rem] font-black text-[var(--admin-primary)]">{season.daysLeft ?? '-'}</p>
                                            <p className="m-0 text-xs font-black uppercase text-[var(--admin-muted)]">Days Remaining</p>
                                        </div>
                                    </div>
                                    {seasonPct != null && (
                                        <div className="mt-5">
                                            <div className="mb-1 flex justify-between text-xs font-bold text-[var(--admin-muted)]">
                                                <span>Season elapsed</span>
                                                <span>{seasonPct}%</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-[#dce5ef]">
                                                <div className="h-full rounded-full bg-[var(--admin-primary)]" style={{ width: `${seasonPct}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="m-0 text-[var(--admin-muted)]">No active season. Wallet balance and season score remain 0 until the next season is activated.</p>
                            )}
                        </div>

                        <div className="surface-card p-5">
                            <h2 className="m-0 mb-1 text-[1.05rem] font-bold">Reward Rules</h2>
                            <p className="m-0 mb-3 text-[0.83rem] text-[var(--admin-muted)]">Current season prizes for top predictors.</p>
                            <div className="mb-4 rounded-[8px] border border-[#d9c58c] bg-[#fff8df] px-4 py-3 text-[0.78rem] font-semibold leading-relaxed text-[#6f5711]">
                                <strong>Tie policy:</strong> {rewardTiePolicyText}
                            </div>
                            <div className="grid gap-3">
                                {rewardRules.length === 0 ? (
                                    <p className="m-0 text-sm text-[var(--admin-muted)]">No reward rules configured for the active season.</p>
                                ) : rewardRules.map((rule) => (
                                    <div key={readField(rule, 'seasonRewardRuleId') || readField(rule, 'rankPosition')} className="flex items-center gap-3 rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-3">
                                        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                            <FaGift aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="m-0 font-bold text-[0.9rem]">Rank #{readField(rule, 'rankPosition')} - {readField(rule, 'rewardName')}</p>
                                            <p className="m-0 text-xs text-[var(--admin-muted)]">
                                                {readField(rule, 'bonusPoints') ?? 0} bonus points
                                                {readField(rule, 'rewardDescription') ? ` | ${readField(rule, 'rewardDescription')}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <section className="surface-card">
                        <div className="section-bar">
                            <h2 className="m-0 text-[1.05rem] font-bold">My Season Rewards</h2>
                            <span className="text-xs font-black text-[var(--admin-muted)]">{mySeasonRewards.length} reward{mySeasonRewards.length === 1 ? '' : 's'}</span>
                        </div>
                        {mySeasonRewards.length === 0 ? (
                            <div className="p-8 text-center text-[var(--admin-muted)]">No season rewards awarded yet.</div>
                        ) : (
                            <div className="grid gap-3 p-5">
                                {mySeasonRewards.map((reward) => {
                                    const rewardId = readField(reward, 'seasonRewardId');
                                    const imageUrl = readField(reward, 'rewardItemImageUrl');
                                    const status = readField(reward, 'status');

                                    return (
                                        <article className="grid gap-4 rounded-[8px] border border-[var(--admin-border)] bg-[#fffaf8] p-4 md:grid-cols-[80px_minmax(0,1fr)_auto]" key={rewardId}>
                                            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                                {imageUrl ? (
                                                    <img alt="" className="h-full w-full object-cover" src={resolveFileUrl(imageUrl)} />
                                                ) : (
                                                    <FaGift aria-hidden="true" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="m-0 text-[1rem] font-black text-[var(--admin-ink)]">
                                                    Rank #{readField(reward, 'rankPosition')} - {readField(reward, 'rewardName')}
                                                </h3>
                                                <p className="m-0 mt-1 text-sm font-semibold text-[var(--admin-muted)]">
                                                    {readField(reward, 'rewardItemName') || 'Bonus reward'} x{readField(reward, 'quantity') || 1} | {readField(reward, 'bonusPoints') || 0} bonus pts
                                                </p>
                                                <p className="m-0 mt-1 text-xs font-semibold text-[var(--admin-muted)]">
                                                    Awarded: {formatDate(readField(reward, 'awardedAt'))} | Claim deadline: {formatDate(readField(reward, 'claimDeadline'))}
                                                </p>
                                                <p className="m-0 mt-1 text-xs font-bold text-[var(--admin-primary)]">
                                                    {readField(reward, 'isBonusApplied')
                                                        ? `Bonus applied to season #${readField(reward, 'appliedToSeasonId')}`
                                                        : 'Bonus waiting for the next season activation'}
                                                </p>
                                                {readField(reward, 'adminNote') && (
                                                    <p className="m-0 mt-2 text-xs font-semibold text-[#a4392f]">{readField(reward, 'adminNote')}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start gap-2 md:items-end">
                                                <span className={`rounded-full px-3 py-1 text-xs font-black ${statusBadgeClass(status)}`}>{status || '-'}</span>
                                                {readField(reward, 'canClaim') && (
                                                    <button className="rounded-full bg-[var(--admin-primary)] px-4 py-2 text-xs font-black text-white" onClick={() => openClaim(reward)} type="button">
                                                        Claim
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="surface-card">
                        <div className="section-bar">
                            <div>
                                <h2 className="m-0 text-[1.05rem] font-bold">Point Transactions</h2>
                                {historySeasonName && <p className="m-0 mt-1 text-xs font-semibold text-[var(--admin-muted)]">{historySeasonName}</p>}
                            </div>
                            <span className="font-black" style={{ color: netPoints >= 0 ? '#16864f' : '#a4392f' }}>
                                Active-season net: {netPoints >= 0 ? '+' : ''}{netPoints} pts
                            </span>
                        </div>
                        {walletTransactions.length === 0 ? (
                            <div className="p-8 text-center text-[var(--admin-muted)]">No wallet transactions yet.</div>
                        ) : walletTransactions.slice(0, 20).map((item) => (
                            <div key={readField(item, 'pointTransactionId')} className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-3 last:border-b-0">
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 font-bold text-[0.9rem]">{readField(item, 'description') || readField(item, 'transactionType')}</p>
                                    <p className="m-0 text-xs text-[var(--admin-muted)]">
                                        {readField(item, 'seasonName') || historySeasonName || 'Season'} · {formatDate(readField(item, 'createdAt'))}
                                        {' · '}Balance {readField(item, 'balanceBefore')} → {readField(item, 'balanceAfter')}
                                    </p>
                                </div>
                                <span className="font-black" style={{ color: Number(readField(item, 'amount')) >= 0 ? '#16864f' : '#a4392f' }}>
                                    {Number(readField(item, 'amount')) >= 0 ? '+' : ''}{readField(item, 'amount')} pts
                                </span>
                            </div>
                        ))}
                    </section>

                    <div className="surface-card">
                        <div className="section-bar">
                            <h2 className="m-0 text-[1.05rem] font-bold">Bet History</h2>
                        </div>
                        {history.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="m-0 text-[var(--admin-muted)]">No bets placed yet. Make predictions to see your history.</p>
                            </div>
                        ) : history.map((item) => {
                            const won = item.isCorrect === true;
                            const lost = item.isCorrect === false;
                            const pending = !won && !lost;
                            const net = item.netPoints ?? (won ? item.payoutPoints - item.stakePoints : -(item.stakePoints ?? 0));
                            return (
                                <div key={item.predictionId ?? `${item.tournamentName}-${item.predictedHorseName}`} className="flex items-center gap-3 border-b border-[var(--admin-border)] px-5 py-3 last:border-b-0">
                                    <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-black ${won ? 'bg-[#e8f7ee] text-[#16864f]' : lost ? 'bg-[#f3e1df] text-[#a4392f]' : 'bg-[#faf2e0] text-[#8a6209]'}`}>
                                        {won ? 'W' : lost ? 'L' : 'P'}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="m-0 font-bold text-[0.9rem]">{item.tournamentName ?? item.raceName ?? 'Tournament'}</p>
                                        <p className="m-0 text-xs text-[var(--admin-muted)]">
                                            Pick: {item.predictedHorseName ?? '-'}
                                            {item.actualWinnerHorseName && ` | Winner: ${item.actualWinnerHorseName}`}
                                            {item.stakePoints > 0 && ` | Stake: ${item.stakePoints} pts`}
                                        </p>
                                    </div>
                                    <span className="font-black" style={{ color: pending ? '#8a6209' : net >= 0 ? '#16864f' : '#a4392f' }}>
                                        {pending ? '-' : `${net >= 0 ? '+' : ''}${net} pts`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {claimReward && (
                <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(15,23,42,0.42)] px-5 py-8" onClick={() => setClaimReward(null)} role="presentation">
                    <form className="grid w-[min(520px,100%)] gap-4 rounded-[8px] border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]" onClick={(event) => event.stopPropagation()} onSubmit={submitClaim}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="m-0 text-[1.2rem] font-black text-[var(--admin-ink)]">Claim Reward</h2>
                                <p className="m-0 mt-1 text-sm font-semibold text-[var(--admin-muted)]">{readField(claimReward, 'rewardName')}</p>
                            </div>
                            <button className="grid h-9 w-9 place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-primary)]" onClick={() => setClaimReward(null)} type="button">x</button>
                        </div>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Receiver Name</span>
                            <input className="rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none" maxLength={200} minLength={2} onChange={handleClaimFieldChange('receiverName')} required value={claimForm.receiverName} />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Receiver Phone</span>
                            <input className="rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none" maxLength={30} minLength={8} onChange={handleClaimFieldChange('receiverPhone')} required value={claimForm.receiverPhone} />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Delivery Address</span>
                            <textarea className="min-h-[96px] rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none" maxLength={500} minLength={5} onChange={handleClaimFieldChange('deliveryAddress')} required value={claimForm.deliveryAddress} />
                        </label>
                        <button className="rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white disabled:opacity-60" disabled={claimSaving} type="submit">
                            {claimSaving ? 'Submitting...' : 'Submit Claim'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
