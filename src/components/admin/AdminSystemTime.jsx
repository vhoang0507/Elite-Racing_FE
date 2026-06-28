import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    FaCheckCircle,
    FaClock,
    FaDatabase,
    FaEraser,
    FaExclamationTriangle,
    FaForward,
    FaShieldAlt,
    FaSyncAlt,
    FaTimesCircle,
} from 'react-icons/fa';

import { adminSystemApi } from '../../api/adminSystemApi';
import { getAuthUser } from '../../utils/tokenStorage';

import AdminLayout from './AdminLayout';

const initialAdvanceForm = {
    days: '0',
    hours: '0',
    minutes: '5',
    autoSync: true,
};

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-6 px-11 py-9 max-[860px]:px-5 max-[860px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_30px_rgba(15,23,42,0.05)]';
const panelHeaderClass = 'flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[#fff8f6] px-5 py-4 max-[720px]:flex-col max-[720px]:items-stretch';
const panelTitleClass = 'm-0 flex items-center gap-2 text-[1.05rem] font-black text-[var(--admin-primary-dark)]';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.74rem] font-black uppercase text-[#64748b]';
const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.88rem] font-bold text-[var(--admin-ink)] outline-0 transition-all duration-200 focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] disabled:cursor-not-allowed disabled:bg-[#f4eeee] disabled:text-[#94a3b8]';
const checkboxClass = 'h-4 w-4 accent-[var(--admin-primary)]';
const primaryButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[var(--admin-primary)] px-5 text-[0.82rem] font-black text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-5 text-[0.82rem] font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef] disabled:cursor-not-allowed disabled:opacity-60';
const dangerButtonClass = 'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-5 text-[0.82rem] font-black text-[var(--admin-primary)] hover:bg-[#d7f2e4] disabled:cursor-not-allowed disabled:opacity-60';

function readApiField(item, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return item?.[camelKey] ?? item?.[pascalKey];
}

function toDisplayValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value).replace(/(T\d{2}:\d{2}:\d{2})\.\d+((?:Z|[+-]\d{2}:?\d{2})?)$/, '$1$2');
}

function padDatePart(value) {
    return String(value).padStart(2, '0');
}

function getDateTimeSuffix(value) {
    return String(value).match(/(Z|[+-]\d{2}:?\d{2})$/i)?.[1] || '';
}

function getOffsetMinutes(suffix) {
    if (!suffix || suffix.toUpperCase() === 'Z') {
        return 0;
    }

    const match = suffix.match(/^([+-])(\d{2}):?(\d{2})$/);

    if (!match) {
        return 0;
    }

    const minutes = (Number(match[2]) * 60) + Number(match[3]);

    return match[1] === '-' ? -minutes : minutes;
}

function formatDateTimeAtOffset(date, suffix = '') {
    const offsetDate = new Date(date.getTime() + (getOffsetMinutes(suffix) * 60 * 1000));

    return [
        offsetDate.getUTCFullYear(),
        '-',
        padDatePart(offsetDate.getUTCMonth() + 1),
        '-',
        padDatePart(offsetDate.getUTCDate()),
        'T',
        padDatePart(offsetDate.getUTCHours()),
        ':',
        padDatePart(offsetDate.getUTCMinutes()),
        ':',
        padDatePart(offsetDate.getUTCSeconds()),
        suffix,
    ].join('');
}

function addElapsedToDateTime(value, elapsedMs) {
    if (!value) {
        return value;
    }

    const valueText = String(value).trim();
    const normalizedText = valueText.replace(/(T\d{2}:\d{2}:\d{2}\.\d{3})\d+/, '$1');

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i.test(normalizedText)) {
        return value;
    }

    const suffix = getDateTimeSuffix(normalizedText);
    const parsed = new Date(suffix ? normalizedText : `${normalizedText}Z`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return formatDateTimeAtOffset(new Date(parsed.getTime() + elapsedMs), suffix);
}

function buildLiveSystemTime(systemTime, elapsedMs) {
    if (!systemTime) {
        return systemTime;
    }

    return {
        ...systemTime,
        realUtcNow: addElapsedToDateTime(readApiField(systemTime, 'realUtcNow'), elapsedMs),
        effectiveUtcNow: addElapsedToDateTime(readApiField(systemTime, 'effectiveUtcNow'), elapsedMs),
        effectiveLocalNow: addElapsedToDateTime(readApiField(systemTime, 'effectiveLocalNow'), elapsedMs),
    };
}

