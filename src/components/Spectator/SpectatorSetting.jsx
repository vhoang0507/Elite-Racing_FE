import { createElement } from 'react';
import {
    FaEnvelope,
    FaPhone,
    FaShieldAlt,
    FaUserCircle,
} from 'react-icons/fa';

import { getAuthUser } from '../../utils/tokenStorage';
import ChangePasswordCard from '../shared/ChangePasswordCard';

import SpectatorLayout from './SpectatorLayout';

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
        .toUpperCase() || 'SP';
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
                    {value || 'N/A'}
                </strong>
            </div>
        </article>
    );
}

function SpectatorSetting() {
    const user = getAuthUser() || {};

    const fullName = readField(user, 'fullName') || 'Spectator';
    const email = readField(user, 'email');
    const phone = readField(user, 'phone') || readField(user, 'phoneNumber');
    const status = readField(user, 'status');
    const initials = getInitials(fullName);

    return (
        <SpectatorLayout activeKey="settings">
            <section className="grid gap-6 px-11 py-9 max-[860px]:px-5 max-[860px]:py-7">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-[0.74rem] font-black uppercase text-[var(--admin-muted)]">
                        <FaShieldAlt className="text-[var(--admin-primary)]" />
                        <span>Spectator Settings</span>
                    </div>

                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[720px]:text-[1.6rem]">
                        Account Settings
                    </h1>
                </div>

                <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-5 border-b border-[var(--admin-border)] bg-[#f8fbff] p-6 max-[720px]:flex-col max-[720px]:items-start">
                        <div className="grid h-20 w-20 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#0f172a,#0b7f5a)] text-[1.4rem] font-black text-white">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <h2 className="m-0 break-words text-[1.65rem] text-[var(--admin-ink)]">
                                {fullName}
                            </h2>

                            <span className="mt-3 inline-flex min-h-7 items-center rounded-full bg-[#e8f7ef] px-3 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">
                                Spectator
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-5 max-[860px]:grid-cols-1">
                        <ProfileField
                            icon={FaUserCircle}
                            label="Full Name"
                            value={fullName}
                        />

                        <ProfileField
                            icon={FaEnvelope}
                            label="Email"
                            value={email}
                        />

                        <ProfileField
                            icon={FaPhone}
                            label="Phone"
                            value={phone}
                        />

                        <ProfileField
                            icon={FaShieldAlt}
                            label="Status"
                            value={status}
                        />
                    </div>
                </section>

                <ChangePasswordCard />
            </section>
        </SpectatorLayout>
    );
}

export default SpectatorSetting;
