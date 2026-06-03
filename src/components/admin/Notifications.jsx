import {
    FaBell,
    FaCalendarCheck,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaExclamationTriangle,
    FaFlagCheckered,
    FaSearch,
    FaTh,
    FaTrophy,
} from 'react-icons/fa';

import AdminLayout from './AdminLayout';

const summaryCards = [
    {
        marker: 'System Total',
        value: '248',
        label: 'Total Notifications',
        tone: 'total',
        icon: FaBell,
    },
    {
        marker: 'Action Required',
        value: '18',
        label: 'Unread Notifications',
        tone: 'action',
        icon: FaCalendarCheck,
    },
];

const notifications = [
    {
        title: 'New Tournament Registration Pending',
        time: '5 minutes ago',
        tone: 'registration',
        icon: FaTh,
        tags: [
            {
                label: 'Registration',
                tone: 'gold',
            },
            {
                label: 'High Priority',
                tone: 'gold-dark',
            },
        ],
        message: (
            <>
                3 horse registrations are waiting for admin approval for the <strong>Golden Oaks Derby</strong>.
            </>
        ),
    },
    {
        title: 'Race Result Submitted',
        time: '20 minutes ago',
        tone: 'race',
        icon: FaFlagCheckered,
        tags: [
            {
                label: 'Race Result',
                tone: 'blue',
            },
            {
                label: 'Medium Priority',
                tone: 'blue-dark',
            },
        ],
        message: (
            <>
                Referee <strong>Alex Morgan</strong> submitted final results for Dubai Sprint Cup for verification.
            </>
        ),
    },
    {
        title: 'Horse Report Submitted',
        time: '1 hour ago',
        tone: 'urgent',
        icon: FaExclamationTriangle,
        tags: [
            {
                label: 'Referee Report',
                tone: 'red',
            },
            {
                label: 'Critical',
                tone: 'red-dark',
            },
        ],
        message: (
            <>
                A referee reported a health issue for <strong>Shadow Flame</strong>. Urgent veterinary review required.
            </>
        ),
    },
    {
        title: 'Prediction Event Completed',
        time: 'Today, 09:24 AM',
        tone: 'prediction',
        icon: FaTrophy,
        tags: [
            {
                label: 'Prediction',
                tone: 'rose',
            },
            {
                label: 'Low Priority',
                tone: 'rose-dark',
            },
        ],
        message: (
            <>
                The predictions for the Autumn Cup are finalized. Rewards are ready for global distribution.
            </>
        ),
    },
];

const pageShellClass = [
    '[--notifications-soft:#fff4f1]',
    '[--notifications-line:#edcfc9]',
    'grid min-h-[calc(100vh-64px)] content-start gap-[26px] px-[52px] py-11 max-[820px]:px-5 max-[820px]:py-8',
].join(' ');

const panelWidthClass = 'w-[min(100%,1110px)]';

const summaryIconClass = {
    total: 'bg-[#ffe5e2] text-[var(--admin-primary)]',
    action: 'bg-[#ffd15c] text-[#744f04]',
};

const notificationIconClass = {
    registration: 'bg-[#ffd66a] text-[#795602]',
    race: 'bg-[#e4e3ff] text-[#4d4cc3]',
    urgent: 'bg-[#ffd9d4] text-[#c51f1f]',
    prediction: 'bg-[#f2dcd7] text-[#965f56]',
};

const tagClass = {
    gold: 'bg-[#ffe2a0] text-[#7a5604]',
    'gold-dark': 'bg-[#e1bd55] text-[#3f320a]',
    blue: 'bg-[#dedfff] text-[#3732a1]',
    'blue-dark': 'bg-[#bfc2ff] text-[#27236f]',
    red: 'bg-[#ffd3cd] text-[#9a1111]',
    'red-dark': 'bg-[#b40d0d] text-white',
    rose: 'bg-[#f2dcd7] text-[#805349]',
    'rose-dark': 'bg-[#ead0cb] text-[#7a5d58]',
};

const selectClass = 'h-full w-full min-w-0 cursor-pointer border-0 bg-transparent px-0 pr-6 text-[0.78rem] font-bold text-[#5f4b47] outline-0';
const paginationButtonClass = 'grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-md border border-[var(--notifications-line)] bg-[#fffdfc] text-[0.78rem] font-extrabold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';

