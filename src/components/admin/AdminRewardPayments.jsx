import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    FaBoxOpen,
    FaCheck,
    FaDollarSign,
    FaGift,
    FaImage,
    FaPlus,
    FaPen,
    FaSyncAlt,
    FaTimes,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';
import { resolveFileUrl, uploadFile } from '../../api/uploadApi';
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

function readRewardField(reward, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return reward?.[key] ?? reward?.[pascalKey];
}

function stockTone(available) {
    if (available <= 0) return { badge: 'bg-[#f3e1df] text-[#a4392f]', label: 'Out of stock' };
    if (available <= 5) return { badge: 'bg-[#faf2e0] text-[#8a6209]', label: 'Low stock' };
    return { badge: 'bg-[#e8f7ee] text-[#16864f]', label: 'In stock' };
}

const emptyInventoryForm = {
    name: '',
    sku: '',
    initialStock: 0,
    description: '',
    imageUrl: '',
};

function AdminRewardPayments() {
    const [rewards, setRewards] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState('');
    const [inventoryActionLoadingId, setInventoryActionLoadingId] = useState('');
    const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
    const [inventoryImageFile, setInventoryImageFile] = useState(null);
    const [inventoryImagePreviewUrl, setInventoryImagePreviewUrl] = useState('');
    const [showInventoryForm, setShowInventoryForm] = useState(false);
    const [imagePreviewBroken, setImagePreviewBroken] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreviewUrl, setEditImagePreviewUrl] = useState('');
    const [editImagePreviewBroken, setEditImagePreviewBroken] = useState(false);
    const [adjustModal, setAdjustModal] = useState(null);

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

    useEffect(() => () => {
        if (inventoryImagePreviewUrl) {
            URL.revokeObjectURL(inventoryImagePreviewUrl);
        }
    }, [inventoryImagePreviewUrl]);

    useEffect(() => () => {
        if (editImagePreviewUrl) {
            URL.revokeObjectURL(editImagePreviewUrl);
        }
    }, [editImagePreviewUrl]);

    const stats = useMemo(() => {
        const countByStatus = (status) => rewards.filter((reward) => readRewardField(reward, 'status') === status).length;

        return [
            { label: 'Total Payouts', value: rewards.length },
            { label: 'Under Review', value: countByStatus('UnderReview') },
            { label: 'Paid', value: countByStatus('Paid') },
            { label: 'Rejected', value: countByStatus('Rejected') },
        ];
    }, [rewards]);

    const handlePaymentAction = async (reward, action) => {
        const id = readRewardField(reward, 'prizePayoutId');
        const recipientName = readRewardField(reward, 'recipientName') || 'this recipient';
        const recipientType = readRewardField(reward, 'recipientType') || 'recipient';
        const copy = action === 'approve'
            ? {
                title: 'Approve reward payment',
                message: `Mark the ${recipientType.toLowerCase()} payout for ${recipientName} as paid?`,
                confirmLabel: 'Approve Payment',
                run: async () => {
                    const paymentReference = window.prompt('Enter the bank transfer or payment gateway reference:');
                    if (!paymentReference?.trim()) {
                        throw new Error('Payment reference is required before marking a payout as paid.');
                    }
                    return adminApi.approveRewardPayment(id, { paymentReference: paymentReference.trim() });
                },
                fallback: 'Reward payment approved successfully.',
            }
            : {
                title: 'Reject reward payment',
                message: `Reject the ${recipientType.toLowerCase()} payout for ${recipientName}?`,
                confirmLabel: 'Reject Payment',
                tone: 'danger',
                run: async () => {
                    const adminNote = window.prompt('Reason for rejection (optional):') || '';
                    return adminApi.rejectRewardPayment(id, { adminNote });
                },
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

    const resetInventoryCreateForm = () => {
        setInventoryForm(emptyInventoryForm);
        setInventoryImageFile(null);
        setInventoryImagePreviewUrl('');
        setImagePreviewBroken(false);
    };

    const handleInventoryImageChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setInventoryImageFile(null);
            setInventoryImagePreviewUrl('');
            setImagePreviewBroken(false);
            return;
        }

        const allowedTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
        ]);
        const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedTypes.has(file.type) && !allowedExtensions.has(extension)) {
            event.target.value = '';
            setInventoryImageFile(null);
            setInventoryImagePreviewUrl('');
            showAdminError('Reward image must be a JPG, PNG, or WEBP file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            event.target.value = '';
            setInventoryImageFile(null);
            setInventoryImagePreviewUrl('');
            showAdminError('Reward image cannot exceed 5MB.');
            return;
        }

        setInventoryImageFile(file);
        setInventoryImagePreviewUrl(URL.createObjectURL(file));
        setImagePreviewBroken(false);
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

        if (inventoryForm.description.length > 1000) {
            showAdminError('Inventory description cannot exceed 1,000 characters.');
            return;
        }

        setInventoryActionLoadingId('create');

        try {
            let imageUrl = '';

            if (inventoryImageFile) {
                const uploadResponse = await uploadFile(inventoryImageFile, 'rewards');
                imageUrl = uploadResponse?.url
                    || uploadResponse?.Url
                    || uploadResponse?.absoluteUrl
                    || uploadResponse?.AbsoluteUrl
                    || '';

                if (!imageUrl) {
                    throw new Error('The image was uploaded, but the server did not return its URL.');
                }
            }

            const response = await adminApi.createRewardInventoryItem({
                ...inventoryForm,
                name,
                sku,
                initialStock,
                imageUrl,
            });
            showAdminSuccess(response?.message || response?.Message || 'Reward item created.', 'Created');
            resetInventoryCreateForm();
            setShowInventoryForm(false);
            await loadInventory();
        } catch (err) {
            showAdminError(err.message || 'Failed to create reward item.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    const closeEditModal = () => {
        setEditModal(null);
        setEditImageFile(null);
        setEditImagePreviewUrl('');
        setEditImagePreviewBroken(false);
    };

    const openEditModal = (item) => {
        setEditModal({
            item,
            name: String(readRewardField(item, 'name') || ''),
            sku: String(readRewardField(item, 'sku') || ''),
            description: String(readRewardField(item, 'description') || ''),
            imageUrl: String(readRewardField(item, 'imageUrl') || ''),
            rowVersion: String(readRewardField(item, 'rowVersion') || ''),
        });
        setEditImageFile(null);
        setEditImagePreviewUrl('');
        setEditImagePreviewBroken(false);
    };

    const handleEditModalChange = (field) => (event) => {
        setEditModal((current) => (current
            ? { ...current, [field]: event.target.value }
            : current));
    };

    const handleEditImageChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setEditImageFile(null);
            setEditImagePreviewUrl('');
            setEditImagePreviewBroken(false);
            return;
        }

        const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
        const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedTypes.has(file.type) && !allowedExtensions.has(extension)) {
            event.target.value = '';
            setEditImageFile(null);
            setEditImagePreviewUrl('');
            showAdminError('Reward image must be a JPG, PNG, or WEBP file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            event.target.value = '';
            setEditImageFile(null);
            setEditImagePreviewUrl('');
            showAdminError('Reward image cannot exceed 5MB.');
            return;
        }

        setEditImageFile(file);
        setEditImagePreviewUrl(URL.createObjectURL(file));
        setEditImagePreviewBroken(false);
    };

    const removeEditImage = () => {
        setEditModal((current) => (current ? { ...current, imageUrl: '' } : current));
        setEditImageFile(null);
        setEditImagePreviewUrl('');
        setEditImagePreviewBroken(false);
    };

    const submitEditModal = async (event) => {
        event.preventDefault();

        if (!editModal) {
            return;
        }

        const itemId = readRewardField(editModal.item, 'rewardItemId');
        const name = editModal.name.trim();
        const sku = editModal.sku.trim();
        const description = editModal.description.trim();

        if (!name || name.length > 200) {
            showAdminError('Reward item name is required and cannot exceed 200 characters.');
            return;
        }

        if (!sku || sku.length > 80) {
            showAdminError('Reward SKU is required and cannot exceed 80 characters.');
            return;
        }

        if (description.length > 1000) {
            showAdminError('Inventory description cannot exceed 1,000 characters.');
            return;
        }

        if (!editModal.rowVersion) {
            showAdminError('The item version is missing. Refresh the inventory and try again.');
            return;
        }

        setInventoryActionLoadingId(`edit-${itemId}`);

        try {
            let imageUrl = editModal.imageUrl;

            if (editImageFile) {
                const uploadResponse = await uploadFile(editImageFile, 'rewards');
                imageUrl = uploadResponse?.url
                    || uploadResponse?.Url
                    || uploadResponse?.absoluteUrl
                    || uploadResponse?.AbsoluteUrl
                    || '';

                if (!imageUrl) {
                    throw new Error('The image was uploaded, but the server did not return its URL.');
                }
            }

            const response = await adminApi.updateRewardInventoryItem(itemId, {
                name,
                sku,
                description,
                imageUrl,
                rowVersion: editModal.rowVersion,
            });

            showAdminSuccess(
                response?.message || response?.Message || 'Reward item information updated.',
                'Updated',
            );
            closeEditModal();
            await loadInventory();
        } catch (err) {
            showAdminError(err.message || 'Failed to update reward item information.');
        } finally {
            setInventoryActionLoadingId('');
        }
    };

    const openAdjustModal = (item) => {
        setAdjustModal({ item, quantityDelta: '', note: '' });
    };

    const handleAdjustModalChange = (field) => (event) => {
        setAdjustModal((current) => (current ? { ...current, [field]: event.target.value } : current));
    };

    const submitAdjustModal = async (event) => {
        event.preventDefault();

        if (!adjustModal) {
            return;
        }

        const itemId = readRewardField(adjustModal.item, 'rewardItemId');
        const quantityDelta = Number(adjustModal.quantityDelta);
        const trimmedNote = adjustModal.note.trim();

        if (!Number.isInteger(quantityDelta) || quantityDelta === 0 || quantityDelta < -1000000 || quantityDelta > 1000000) {
            showAdminError('Quantity delta must be a non-zero integer between -1,000,000 and 1,000,000.');
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
            setAdjustModal(null);
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
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                <FaBoxOpen aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="m-0 text-[1.05rem] text-[var(--admin-ink)]">Reward Inventory</h2>
                                <p className="m-0 mt-1 text-[0.78rem] font-bold text-[var(--admin-muted)]">
                                    Manage physical season reward items and available stock.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`}
                                disabled={inventoryActionLoadingId === 'expire'}
                                onClick={handleExpireOverdueRewards}
                                type="button"
                            >
                                <FaSyncAlt aria-hidden="true" />
                                {inventoryActionLoadingId === 'expire' ? 'Processing...' : 'Expire Overdue'}
                            </button>
                            {!showInventoryForm && (
                                <button
                                    className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`}
                                    onClick={() => setShowInventoryForm(true)}
                                    type="button"
                                >
                                    <FaPlus aria-hidden="true" />
                                    Add Reward Item
                                </button>
                            )}
                        </div>
                    </div>

                    {showInventoryForm && (
                        <form className="grid gap-4 border-b border-[var(--admin-border)] bg-[#fffaf8] p-5" onSubmit={handleCreateInventoryItem}>
                            <div className="flex items-center justify-between">
                                <h3 className="m-0 text-[0.9rem] font-black text-[var(--admin-ink)]">New Reward Item</h3>
                                <button
                                    className="text-[0.76rem] font-bold text-[var(--admin-muted)] hover:text-[var(--admin-primary-dark)]"
                                    onClick={() => { setShowInventoryForm(false); resetInventoryCreateForm(); }}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-5 max-[720px]:grid-cols-1">
                                <div className="grid h-[104px] w-[104px] flex-none place-items-center overflow-hidden rounded-[10px] border border-dashed border-[var(--admin-border)] bg-white text-[var(--admin-muted)] max-[720px]:mx-auto">
                                    {(inventoryImagePreviewUrl || inventoryForm.imageUrl) && !imagePreviewBroken ? (
                                        <img
                                            alt="Reward item preview"
                                            className="h-full w-full object-cover"
                                            onError={() => setImagePreviewBroken(true)}
                                            src={inventoryImagePreviewUrl || resolveFileUrl(inventoryForm.imageUrl)}
                                        />
                                    ) : (
                                        <FaImage aria-hidden="true" className="text-2xl" />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                                    <label className="grid gap-1.5">
                                        <span className="text-[0.68rem] font-black uppercase text-[var(--admin-muted)]">Item name</span>
                                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-white px-3 text-[0.84rem] font-bold outline-0 focus:border-[var(--admin-gold)]" maxLength={200} onChange={handleInventoryFormChange('name')} placeholder="e.g. Elite Racing Cap" required type="text" value={inventoryForm.name} />
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[0.68rem] font-black uppercase text-[var(--admin-muted)]">SKU</span>
                                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-white px-3 text-[0.84rem] font-bold uppercase outline-0 focus:border-[var(--admin-gold)]" maxLength={80} onChange={handleInventoryFormChange('sku')} placeholder="e.g. CAP-001" required type="text" value={inventoryForm.sku} />
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[0.68rem] font-black uppercase text-[var(--admin-muted)]">Initial stock</span>
                                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-white px-3 text-[0.84rem] font-bold outline-0 focus:border-[var(--admin-gold)]" max="1000000" min="0" onChange={handleInventoryFormChange('initialStock')} required step="1" type="number" value={inventoryForm.initialStock} />
                                    </label>
                                    <label className="grid gap-1.5">
                                        <span className="text-[0.68rem] font-black uppercase text-[var(--admin-muted)]">Reward image</span>
                                        <input
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                            className="block h-10 cursor-pointer rounded-md border border-[var(--admin-border)] bg-white text-[0.78rem] font-bold text-[var(--admin-muted)] file:mr-3 file:h-full file:cursor-pointer file:border-0 file:bg-[var(--admin-primary)] file:px-4 file:text-[0.76rem] file:font-black file:text-white hover:file:bg-[var(--admin-primary-dark)]"
                                            disabled={inventoryActionLoadingId === 'create'}
                                            onChange={handleInventoryImageChange}
                                            type="file"
                                        />
                                        <span className="text-[0.68rem] font-semibold text-[var(--admin-muted)]">JPG, PNG, or WEBP. Maximum 5MB. The image is uploaded when you create the item.</span>
                                    </label>
                                    <label className="col-span-2 grid gap-1.5 max-[640px]:col-span-1">
                                        <span className="text-[0.68rem] font-black uppercase text-[var(--admin-muted)]">Description</span>
                                        <input className="h-10 rounded-md border border-[var(--admin-border)] bg-white px-3 text-[0.84rem] font-bold outline-0 focus:border-[var(--admin-gold)]" maxLength={1000} onChange={handleInventoryFormChange('description')} placeholder="Optional short description" type="text" value={inventoryForm.description} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`} disabled={inventoryActionLoadingId === 'create'} type="submit">
                                    <FaCheck aria-hidden="true" />
                                    {inventoryActionLoadingId === 'create' ? 'Uploading & Creating...' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse max-[980px]:min-w-[980px]">
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
                                        <td className="px-5 py-10 text-center" colSpan="8">
                                            <div className="grid place-items-center gap-2">
                                                <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                                    <FaGift aria-hidden="true" className="text-lg" />
                                                </span>
                                                <p className="m-0 text-[0.9rem] font-bold text-[var(--admin-muted)]">No reward inventory items yet.</p>
                                                <p className="m-0 text-[0.78rem] font-semibold text-[var(--admin-muted)]">Add your first physical reward item to start assigning season prizes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : inventory.map((item) => {
                                    const itemId = readRewardField(item, 'rewardItemId');
                                    const isActive = Boolean(readRewardField(item, 'isActive'));
                                    const available = Number(readRewardField(item, 'availableQuantity') ?? 0);
                                    const tone = stockTone(available);
                                    const imageUrl = readRewardField(item, 'imageUrl');

                                    return (
                                        <tr className="transition-colors hover:bg-[#fffaf8]" key={itemId}>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                                        {imageUrl ? (
                                                            <img alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} src={resolveFileUrl(imageUrl)} />
                                                        ) : (
                                                            <FaGift aria-hidden="true" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="m-0 text-[0.88rem] font-black text-[var(--admin-ink)]">{readRewardField(item, 'name') || '-'}</p>
                                                        {readRewardField(item, 'description') && (
                                                            <p className="m-0 mt-0.5 truncate text-[0.72rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'description')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'sku') || '-'}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">{readRewardField(item, 'stockQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'reservedQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">{readRewardField(item, 'deliveredQuantity') ?? 0}</td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[0.9rem] font-black text-[var(--admin-primary-dark)]">{available}</span>
                                                    <span className={`inline-flex min-h-5 items-center rounded-full px-2 text-[0.62rem] font-black ${tone.badge}`}>
                                                        {tone.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${isActive ? 'bg-[#e8f7ee] text-[#16864f]' : 'bg-[#f3e1df] text-[#a4392f]'}`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={inventoryActionLoadingId !== ''} onClick={() => openEditModal(item)} type="button">
                                                        <FaPen aria-hidden="true" />
                                                        Edit
                                                    </button>
                                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-white text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} disabled={inventoryActionLoadingId !== ''} onClick={() => openAdjustModal(item)} type="button">
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
                                    {['Tournament', 'Recipient', 'Horse', 'Rank', 'Payout', 'Status', 'Payment Ref.', 'Actions'].map((heading) => (
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
                                    const id = readRewardField(reward, 'prizePayoutId');
                                    const status = readRewardField(reward, 'status');
                                    const canReview = status === 'UnderReview';

                                    return (
                                        <tr key={id}>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.88rem] font-black text-[var(--admin-ink)]">
                                                {readRewardField(reward, 'tournamentName') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-ink)]">
                                                <span className="block">{readRewardField(reward, 'recipientName') || '-'}</span>
                                                <span className="mt-0.5 block text-[0.68rem] uppercase text-[var(--admin-muted)]">{readRewardField(reward, 'recipientType') || '-'}</span>
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-bold text-[var(--admin-muted)]">
                                                {readRewardField(reward, 'horseName') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">
                                                #{readRewardField(reward, 'rankPosition') || '-'}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4 text-[0.84rem] font-black text-[var(--admin-primary-dark)]">
                                                {adminApi.formatters.toMoney(readRewardField(reward, 'payoutAmount') || 0)}
                                            </td>
                                            <td className="border-b border-[var(--admin-border)] px-5 py-4">
                                                <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[0.68rem] font-black ${statusClass[status] || 'bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]'}`}>
                                                    {status ? status.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : '-'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap border-b border-[var(--admin-border)] px-5 py-4 text-[0.82rem] font-bold text-[var(--admin-muted)]">
                                                {readRewardField(reward, 'paymentReference') || '-'}
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

            {editModal && (
                <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[rgba(15,23,42,0.42)] px-5 py-8" onClick={closeEditModal} role="presentation">
                    <form className="grid w-[min(620px,100%)] gap-5 rounded-[10px] border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]" onClick={(event) => event.stopPropagation()} onSubmit={submitEditModal}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="m-0 text-[1.1rem] font-black text-[var(--admin-ink)]">Edit Reward Item</h2>
                                <p className="m-0 mt-1 text-sm font-semibold text-[var(--admin-muted)]">Update item details and replace or remove its image. Stock is managed separately.</p>
                            </div>
                            <button className="grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-primary)]" onClick={closeEditModal} type="button">x</button>
                        </div>

                        <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-5 max-[640px]:grid-cols-1">
                            <div className="grid content-start gap-3 max-[640px]:justify-items-center">
                                <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-[10px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] text-[var(--admin-muted)]">
                                    {(editImagePreviewUrl || editModal.imageUrl) && !editImagePreviewBroken ? (
                                        <img
                                            alt="Reward item preview"
                                            className="h-full w-full object-cover"
                                            onError={() => setEditImagePreviewBroken(true)}
                                            src={editImagePreviewUrl || resolveFileUrl(editModal.imageUrl)}
                                        />
                                    ) : (
                                        <FaImage aria-hidden="true" className="text-3xl" />
                                    )}
                                </div>
                                {(editImagePreviewUrl || editModal.imageUrl) && (
                                    <button className="text-xs font-black text-[#b91c1c] hover:underline" onClick={removeEditImage} type="button">Remove image</button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                                <label className="grid gap-1.5">
                                    <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Item name</span>
                                    <input autoFocus className="rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm font-bold outline-none focus:border-[var(--admin-gold)]" maxLength={200} onChange={handleEditModalChange('name')} required type="text" value={editModal.name} />
                                </label>
                                <label className="grid gap-1.5">
                                    <span className="text-xs font-black uppercase text-[var(--admin-muted)]">SKU</span>
                                    <input className="rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm font-bold uppercase outline-none focus:border-[var(--admin-gold)]" maxLength={80} onChange={handleEditModalChange('sku')} required type="text" value={editModal.sku} />
                                </label>
                                <label className="col-span-2 grid gap-1.5 max-[560px]:col-span-1">
                                    <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Replace image</span>
                                    <input
                                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        className="block min-h-11 cursor-pointer rounded-[8px] border border-[var(--admin-border)] bg-white text-xs font-bold text-[var(--admin-muted)] file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:bg-[var(--admin-primary)] file:px-4 file:text-xs file:font-black file:text-white"
                                        disabled={inventoryActionLoadingId === `edit-${readRewardField(editModal.item, 'rewardItemId')}`}
                                        onChange={handleEditImageChange}
                                        type="file"
                                    />
                                    <span className="text-xs font-semibold text-[var(--admin-muted)]">JPG, PNG, or WEBP. Maximum 5MB. Leave empty to keep the current image.</span>
                                </label>
                                <label className="col-span-2 grid gap-1.5 max-[560px]:col-span-1">
                                    <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Description</span>
                                    <textarea className="min-h-[100px] rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--admin-gold)]" maxLength={1000} onChange={handleEditModalChange('description')} placeholder="Optional item description" value={editModal.description} />
                                    <span className="text-right text-xs font-semibold text-[var(--admin-muted)]">{editModal.description.length}/1000</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="rounded-full border border-[var(--admin-border)] bg-white px-5 py-3 text-sm font-black text-[var(--admin-primary-dark)]" onClick={closeEditModal} type="button">Cancel</button>
                            <button className="rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white disabled:opacity-60" disabled={inventoryActionLoadingId === `edit-${readRewardField(editModal.item, 'rewardItemId')}`} type="submit">
                                {inventoryActionLoadingId === `edit-${readRewardField(editModal.item, 'rewardItemId')}` ? 'Uploading & Saving...' : 'Save Item Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {adjustModal && (
                <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(15,23,42,0.42)] px-5 py-8" onClick={() => setAdjustModal(null)} role="presentation">
                    <form className="grid w-[min(420px,100%)] gap-4 rounded-[8px] border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]" onClick={(event) => event.stopPropagation()} onSubmit={submitAdjustModal}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="m-0 text-[1.1rem] font-black text-[var(--admin-ink)]">Adjust Stock</h2>
                                <p className="m-0 mt-1 text-sm font-semibold text-[var(--admin-muted)]">{readRewardField(adjustModal.item, 'name')}</p>
                            </div>
                            <button className="grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--admin-border)] bg-white text-[var(--admin-primary)]" onClick={() => setAdjustModal(null)} type="button">x</button>
                        </div>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Quantity change</span>
                            <input autoFocus className="rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none" onChange={handleAdjustModalChange('quantityDelta')} placeholder="e.g. 10 or -5" required type="number" value={adjustModal.quantityDelta} />
                            <span className="text-xs font-semibold text-[var(--admin-muted)]">Use a negative number to reduce stock.</span>
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-black uppercase text-[var(--admin-muted)]">Note</span>
                            <textarea className="min-h-[80px] rounded-[8px] border border-[var(--admin-border)] px-3 py-2.5 text-sm outline-none" maxLength={500} minLength={3} onChange={handleAdjustModalChange('note')} placeholder="Reason for this adjustment" required value={adjustModal.note} />
                        </label>
                        <button className="rounded-full bg-[var(--admin-primary)] px-5 py-3 text-sm font-black text-white disabled:opacity-60" disabled={inventoryActionLoadingId === `adjust-${readRewardField(adjustModal.item, 'rewardItemId')}`} type="submit">
                            {inventoryActionLoadingId === `adjust-${readRewardField(adjustModal.item, 'rewardItemId')}` ? 'Saving...' : 'Save Adjustment'}
                        </button>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminRewardPayments;