function toNonNegativeInt(value) {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function StatusBadge({
    isActive,
    activeLabel,
    inactiveLabel,
}) {
    return (
        <span className={`inline-flex min-h-7 items-center rounded border px-3 text-[0.7rem] font-black uppercase ${isActive ? 'border-[#a7dfbf] bg-[#e8f7ee] text-[#16864f]' : 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]'}`}>
            {isActive ? activeLabel : inactiveLabel}
        </span>
    );
}

function TimeItem({
    label,
    value,
}) {
    return (
        <article className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                {label}
            </span>
            <strong className="mt-2 block break-words text-[0.95rem] text-[var(--admin-ink)]">
                {toDisplayValue(value)}
            </strong>
        </article>
    );
}

function SyncStat({
    label,
    value,
}) {
    return (
        <article className="rounded-md border border-[var(--admin-border)] bg-[#fffdfc] p-4">
            <span className="block text-[0.68rem] font-black uppercase text-[#64748b]">
                {label}
            </span>
            <strong className="mt-2 block text-[1.8rem] leading-none text-[var(--admin-primary-dark)]">
                {Number(value || 0)}
            </strong>
        </article>
    );
}

function AdminSystemTime() {
    const authUser = getAuthUser();
    const accountRole = readApiField(authUser, 'role') || '';
    const isAdmin = accountRole === 'Admin';
    const toastTimerRef = useRef(null);
    const clockSnapshotRef = useRef(null);

    const [systemTime, setSystemTime] = useState(null);
    const [syncResult, setSyncResult] = useState(null);
    const [advanceForm, setAdvanceForm] = useState(initialAdvanceForm);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [clockTick, setClockTick] = useState(() => Date.now());

    const showToast = useCallback((message, type = 'success') => {
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }

        setToast({ message, type });
        toastTimerRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, 3600);
    }, []);

    useEffect(() => () => {
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!systemTime) {
            clockSnapshotRef.current = null;
            return undefined;
        }

        const capturedAt = Date.now();
        clockSnapshotRef.current = {
            capturedAt,
            source: systemTime,
        };
        setClockTick(capturedAt);

        const timerId = window.setInterval(() => {
            setClockTick(Date.now());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [systemTime]);

    const loadSystemTime = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }

        setError('');

        try {
            const payload = await adminSystemApi.getSystemTime();

            setSystemTime(payload);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to load system time.');
            return false;
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            loadSystemTime();
        }
    }, [isAdmin, loadSystemTime]);

    const allowTimeOverride = Boolean(readApiField(systemTime, 'allowTimeOverride'));
    const isOverridden = Boolean(readApiField(systemTime, 'isOverridden'));
    const isBusy = Boolean(actionLoading);
    const clockSnapshot = clockSnapshotRef.current;
    const liveElapsedMs = clockSnapshot?.source === systemTime
        ? Math.max(0, clockTick - clockSnapshot.capturedAt)
        : 0;
    const liveSystemTime = buildLiveSystemTime(systemTime, liveElapsedMs);

    const applyTimeResponse = (payload) => {
        const nextTime = readApiField(payload, 'time') || payload;
        const nextSyncResult = readApiField(payload, 'syncResult');

        if (nextTime) {
            setSystemTime(nextTime);
        }

        setSyncResult(nextSyncResult || null);
    };

    const handleRefresh = async () => {
        const loaded = await loadSystemTime();

        if (loaded) {
            showToast('System time refreshed.');
        }
    };

    const handleAdvanceChange = (event) => {
        const {
            checked,
            name,
            type,
            value,
        } = event.target;

        setAdvanceForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAdvanceSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!allowTimeOverride) {
            setError('Time override is disabled in this environment.');
            return;
        }

        const days = toNonNegativeInt(advanceForm.days);
        const hours = toNonNegativeInt(advanceForm.hours);
        const minutes = toNonNegativeInt(advanceForm.minutes);

        if (days + hours + minutes === 0) {
            setError('Please enter at least one positive advance value.');
            return;
        }

        const ok = window.confirm(
            'Are you sure you want to advance system time? This can move the system past real deadlines.'
        );

        if (!ok) {
            return;
        }

        setActionLoading('advance');

        try {
            const payload = await adminSystemApi.advanceSystemTime({
                days,
                hours,
                minutes,
                autoSync: advanceForm.autoSync,
            });

            applyTimeResponse(payload);
            showToast(advanceForm.autoSync ? 'System time advanced and statuses synced.' : 'System time advanced.');
        } catch (err) {
            setError(err.message || 'Failed to advance system time.');
        } finally {
            setActionLoading('');
        }
    };

    const handleSyncStatuses = async () => {
        setError('');

        const ok = window.confirm(
            'Are you sure you want to sync statuses using the current effective time? This can change real data in the database.'
        );

        if (!ok) {
            return;
        }

        setActionLoading('sync');

        try {
            const payload = await adminSystemApi.syncTimeStatuses();
            setSyncResult(payload);
            await loadSystemTime({ silent: true });
            showToast('Time statuses synchronized.');
        } catch (err) {
            setError(err.message || 'Failed to sync time statuses.');
        } finally {
            setActionLoading('');
        }
    };

    const handleClearOverride = async () => {
        setError('');

        if (!allowTimeOverride) {
            setError('Time override is disabled in this environment.');
            return;
        }

        const ok = window.confirm(
            'Clear override, return to real server time, and sync statuses using the current real time? This can change real data in the database.'
        );

        if (!ok) {
            return;
        }

        setActionLoading('clear');

        try {
            const timePayload = await adminSystemApi.clearSystemTimeOverride();
            setSystemTime(timePayload);

            const syncPayload = await adminSystemApi.syncTimeStatuses();
            setSyncResult(syncPayload);
            await loadSystemTime({ silent: true });
            showToast('Time override cleared and statuses synced.');
        } catch (err) {
            setError(err.message || 'Failed to clear time override and sync statuses.');
        } finally {
            setActionLoading('');
        }
    };

    if (!isAdmin) {
        return (
            <AdminLayout activeKey="system-time">
                <section className={pageShellClass}>
                    <div className="rounded-[var(--admin-radius)] border border-[#e7a49a] bg-[#e8f7ef] p-5 text-[var(--admin-primary)]">
                        <h1 className="m-0 text-[1.4rem] font-black">Admin access required</h1>
                        <p className="mb-0 mt-2 font-semibold">
                            Only Admin accounts can access System Time tools.
                        </p>
                    </div>
                </section>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeKey="system-time" searchPlaceholder="Search system tools...">
            <section className={pageShellClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-[0.74rem] font-black uppercase text-[#64748b]">
                            <FaShieldAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Admin Tools</span>
                        </div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[860px]:text-[1.6rem]">
                            System Time
                        </h1>
                        <p className="mb-0 mt-1.5 text-[0.92rem] font-semibold text-[var(--admin-muted)]">
                            Test the backend clock and time-based status updates from one Admin-only screen.
                        </p>
                    </div>

                    <button
                        className={secondaryButtonClass}
                        disabled={loading || isBusy}
                        type="button"
                        onClick={handleRefresh}
                    >
                        <FaSyncAlt aria-hidden="true" />
                        <span>{loading ? 'Loading...' : 'Get Current Time'}</span>
                    </button>
                </div>

                <section className="rounded-[var(--admin-radius)] border border-[#efd06a] bg-[#fff7db] px-5 py-4 text-[#6f5108]">
                    <div className="flex gap-3 max-[720px]:flex-col">
                        <FaExclamationTriangle aria-hidden="true" className="mt-1 flex-none text-[#a17809]" />
                        <div>
                            <strong className="block text-[0.95rem]">
                                This page is for test/demo use only.
                            </strong>
                            <p className="mb-0 mt-1 text-[0.86rem] font-semibold leading-6">
                                Syncing statuses can change real database records. Clearing override returns the clock to real server time and immediately syncs statuses using that time.
                            </p>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-md border border-[#e7a49a] bg-[#e8f7ef] px-4 py-3 text-[0.86rem] font-bold text-[var(--admin-primary)]">
                        {error}
                    </div>
                )}

                <section className={panelClass}>
                    <div className={panelHeaderClass}>
                        <h2 className={panelTitleClass}>
                            <FaClock aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Current System Time</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge isActive={isOverridden} activeLabel="Override ON" inactiveLabel="Override OFF" />
                            <StatusBadge isActive={allowTimeOverride} activeLabel="Override Allowed" inactiveLabel="Override Disabled" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center font-bold text-[var(--admin-muted)]">
                            Loading system time...
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 p-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                            <TimeItem label="Real UTC Now" value={readApiField(liveSystemTime, 'realUtcNow')} />
                            <TimeItem label="Effective UTC Now" value={readApiField(liveSystemTime, 'effectiveUtcNow')} />
                            <TimeItem label="Effective Local Now" value={readApiField(liveSystemTime, 'effectiveLocalNow')} />
                            <TimeItem label="Timezone" value={readApiField(liveSystemTime, 'timezone')} />
                            <TimeItem label="Override" value={isOverridden ? 'ON' : 'OFF'} />
                            <TimeItem label="Allow Time Override" value={allowTimeOverride ? 'ON' : 'OFF'} />
                        </div>
                    )}
                </section>

                <section className="grid gap-6">
                    <form className={`${panelClass} mx-auto w-full max-w-[920px]`} onSubmit={handleAdvanceSubmit}>
                        <div className={panelHeaderClass}>
                            <h2 className={panelTitleClass}>
                                <FaForward aria-hidden="true" className="text-[var(--admin-primary)]" />
                                <span>Advance Time</span>
                            </h2>
                        </div>

                        <div className="grid gap-5 p-5">
                            <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                                {[
                                    ['days', 'Days'],
                                    ['hours', 'Hours'],
                                    ['minutes', 'Minutes'],
                                ].map(([name, label]) => (
                                    <label className={fieldClass} key={name}>
                                        <span className={labelClass}>{label}</span>
                                        <input
                                            className={`${inputClass} h-12 text-[1rem]`}
                                            disabled={!allowTimeOverride || isBusy}
                                            min="0"
                                            name={name}
                                            type="number"
                                            value={advanceForm[name]}
                                            onChange={handleAdvanceChange}
                                        />
                                    </label>
                                ))}
                            </div>

                            <label className="flex min-h-12 items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 text-[0.86rem] font-bold text-[var(--admin-ink)]">
                                <input
                                    checked={advanceForm.autoSync}
                                    className={checkboxClass}
                                    disabled={!allowTimeOverride || isBusy}
                                    name="autoSync"
                                    type="checkbox"
                                    onChange={handleAdvanceChange}
                                />
                                <span>Auto sync statuses after advance</span>
                            </label>
                        </div>

                        <div className="flex justify-end border-t border-[var(--admin-border)] bg-[#fffaf8] px-5 py-4">
                            <button
                                className={primaryButtonClass}
                                disabled={!allowTimeOverride || isBusy}
                                type="submit"
                            >
                                <FaForward aria-hidden="true" />
                                <span>{actionLoading === 'advance' ? 'Advancing...' : 'Advance Time'}</span>
                            </button>
                        </div>
                    </form>
                </section>

                <section className={panelClass}>
                    <div className={panelHeaderClass}>
                        <h2 className={panelTitleClass}>
                            <FaDatabase aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Status Sync</span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className={secondaryButtonClass}
                                disabled={isBusy}
                                type="button"
                                onClick={handleSyncStatuses}
                            >
                                <FaSyncAlt aria-hidden="true" />
                                <span>{actionLoading === 'sync' ? 'Syncing...' : 'Sync Statuses Now'}</span>
                            </button>

                            <button
                                className={dangerButtonClass}
                                disabled={!allowTimeOverride || !isOverridden || isBusy}
                                type="button"
                                onClick={handleClearOverride}
                            >
                                <FaEraser aria-hidden="true" />
                                <span>{actionLoading === 'clear' ? 'Clearing...' : 'Clear Override'}</span>
                            </button>
                        </div>
                    </div>

                    {syncResult ? (
                        <div className="grid gap-4 p-5">
                            <div className="rounded-md border border-[#a7dfbf] bg-[#e8f7ee] px-4 py-3 text-[0.86rem] font-bold text-[#16864f]">
                                {readApiField(syncResult, 'message') || 'Time statuses synchronized.'}
                            </div>

                            <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
                                <SyncStat label="Expired Invitations" value={readApiField(syncResult, 'expiredInvitations')} />
                                <SyncStat label="Updated Races" value={readApiField(syncResult, 'updatedRaces')} />
                                <SyncStat label="Updated Tournaments" value={readApiField(syncResult, 'updatedTournaments')} />
                                <TimeItem label="Effective UTC Now" value={readApiField(syncResult, 'effectiveUtcNow')} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 text-[0.88rem] font-semibold text-[var(--admin-muted)]">
                            No sync result yet. Run manual sync or enable auto sync on an override/advance action.
                        </div>
                    )}
                </section>
            </section>

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex max-w-[360px] items-center gap-3 rounded-md px-5 py-3 text-[0.86rem] font-bold text-white shadow-lg ${toast.type === 'error' ? 'bg-red-700' : 'bg-[var(--admin-primary-dark)]'}`}>
                    {toast.type === 'error' ? <FaTimesCircle aria-hidden="true" /> : <FaCheckCircle aria-hidden="true" />}
                    <span>{toast.message}</span>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminSystemTime;
