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
    showAdminError,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-7 px-11 py-10 max-[820px]:px-5 max-[820px]:py-7';
const panelClass = 'rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_32px_rgba(81,31,22,0.07)]';
const actionButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-[0.76rem] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ReadyToClaim', label: 'Ready To Claim' },
    { value: 'UnderReview', label: 'Under Review' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Rejected', label: 'Rejected' },
];

const statusClass = {
    Pending: 'bg-[#faf2e0] text-[#8a6209]',
    ReadyToClaim: 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]',
    UnderReview: 'bg-[#faf2e0] text-[#8a6209]',
    Paid: 'bg-[#e8f7ee] text-[#16864f]',
    Rejected: 'bg-[#f3e1df] text-[#a4392f]',
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
    const [inventory, setInventory] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState('');
    const [inventoryActionLoadingId, setInventoryActionLoadingId] = useState('');
    const [inventoryForm, setInventoryForm] = useState({
        name: '',
        sku: '',
        initialStock: 0,
        description: '',
        imageUrl: '',
    });

    const loadRewards = useCallback(async () => {
        setLoading(true);

        try {
            const payload = await adminApi.getAdminRewards(statusFilter || undefined);
            setRewards(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setRewards([]);
            showAdminError(err.message || 'Failed to load reward payments.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadRewards();
    }, [loadRewards]);

    const loadInventory = useCallback(async () => {
        setInventoryLoading(true);

        try {
            const payload = await adminApi.getRewardInventory();
            setInventory(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setInventory([]);
            showAdminError(err.message || 'Failed to load reward inventory.');
        } finally {
            setInventoryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

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

        try {
            const response = await copy.run();
            const successMessage = response?.message || response?.Message || copy.fallback;
            showAdminSuccess(successMessage, action === 'approve' ? 'Approved' : 'Rejected');
            await loadRewards();
        } catch (err) {
            showAdminError(err.message || `Failed to ${action} reward payment.`);
        } finally {
            setActionLoadingId('');
        }
    };

    const handleInventoryFormChange = (field) => (event) => {
        setInventoryForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleCreateInventoryItem = async (event) => {
        event.preventDefault();

        const name = inventoryForm.name.trim();
        const sku = inventoryForm.sku.trim();
        const initialStock = Number(inventoryForm.initialStock);

        if (!name || name.length > 200) {
            showAdminError('Reward item name is required and cannot exceed 200 characters.');
            return;
        }

        if (!sku || sku.length > 80) {
            showAdminError('Reward SKU is required and cannot exceed 80 characters.');
            return;
        }

        if (!Number.isInteger(initialStock) || initialStock < 0 || initialStock > 1000000) {
            showAdminError('Initial stock must be an integer between 0 and 1,000,000.');
            return;
        }

        if (inventoryForm.description.length > 1000 || inventoryForm.imageUrl.length > 500) {
            showAdminError('Inventory description or image URL is too long.');
            return;
        }

        setInventoryActionLoadingId('create');

        try {
            const response = await adminApi.createRewardInventoryItem({
                ...inventoryForm,
                name,
                sku,
                initialStock,
            });
            showAdminSuccess(response?.message || response?.Message || 'Reward item created.', 'Created');
            setInventoryForm({
                name: '',
                sku: '',
                initialStock: 0,
                description: '',
                imageUrl: '',
            });
            await loadInventory();
        } catch (err) {
            showAdminError(err.message || 'Failed to create reward item.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    const handleAdjustInventory = async (item) => {
        const itemId = readRewardField(item, 'rewardItemId');
        const quantityText = window.prompt('Quantity delta. Use negative number to reduce stock:', '1');

        if (!quantityText) {
            return;
        }

        const quantityDelta = Number(quantityText);

        if (!Number.isInteger(quantityDelta) || quantityDelta === 0 || quantityDelta < -1000000 || quantityDelta > 1000000) {
            showAdminError('Quantity delta must be a non-zero integer between -1,000,000 and 1,000,000.');
            return;
        }

        const note = window.prompt('Inventory adjustment note:');
        const trimmedNote = String(note || '').trim();

        if (note === null) {
            return;
        }

        if (trimmedNote.length < 3 || trimmedNote.length > 500) {
            showAdminError('Inventory note must be between 3 and 500 characters.');
            return;
        }

        setInventoryActionLoadingId(`adjust-${itemId}`);

        try {
            const response = await adminApi.adjustRewardInventory(itemId, {
                quantityDelta,
                note: trimmedNote,
            });
            showAdminSuccess(response?.message || response?.Message || 'Inventory adjusted.', 'Adjusted');
            await loadInventory();
        } catch (err) {
            showAdminError(err.message || 'Failed to adjust inventory.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    const handleSetInventoryActive = async (item, value) => {
        const itemId = readRewardField(item, 'rewardItemId');
        const confirmed = await confirmAdminAction({
            title: value ? 'Activate reward item' : 'Deactivate reward item',
            message: `${value ? 'Activate' : 'Deactivate'} "${readRewardField(item, 'name')}"?`,
            confirmLabel: value ? 'Activate' : 'Deactivate',
            tone: value ? 'primary' : 'danger',
        });

        if (!confirmed) {
            return;
        }

        setInventoryActionLoadingId(`active-${itemId}`);

        try {
            const response = await adminApi.setRewardInventoryActive(itemId, value);
            showAdminSuccess(response?.message || response?.Message || 'Reward item status updated.', 'Updated');
            await loadInventory();
        } catch (err) {
            showAdminError(err.message || 'Failed to update reward item status.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    const handleExpireOverdueRewards = async () => {
        const confirmed = await confirmAdminAction({
            title: 'Expire overdue rewards',
            message: 'Process all eligible rewards whose claim deadline has passed?',
            confirmLabel: 'Expire Overdue',
        });

        if (!confirmed) {
            return;
        }

        setInventoryActionLoadingId('expire');

        try {
            const response = await adminApi.expireOverdueRewards();
            showAdminSuccess(response?.message || response?.Message || 'Overdue rewards processed.', 'Processed');
            await Promise.all([loadInventory(), loadRewards()]);
        } catch (err) {
            showAdminError(err.message || 'Failed to expire overdue rewards.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    return (
        <AdminLayout activeKey="rewards" searchPlaceholder="Search reward payments...">
            <section className={pageShellClass}>
                <div className="flex items-start justify-between gap-4 max-[820px]:flex-col">
                    <div>
                        <h1 className="page-title">
                            Reward Payments
                        </h1>
                        <p className="page-subtitle">
                            Review owner prize claims and mark approved payments as paid.
                        </p>
                    </div>
                    <button
                        className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                        disabled={loading || inventoryLoading}
                        onClick={() => {
                            loadRewards();
                            loadInventory();
                        }}
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
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                    <FaDollarSign aria-hidden="true" />
                                </span>
                            </div>
                        </article>
                    ))}
                </section>

                <section className={panelClass}>
                    <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch">
                        <div>
                            <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Reward Inventory</h2>
                            <p className="m-0 mt-1 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                Manage physical season reward items and available stock.
                            </p>
                        </div>
                        <button
                            className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                            disabled={inventoryActionLoadingId === 'expire'}
                            onClick={handleExpireOverdueRewards}
                            type="button"
                        >
                            <FaSyncAlt aria-hidden="true" />
                            {inventoryActionLoadingId === 'expire' ? 'Processing...' : 'Expire Overdue'}
                        </button>
                    </div>

                    <form className="grid grid-cols-[minmax(0,1fr)_120px_110px_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 border-b border-[var(--admin-border)] p-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1" onSubmit={handleCreateInventoryItem}>
                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.84rem] font-bold outline-0" maxLength={200} onChange={handleInventoryFormChange('name')} placeholder="Reward item name" required type="text" value={inventoryForm.name} />
                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.84rem] font-bold uppercase outline-0" maxLength={80} onChange={handleInventoryFormChange('sku')} placeholder="SKU" required type="text" value={inventoryForm.sku} />
                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.84rem] font-bold outline-0" max="1000000" min="0" onChange={handleInventoryFormChange('initialStock')} required step="1" type="number" value={inventoryForm.initialStock} />
                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.84rem] font-bold outline-0" maxLength={1000} onChange={handleInventoryFormChange('description')} placeholder="Description" type="text" value={inventoryForm.description} />
                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.84rem] font-bold outline-0" maxLength={500} onChange={handleInventoryFormChange('imageUrl')} placeholder="Image URL" type="url" value={inventoryForm.imageUrl} />
                        <button className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`} disabled={inventoryActionLoadingId === 'create'} type="submit">
                            <FaCheck aria-hidden="true" />
                            {inventoryActionLoadingId === 'create' ? 'Creating...' : 'Create'}
                        </button>
                    </form>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse max-[980px]:min-w-[920px]">
                            <thead>
                                <tr>
                                    {['Item', 'SKU', 'Stock', 'Reserved', 'Delivered', 'Available', 'Status', 'Actions'].map((heading) => (
                                        <th className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-4 text-left text-[0.68rem] font-black uppercase text-[#64748b]" key={heading}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryLoading ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="8">Loading inventory...</td>
                                    </tr>
                                ) : inventory.length === 0 ? (
                                    <tr>
                                        <td className="px-5 py-8 text-center text-[0.9rem] font-bold text-[var(--admin-muted)]" colSpan="8">No reward inventory items found.</td>
                                    </tr>
                                ) : inventory.map((item) => {
                                    const itemId = readRewardField(item, 'rewardItemId');
                                    const isActive = Boolean(readRewardField(item, 'isActive'));

                                    return (
                                        <tr key={itemId}>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.88rem] font-black text-[var(--admin-ink)]">
                                                {readRewardField(item, 'name') || '-'}
                                                {readRewardField(item, 'description') && (
                                                    <span className="mt-1 block text-[0.72rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'description')}</span>
                                                )}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'sku') || '-'}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">{readRewardField(item, 'stockQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'reservedQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'deliveredQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">{readRewardField(item, 'availableQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${isActive ? 'bg-[#e8f7ee] text-[#16864f]' : 'bg-[#f3e1df] text-[#a4392f]'}`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={inventoryActionLoadingId !== ''} onClick={() => handleAdjustInventory(item)} type="button">
                                                        Adjust
                                                    </button>
                                                    <button className={`${actionButtonClass} ${isActive ? 'border border-[#f0b4b4] bg-white text-[#b91c1c] hover:bg-[#fff3f3]' : 'bg-[#e8f7ef] text-[var(--admin-primary)] hover:bg-[#d7f2e4]'}`} disabled={inventoryActionLoadingId !== ''} onClick={() => handleSetInventoryActive(item, !isActive)} type="button">
                                                        {isActive ? 'Deactivate' : 'Activate'}
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

                <section className={panelClass}>
                    <div className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch">
                        <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Payment Queue</h2>
                        <select
                            className="h-10 rounded-full border border-[var(--admin-border)] bg-white px-3 text-[0.82rem] font-bold text-[#5b403c] outline-0 transition-colors hover:border-[var(--admin-gold)]"
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
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${statusClass[status] || 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]'}`}>
                                                    {status ? status.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : '-'}
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
