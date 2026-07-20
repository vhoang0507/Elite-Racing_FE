import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaClock, FaMoneyBillWave, FaTrophy } from 'react-icons/fa';

import { jockeyApi } from '../../api/jockeyApi';
import { formatCurrency } from '../../utils/currency';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';
import JockeyLayout from './JockeyLayout';

const statusTone = {
    ReadyToClaim: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    UnderReview: 'bg-[#faf2e0] text-[#8a6209]',
    Paid: 'bg-[#e8f7ee] text-[#16864f]',
    Rejected: 'bg-[#f3e1df] text-[#a4392f]',
};

function formatStatus(value) {
    return value ? value.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : '-';
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

function StatCard({ icon, label, value, tone }) {
    return (
        <article className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
                {createElement(icon, { 'aria-hidden': true })}
            </span>
            <div>
                <p className="m-0 text-[0.68rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">{label}</p>
                <p className="m-0 mt-1 text-[1.35rem] font-black text-[var(--admin-primary-dark)]">{value}</p>
            </div>
        </article>
    );
}

export default function JockeyRewards() {
    const [summary, setSummary] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryPayload, rewardPayload] = await Promise.all([
                jockeyApi.getJockeyRewardSummary(),
                jockeyApi.getJockeyRewards(100),
            ]);
            setSummary(summaryPayload ?? null);
            setRewards(Array.isArray(rewardPayload) ? rewardPayload : []);
        } catch (error) {
            setSummary(null);
            setRewards([]);
            showToast(error.message || 'Failed to load jockey rewards.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const readyCount = useMemo(
        () => rewards.filter((item) => item.status === 'ReadyToClaim').length,
        [rewards],
    );

    const handleClaim = async (prizePayoutId) => {
        setClaimingId(prizePayoutId);
        try {
            const response = await jockeyApi.claimJockeyReward(prizePayoutId);
            showToast(response?.message || 'Jockey payout claim submitted.', 'success', 'Claim Submitted');
            await loadData();
        } catch (error) {
            showToast(error.message || 'Failed to claim jockey payout.', 'error');
        } finally {
            setClaimingId(null);
        }
    };

    return (
        <JockeyLayout activeKey="rewards">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h1 className="m-0 text-[1.8rem] font-black text-[var(--admin-primary-dark)]">Result & Reward</h1>
                    <p className="m-0 mt-1 text-[0.85rem] font-semibold text-[var(--admin-muted)]">
                        Track your jockey share from each published race and submit payout claims.
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[580px]:grid-cols-1">
                    <StatCard icon={FaMoneyBillWave} label="Total Earned" value={loading ? '...' : formatCurrency(summary?.totalPrizeEarned ?? 0)} tone="bg-[#faf2e0] text-[#8a6209]" />
                    <StatCard icon={FaCheckCircle} label="Paid" value={loading ? '...' : formatCurrency(summary?.paidAmount ?? 0)} tone="bg-[#e8f7ee] text-[#16864f]" />
                    <StatCard icon={FaClock} label="Under Review" value={loading ? '...' : formatCurrency(summary?.pendingAmount ?? 0)} tone="bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]" />
                    <StatCard icon={FaTrophy} label="Race Wins" value={loading ? '...' : (summary?.raceWins ?? 0)} tone="bg-[#f3e9ff] text-[#7445a8]" />
                </div>

                <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                    <header className="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
                        <div>
                            <h2 className="m-0 text-[1.05rem] font-black text-[var(--admin-ink)]">Jockey Payouts</h2>
                            <p className="m-0 mt-1 text-[0.75rem] font-semibold text-[var(--admin-muted)]">{readyCount} payout(s) ready to claim</p>
                        </div>
                    </header>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse">
                            <thead>
                                <tr>
                                    {['Tournament', 'Horse / Owner', 'Rank', 'Total Prize', 'Jockey Share', 'Status', 'Payment Ref.', 'Action'].map((heading) => (
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 text-left text-[0.68rem] font-black uppercase text-[#64748b]" key={heading}>{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td className="px-5 py-10 text-center font-bold text-[var(--admin-muted)]" colSpan="8">Loading jockey payouts...</td></tr>
                                ) : rewards.length === 0 ? (
                                    <tr><td className="px-5 py-10 text-center font-bold text-[var(--admin-muted)]" colSpan="8">No jockey payouts yet.</td></tr>
                                ) : rewards.map((reward) => (
                                    <tr key={reward.prizePayoutId} className="hover:bg-[#fffaf8]">
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                            <strong className="block text-[0.86rem] text-[var(--admin-ink)]">{reward.tournamentName}</strong>
                                            <span className="text-[0.72rem] font-semibold text-[var(--admin-muted)]">{formatDate(reward.raceDate)}</span>
                                        </td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                            <strong className="block text-[0.84rem] text-[var(--admin-ink)]">{reward.horseName}</strong>
                                            <span className="text-[0.72rem] font-semibold text-[var(--admin-muted)]">Owner: {reward.ownerName}</span>
                                        </td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4 font-black text-[var(--admin-primary-dark)]">#{reward.rankPosition}</td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4 font-bold text-[var(--admin-muted)]">{formatCurrency(reward.totalPrizeAmount ?? 0)}</td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4 font-black text-[var(--admin-primary-dark)]">{formatCurrency(reward.payoutAmount ?? 0)}</td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-black ${statusTone[reward.status] || 'bg-slate-100 text-slate-600'}`}>{formatStatus(reward.status)}</span>
                                        </td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.76rem] font-bold text-[var(--admin-muted)]">{reward.paymentReference || '-'}</td>
                                        <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                            {reward.canClaim ? (
                                                <button className="rounded-full bg-[var(--admin-primary)] px-4 py-2 text-[0.75rem] font-black text-white disabled:opacity-60" disabled={claimingId === reward.prizePayoutId} onClick={() => handleClaim(reward.prizePayoutId)} type="button">
                                                    {claimingId === reward.prizePayoutId ? 'Submitting...' : 'Claim'}
                                                </button>
                                            ) : (
                                                <span className="text-[0.72rem] font-bold text-[var(--admin-muted)]">{reward.status === 'Paid' ? 'Completed' : formatStatus(reward.status)}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>

            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} duration={3500} />
        </JockeyLayout>
    );
}
