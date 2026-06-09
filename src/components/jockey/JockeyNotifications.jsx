import { useState } from 'react';
import {
    FaBell,
    FaEnvelope,
    FaTrophy,
    FaCog,
    FaCheck,
    FaFilter,
    FaCalendarAlt,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';

const pageShellClass =
    'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

const panelClass =
    'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

const notificationsData = [
    {
        id: 1,
        title: 'New Race Invitation: Grand Ascot Cup',
        description:
            "Trainer Arthur Pendleton has invited you to ride 'Thunderbolt' in the Ascot...",
        type: 'urgent',
        time: '2 mins ago',
        unread: true,
    },
    {
        id: 2,
        title: 'Race Schedule Change: Derby Qualifier',
        description:
            'The start time for the Derby Qualifier at Kentucky has been shifted...',
        type: 'update',
        time: '3 hours ago',
    },
    {
        id: 3,
        title: 'Tournament Results Published',
        description:
            'Official standings for the Summer Equestrian Series are now available...',
        type: 'results',
        time: 'Yesterday',
    },
    {
        id: 4,
        title: 'Registration Verified',
        description:
            'Your annual jockey license renewal has been successfully verified...',
        type: 'system',
        time: '2 days ago',
    },
];

function getBadge(type) {
    switch (type) {
        case 'urgent':
            return (
                <span className="font-black text-[#c62828]">
                    • URGENT
                </span>
            );

        case 'update':
            return (
                <span className="rounded bg-[#f6ddd7] px-2 py-1 text-[0.72rem] font-bold text-[#8a4b3d]">
                    Update
                </span>
            );

        case 'results':
            return (
                <span className="font-black text-[#9c7a0f]">
                    NEW RESULTS
                </span>
            );

        default:
            return (
                <span className="rounded bg-[#f6ddd7] px-2 py-1 text-[0.72rem] font-bold text-[#8a4b3d]">
                    System
                </span>
            );
    }
}

function JockeyNotifications() {
    const [notifications] = useState(notificationsData);
    const [selectedNotification] = useState(notificationsData[0]);

    const totalAlerts = notifications.length;
    const unreadAlerts = notifications.filter(n => n.unread).length;
    const invitationAlerts = notifications.filter(
        n => n.title.includes('Invitation')
    ).length;

    return (
        <JockeyLayout activeKey="notifications">
            <section className={pageShellClass}>
                {/* Title */}
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                        Notifications
                    </h1>

                    <p className="mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Monitor system updates, approvals, reports,
                        and important activities.
                    </p>
                </div>

                {/* Summary */}
                <section className="grid grid-cols-3 gap-5 max-[1080px]:grid-cols-1">
                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f9e4df] text-[var(--admin-primary)]">
                                <FaBell />
                            </div>

                            <div>
                                <div className="text-[var(--admin-muted)]">
                                    Total Alerts
                                </div>
                                <strong>{totalAlerts}</strong>
                            </div>
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f9e4df] text-[var(--admin-primary)]">
                                <FaEnvelope />
                            </div>

                            <div>
                                <div className="text-[var(--admin-muted)]">
                                    Unread
                                </div>
                                <strong className="text-[var(--admin-primary)]">
                                    {unreadAlerts}
                                </strong>
                            </div>
                        </div>
                    </article>

                    <article className={panelClass}>
                        <div className="flex items-center gap-4 p-6">
                            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#f6dd81] text-[#7b5d00]">
                                <FaEnvelope />
                            </div>

                            <div>
                                <div className="text-[var(--admin-muted)]">
                                    Invitations
                                </div>
                                <strong>{invitationAlerts}</strong>
                            </div>
                        </div>
                    </article>
                </section>

                {/* Filter */}
                <section
                    className={`${panelClass} flex items-center justify-between gap-4 p-4 max-[720px]:flex-col`}
                >
                    <div className="flex gap-3 max-[720px]:w-full max-[720px]:flex-col">
                        <select className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] px-4 py-2 outline-none">
                            <option>Status: All</option>
                        </select>

                        <input
                            type="date"
                            className="rounded-md border border-[var(--admin-border)] bg-[#fff8f6] px-4 py-2 outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button className="rounded-md border border-[var(--admin-primary)] px-4 py-2 font-bold text-[var(--admin-primary)]">
                            <FaCheck className="mr-2 inline" />
                            Mark All Read
                        </button>

                        <button className="rounded-md bg-[var(--admin-primary)] px-4 py-2 font-bold text-white">
                            <FaFilter className="mr-2 inline" />
                            Sort
                        </button>
                    </div>
                </section>

                {/* Main */}
                <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-5 max-[1080px]:grid-cols-1">
                    {/* Notifications */}
                    <div className="grid gap-4">
                        {notifications.map((item) => (
                            <article
                                key={item.id}
                                className={`${panelClass} ${item.unread
                                    ? 'border-l-4 border-l-[var(--admin-primary)]'
                                    : ''
                                    }`}
                            >
                                <div className="flex gap-4 p-5">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f9e4df] text-[var(--admin-primary)]">
                                        {item.type === 'results' ? (
                                            <FaTrophy />
                                        ) : item.type === 'system' ? (
                                            <FaCog />
                                        ) : (
                                            <FaEnvelope />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <strong>
                                                {item.title}
                                            </strong>

                                            {getBadge(item.type)}
                                        </div>

                                        <p className="mt-2 text-[0.9rem] text-[var(--admin-muted)]">
                                            {item.description}
                                        </p>

                                        <div className="mt-3 text-[0.85rem] text-[var(--admin-muted)]">
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Detail Panel */}
                    <aside className={panelClass}>
                        <img
                            src="https://images.unsplash.com/photo-1517849845537-4d257902454a"
                            alt="Race"
                            className="h-[160px] w-full object-cover"
                        />

                        <div className="p-5">
                            <h3 className="mb-5 text-lg font-bold">
                                Race Details
                            </h3>

                            <div className="grid gap-4 text-[0.9rem]">
                                <div>
                                    <div className="text-[var(--admin-muted)]">
                                        Event
                                    </div>

                                    <strong>
                                        Grand Ascot Cup - G1 Stakes
                                    </strong>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[var(--admin-muted)]">
                                            Date
                                        </div>

                                        <strong>
                                            14 July, 2024
                                        </strong>
                                    </div>

                                    <div>
                                        <div className="text-[var(--admin-muted)]">
                                            Time
                                        </div>

                                        <strong>
                                            16:30 GMT
                                        </strong>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[var(--admin-muted)]">
                                        Horse
                                    </div>

                                    <strong className="text-[var(--admin-primary)]">
                                        Thunderbolt
                                    </strong>
                                </div>

                                <div className="rounded-lg border border-[var(--admin-border)] bg-[#fff8f6] p-4">
                                    <div className="mb-2 font-bold">
                                        Message from Trainer
                                    </div>

                                    <p className="italic text-[var(--admin-muted)]">
                                        Sebastian, we believe
                                        Thunderbolt is at peak
                                        performance. We want
                                        you on him for the Cup.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </section>
        </JockeyLayout>
    );
}

export default JockeyNotifications;