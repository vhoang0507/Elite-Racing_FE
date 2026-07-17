import { useEffect, useState } from 'react';
import {
    FaEnvelope,
    FaIdBadge,
    FaLock,
    FaPhoneAlt,
    FaSyncAlt,
    FaUser,
    FaUserCircle,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

function RefereeSetting() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadProfile = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await refereeApi.getRefereeProfile();
            setProfile(data);
        } catch (err) {
            setError(err.message || 'Failed to load account profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <RefereeLayout
            activeKey="settings"
            searchPlaceholder="Search records, horses, races..."
        >
            <section className={pageShellClass}>
                <div>
                    <h1 className="page-title">
                        Settings
                    </h1>

                    <p className="page-subtitle">
                        Manage referee account preferences, security, notifications, and profile details.
                    </p>
                </div>

                {error && (
                    <div className="rounded-[var(--admin-radius)] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-[220px_1fr] gap-6 max-lg:grid-cols-1">
                    <div className={`${panelClass} h-fit p-3`}>
                        <button
                            type="button"
                            className="mb-2 flex w-full items-center gap-3 rounded-md bg-[var(--admin-surface-strong)] px-4 py-3 text-left font-semibold text-[var(--admin-primary)]"
                        >
                            <FaUser />
                            Profile Settings
                        </button>

                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left font-semibold text-[#475569] hover:bg-[var(--admin-surface-strong)]"
                        >
                            <FaLock />
                            Account Security
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className={`${panelClass} p-8`}>
                            <div className="mb-8 flex items-center justify-between gap-4 border-l-4 border-[var(--admin-primary)] pl-4 max-[720px]:flex-col max-[720px]:items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--admin-ink)]">
                                        Profile Settings
                                    </h2>
                                    <p className="mt-1 text-sm text-[var(--admin-muted)]">
                                        Account data is loaded from the authenticated backend profile.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={loadProfile}
                                    disabled={loading}
                                    className="flex items-center gap-2 rounded-md border border-[var(--admin-primary)] px-5 py-3 font-semibold text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FaSyncAlt />
                                    {loading ? 'Loading...' : 'Refresh'}
                                </button>
                            </div>

                            <div className="mb-8 flex items-center gap-5 max-[720px]:flex-col max-[720px]:items-start">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                    <FaUserCircle size={70} />
                                </div>

                                <div>
                                    <h3 className="text-4xl font-bold text-[var(--admin-primary)] max-[720px]:text-3xl">
                                        {profile?.fullName || 'Race Referee'}
                                    </h3>

                                    <p className="text-[var(--admin-muted)]">
                                        {profile?.email || 'No email loaded'}
                                    </p>
                                </div>
                            </div>

                            <hr className="mb-8 border-[var(--admin-border)]" />

                            <section className="mb-8 grid gap-4 md:grid-cols-3">
                                <SummaryTile icon={FaIdBadge} label="Referee ID" value={profile?.userId ? `RF-${String(profile.userId).padStart(5, '0')}` : 'N/A'} />
                                <SummaryTile icon={FaEnvelope} label="Email" value={profile?.email || 'N/A'} />
                                <SummaryTile icon={FaPhoneAlt} label="Phone" value={profile?.phone || 'N/A'} />
                            </section>

                            <div className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <ReadOnlyField label="Full Name" value={profile?.fullName} loading={loading} />
                                    <ReadOnlyField label="Email Address" value={profile?.email} loading={loading} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <ReadOnlyField label="Phone Number" value={profile?.phone} loading={loading} />
                                    <ReadOnlyField label="Role" value={profile?.role} loading={loading} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <ReadOnlyField label="Account Status" value={profile?.status} loading={loading} />
                                    <ReadOnlyField label="Email Verified" value={profile?.emailVerified ? 'Yes' : 'No'} loading={loading} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <ReadOnlyField label="License Number" value={profile?.licenseNo} loading={loading} />
                                    <ReadOnlyField label="Official Experience" value={profile?.experienceYears ? `${profile.experienceYears} years` : ''} loading={loading} />
                                </div>
                            </div>
                        </div>

                        <div className={`${panelClass} p-8`}>
                            <h2 className="mb-8 border-l-4 border-[var(--admin-primary)] pl-4 text-2xl font-bold text-[var(--admin-ink)]">
                                Account Security
                            </h2>

                            <div className="rounded-md border border-[var(--admin-border)] bg-[#faf8f8] p-5 text-sm font-semibold text-[var(--admin-muted)]">
                                Password update is not available in the current backend API contract.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </RefereeLayout>
    );
}

function SummaryTile({ icon, label, value }) {
    const Icon = icon;

    return (
        <article className="flex min-w-0 items-center gap-3 rounded-md border border-[var(--admin-border)] bg-[#fff8f6] p-4">
            <div className="grid h-10 w-10 flex-none place-items-center rounded-md bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                <Icon />
            </div>
            <div className="min-w-0">
                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">
                    {label}
                </div>
                <strong className="block truncate text-[var(--admin-ink)]">
                    {value}
                </strong>
            </div>
        </article>
    );
}

function ReadOnlyField({ label, value, loading }) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-semibold text-gray-600">
                {label}
            </span>

            <input
                type="text"
                readOnly
                value={loading ? 'Loading...' : value || 'N/A'}
                className="w-full rounded-md border border-[var(--admin-border)] bg-[#faf5f4] px-4 py-3 outline-none"
            />
        </label>
    );
}

export default RefereeSetting;