function Notifications() {
    return (
        <AdminLayout activeKey="notifications" mainClassName="notifications-main">
                <section className={pageShellClass}>
                    <div>
                        <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[820px]:text-[1.6rem]">
                            Notifications
                        </h1>
                        <p className="mt-2 max-w-[520px] text-[0.92rem] font-semibold leading-[1.45] text-[var(--admin-muted)]">
                            Monitor system updates, approvals, reports, and important activities.
                        </p>
                    </div>

                    <section
                        aria-label="Notifications summary"
                        className={`${panelWidthClass} grid grid-cols-2 gap-[26px] max-[820px]:grid-cols-1`}
                    >
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article
                                    className="grid min-h-[148px] content-start gap-2.5 rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-6 pb-5 pt-6 shadow-[0_14px_30px_rgba(91,26,19,0.05)]"
                                    key={card.label}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <span className={`grid h-[38px] w-[38px] place-items-center rounded-lg ${summaryIconClass[card.tone]}`}>
                                            <Icon aria-hidden="true" className="h-4 w-4" />
                                        </span>
                                        <small className="text-[0.58rem] font-black uppercase text-[#5f4b47]">
                                            {card.marker}
                                        </small>
                                    </div>
                                    <strong className="text-[2rem] leading-none text-[var(--admin-primary-dark)]">
                                        {card.value}
                                    </strong>
                                    <span className="text-[0.82rem] font-bold text-[#5f4b47]">{card.label}</span>
                                </article>
                            );
                        })}
                    </section>

                    <section
                        aria-label="Notification filters"
                        className={`${panelWidthClass} grid min-h-[62px] grid-cols-[minmax(240px,1fr)_180px_180px_180px] items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--notifications-soft)] px-[18px] py-3 max-[1180px]:grid-cols-2 max-[820px]:grid-cols-1`}
                    >
                        <label className="flex h-[38px] items-center gap-2.5 rounded-md border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661]">
                            <FaSearch aria-hidden="true" />
                            <input
                                className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-[0.78rem] text-[var(--admin-ink)] outline-0"
                                placeholder="Search notifications..."
                                type="search"
                            />
                        </label>

                        <label className="flex h-[38px] items-center rounded-md border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661]">
                            <select className={selectClass} defaultValue="all-types">
                                <option value="all-types">All Types</option>
                                <option value="registration">Registration</option>
                                <option value="race-result">Race Result</option>
                                <option value="report">Report</option>
                                <option value="prediction">Prediction</option>
                            </select>
                        </label>

                        <label className="flex h-[38px] items-center rounded-md border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661]">
                            <select className={selectClass} defaultValue="all-status">
                                <option value="all-status">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </label>

                        <label className="flex h-[38px] items-center rounded-md border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-3 text-[#826661]">
                            <select className={selectClass} defaultValue="all-priority">
                                <option value="all-priority">All Priority</option>
                                <option value="critical">Critical</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                        </label>
                    </section>

                    <section aria-label="Notification list" className={`${panelWidthClass} grid gap-[18px]`}>
                        {notifications.map((notification) => {
                            const Icon = notification.icon;

                            return (
                                <article
                                    className={[
                                        'relative grid min-h-[146px] grid-cols-[auto_minmax(0,1fr)] gap-[18px] rounded-[var(--admin-radius)] border border-[var(--notifications-line)] bg-[var(--admin-surface)] px-[22px] py-[22px] shadow-[0_14px_28px_rgba(91,26,19,0.04)] max-[820px]:grid-cols-1',
                                        notification.tone === 'urgent' ? 'before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full before:bg-[#e42121] before:content-[""]' : '',
                                    ].join(' ')}
                                    key={notification.title}
                                >
                                    <span className={`grid h-[42px] w-[42px] place-items-center rounded-full ${notificationIconClass[notification.tone]}`}>
                                        <Icon aria-hidden="true" className="h-4 w-4" />
                                    </span>

                                    <div className="min-w-0">
                                        <div className="flex items-start justify-between gap-[18px] max-[820px]:flex-col">
                                            <h2 className="m-0 text-base leading-[1.2] text-[var(--admin-ink)]">
                                                {notification.title}
                                            </h2>
                                            <time className="inline-flex items-center gap-[5px] whitespace-nowrap text-[0.76rem] font-bold text-[#6f5a56]">
                                                <FaClock aria-hidden="true" className="h-[11px] w-[11px]" />
                                                <span>{notification.time}</span>
                                            </time>
                                        </div>

                                        <p className="mt-1.5 max-w-[680px] text-[0.82rem] font-semibold leading-[1.45] text-[#5f4b47] [&_strong]:text-[var(--admin-primary)]">
                                            {notification.message}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {notification.tags.map((tag) => (
                                                <span
                                                    className={`inline-flex min-h-5 items-center rounded px-2 text-[0.58rem] font-black uppercase ${tagClass[tag.tone]}`}
                                                    key={tag.label}
                                                >
                                                    {tag.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <div className={`${panelWidthClass} flex min-h-[58px] items-center justify-between gap-[18px] border-t border-[var(--notifications-line)] pt-2.5 text-[0.78rem] font-bold text-[var(--admin-muted)] max-[820px]:flex-col max-[820px]:items-stretch`}>
                        <span>Showing 1 to 4 of 248 entries</span>

                        <div className="flex items-center gap-2 max-[820px]:flex-wrap">
                            <button aria-label="Previous page" className={paginationButtonClass} type="button">
                                <FaChevronLeft aria-hidden="true" className="h-2.5 w-2.5" />
                            </button>
                            <button className={`${paginationButtonClass} border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]`} type="button">1</button>
                            <button className={paginationButtonClass} type="button">2</button>
                            <button className={paginationButtonClass} type="button">3</button>
                            <span className="font-black text-[#705f5b]">...</span>
                            <button className={paginationButtonClass} type="button">62</button>
                            <button aria-label="Next page" className={paginationButtonClass} type="button">
                                <FaChevronRight aria-hidden="true" className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    </div>

                    <footer className={`${panelWidthClass} mt-[18px] flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[820px]:flex-col max-[820px]:items-stretch`}>
                        <strong className="text-base font-black">Elite Racing League</strong>
                        <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[820px]:justify-start">
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Terms of Service</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Privacy Policy</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Contact Support</a>
                            <a className="text-[0.76rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Racing Rules</a>
                        </nav>
                    </footer>
                </section>
        </AdminLayout>
    );
}

export default Notifications;
