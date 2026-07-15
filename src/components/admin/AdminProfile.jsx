import { createElement } from 'react';
import {
    FaCheckCircle,
    FaEnvelope,
    FaIdBadge,
    FaPhone,
    FaShieldAlt,
    FaUserCircle,
} from 'react-icons/fa';

import ChangePasswordCard from '../shared/ChangePasswordCard';

import { getAuthToken, getAuthUser } from '../../utils/tokenStorage';

import AdminLayout from './AdminLayout';

function readField(source, camelKey, pascalKey = camelKey[0].toUpperCase() + camelKey.slice(1)) {
    return source?.[camelKey] ?? source?.[pascalKey];
}

function getInitials(name) {
    return name
        ?.split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AD';
}

function decodeJwt(token) {
    if (!token) {
        return null;
    }

    try {
        const [, payload] = token.split('.');
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
                .join('')
        );

        return JSON.parse(json);
    } catch {
        return null;
    }
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

function ProfileField({
    icon,
    label,
    value,
}) {
    return (
        <article className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                {icon ? createElement(icon, { 'aria-hidden': true }) : null}
            </div>
            <div className="min-w-0">
                <span className="block text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">
                    {label}
                </span>
                <strong className="mt-1 block break-words text-[1rem] text-[var(--admin-ink)]">
                    {formatValue(value)}
                </strong>
            </div>
        </article>
    );
}

function AdminProfile() {
    const authUser = getAuthUser() || {};
    const tokenClaims = decodeJwt(getAuthToken()) || {};
    const accountName = readField(authUser, 'fullName') || readField(authUser, 'name') || tokenClaims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Admin';
    const accountEmail = readField(authUser, 'email') || tokenClaims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const accountPhone = readField(authUser, 'phone') || readField(authUser, 'phoneNumber');
    const accountStatus = readField(authUser, 'status');
    const emailVerified = readField(authUser, 'emailVerified') ?? readField(authUser, 'isEmailVerified') ?? readField(authUser, 'emailConfirmed') ?? readField(authUser, 'isEmailConfirmed');
    const accountId = readField(authUser, 'userId') || readField(authUser, 'id') || tokenClaims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const accountInitials = getInitials(accountName);
    const profileFields = [
        {
            icon: FaIdBadge,
            label: 'User ID',
            value: accountId,
        },
        {
            icon: FaUserCircle,
            label: 'Full Name',
            value: accountName,
        },
        {
            icon: FaEnvelope,
            label: 'Email',
            value: accountEmail,
        },
        {
            icon: FaPhone,
            label: 'Phone',
            value: accountPhone,
        },
        {
            icon: FaShieldAlt,
            label: 'Status',
            value: accountStatus,
        },
        {
            icon: FaCheckCircle,
            label: 'Email Verify',
            value: emailVerified,
        },
    ];

    return (
        <AdminLayout activeKey="profile" searchPlaceholder="Search profile information...">
            <section className="grid gap-6 px-11 py-9 max-[860px]:px-5 max-[860px]:py-7">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-[0.74rem] font-black uppercase text-[var(--admin-muted)]">
                        <FaShieldAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                        <span>Admin Profile</span>
                    </div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Account Profile
                    </h1>
                </div>

                <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-5 border-b border-[var(--admin-border)] bg-[#f8fbff] p-6 max-[720px]:flex-col max-[720px]:items-start">
                        <div className="grid h-20 w-20 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#0f172a,#0b7f5a)] text-[1.4rem] font-black text-white">
                            {accountInitials}
                        </div>
                        <div className="min-w-0">
                            <h2 className="m-0 break-words text-[1.65rem] text-[var(--admin-ink)]">
                                {accountName}
                            </h2>
                            <span className="mt-3 inline-flex min-h-7 items-center rounded-full bg-[#e8f7ef] px-3 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">
                                Admin
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-5 max-[860px]:grid-cols-1">
                        {profileFields.map((field) => (
                            <ProfileField
                                icon={field.icon}
                                key={field.label}
                                label={field.label}
                                value={field.value}
                            />
                        ))}
                    </div>
                </section>
                <ChangePasswordCard />
            </section>
        </AdminLayout>
    );
}

export default AdminProfile;
