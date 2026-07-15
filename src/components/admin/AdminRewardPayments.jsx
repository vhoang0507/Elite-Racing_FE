import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaCheck,
    FaDollarSign,
    FaSyncAlt,
    FaTimes,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import {
    confirmAdminAction,
    showAdminSuccess,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]';
const actionButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 text-[0.76rem] font-black disabled:cursor-not-allowed disabled:opacity-60';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ReadyToClaim', label: 'Ready To Claim' },
    { value: 'UnderReview', label: 'Under Review' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Rejected', label: 'Rejected' },
];

const statusClass = {
    ReadyToClaim: 'bg-[#eff6ff] text-[#1d4ed8]',
    UnderReview: 'bg-[#fef3c7] text-[#92400e]',
    Paid: 'bg-[#dcfce7] text-[#15803d]',
    Rejected: 'bg-[#fee2e2] text-[#b91c1c]',
};

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function readRewardField(reward, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return reward?.[key] ?? reward?.[pascalKey];
}

function AdminRewardPayments() {
    const [rewards, setRewards] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState('');

    const loadRewards = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const payload = await adminApi.getAdminRewards(statusFilter || undefined);
            setRewards(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setRewards([]);
            setError(err.message || 'Failed to load reward payments.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadRewards();
    }, [loadRewards]);

    const stats = useMemo(() => {
        const countByStatus = (status) => rewards.filter((reward) => readRewardField(reward, 'status') === status).length;

        return [
            { label: 'Total Rewards', value: rewards.length },
            { label: 'Under Review', value: countByStatus('UnderReview') },
            { label: 'Paid', value: countByStatus('Paid') },
            { label: 'Rejected', value: countByStatus('Rejected') },
        ];
    }, [rewards]);

    const handlePaymentAction = async (reward, action) => {
        const id = readRewardField(reward, 'prizeAwardId');
        const ownerName = readRewardField(reward, 'ownerName') || 'this owner';
        const copy = action === 'approve'
            ? {
                title: 'Approve reward payment',
                message: `Mark reward payment for ${ownerName} as paid?`,
                confirmLabel: 'Approve Payment',
                run: () => adminApi.approveRewardPayment(id),
                fallback: 'Reward payment approved successfully.',
            }
            : {
                title: 'Reject reward payment',
                message: `Reject reward payment for ${ownerName}?`,
                confirmLabel: 'Reject Payment',
                tone: 'danger',
                run: () => adminApi.rejectRewardPayment(id),
                fallback: 'Reward payment rejected successfully.',
            };

        const confirmed = await confirmAdminAction({
            title: copy.title,
            message: copy.message,
            confirmLabel: copy.confirmLabel,
            tone: copy.tone || 'primary',
        });

        if (!confirmed) {
            return;
        }

        setActionLoadingId(`${action}-${id}`);
        setError('');

        try {
            const response = await copy.run();
            const successMessage = response?.message || response?.Message || copy.fallback;
            showAdminSuccess(successMessage, action === 'approve' ? 'Approved' : 'Rejected');
            await loadRewards();
        } catch (err) {
            setError(err.message || `Failed to ${action} reward payment.`);
        } finally {
            setActionLoadingId('');
        }
    };

    return (
        <AdminLayout activeKey="rewards" searchPlaceholder="Search reward payments...">
            <section className={pageShellClass}>
                <div className="flex items-start justify-between gap-4 max-[820px]:flex-col">
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Reward Payments
                        </h1>
                        <p className="mt-2 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                            Review owner prize claims and mark approved payments as paid.
                        </p>
                    </div>
                    <button
                        className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                        disabled={loading}
                        onClick={loadRewards}
                        type="button"
                    >
                        <FaSyncAlt aria-hidden="true" />
                        Refresh
                    </button>
                </div>

                <section aria-label="Reward payment summary" className="grid grid-cols-4 gap-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {stats.map((stat) => (
                        <article className={panelClass} key={stat.label}>
                            <div className="flex min-h-[108px] items-start justify-between gap-3 px-5 py-5">
                                <div>
                                    <span className="block text-[0.72rem] font-black uppercase text-[#64748b]">{stat.label}</span>
                                    <strong className="mt-3 block text-[2rem] leading-none text-[var(--admin-primary-dark)]">{stat.value}</strong>
                                </div>
                                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                                    <FaDollarSign aria-hidden="true" />
                                </span>
                            </div>
                        </article>
                    ))}
                </section>

                {error && (
                    <section className="rounded-md border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.86rem] font-bold text-[var(--admin-primary)]">
                        {error}
                    </section>
                )}

                <section className={panelClass}>
                    <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch">
                        <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Payment Queue</h2>
                        <select
                            className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.82rem] font-bold text-[#5b403c] outline-0"
                            onChange={(event) => setStatusFilter(event.target.value)}
                            value={statusFilter}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse max-[980px]:min-w-[1040px]">
                            <thead>
                                <tr>
                                    {['Tournament', 'Owner', 'Horse', 'Rank', 'Prize', 'Status', 'Paid At', 'Actions'].map((heading) => (
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 text-left text-[0.68rem] font-black uppercase text-[#64748b]" key={heading}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="8">Loading reward payments...</td>
                                    </tr>
                                ) : rewards.length === 0 ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="8">No reward payments found.</td>
                                    </tr>
                                ) : rewards.map((reward) => {
                                    const id = readRewardField(reward, 'prizeAwardId');
                                    const status = readRewardField(reward, 'status');
                                    const canReview = status === 'UnderReview';

                                    return (
                                        <tr key={id}>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.88rem] font-black text-[var(--admin-ink)]">
                                                {readRewardField(reward, 'tournamentName') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">
                                                {readRewardField(reward, 'ownerName') || `Owner #${readRewardField(reward, 'ownerId') || '-'}`}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">
                                                {readRewardField(reward, 'horseName') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">
                                                #{readRewardField(reward, 'rankPosition') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">
                                                {adminApi.formatters.toMoney(readRewardField(reward, 'prizeAmount') || 0)}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${statusClass[status] || 'bg-[#f3f4f6] text-[#374151]'}`}>
                                                    {status || '-'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-4 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                                {formatDateTime(readRewardField(reward, 'paidAt'))}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        className={`${actionButtonClass} bg-[#e8f7ef] text-[var(--admin-primary)] hover:bg-[#d7f2e4]`}
                                                        disabled={!canReview || actionLoadingId === `approve-${id}`}
                                                        onClick={() => handlePaymentAction(reward, 'approve')}
                                                        type="button"
                                                    >
                                                        <FaCheck aria-hidden="true" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={`${actionButtonClass} border border-[#f0b4b4] bg-white text-[#b91c1c] hover:bg-[#fff3f3]`}
                                                        disabled={!canReview || actionLoadingId === `reject-${id}`}
                                                        onClick={() => handlePaymentAction(reward, 'reject')}
                                                        type="button"
                                                    >
                                                        <FaTimes aria-hidden="true" />
                                                        Reject
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
            </section>
        </AdminLayout>
    );
}

export default AdminRewardPayments;
