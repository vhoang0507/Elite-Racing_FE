import { NavLink } from 'react-router-dom';

import {
    FaTachometerAlt,
    FaFlagCheckered,
    FaBell,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaUserCircle,
} from 'react-icons/fa';

const menuItems = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: FaTachometerAlt,
        path: '/referee/dashboard',
    },
    {
        key: 'assigned-races',
        label: 'Assigned Races',
        icon: FaFlagCheckered,
        path: '/referee/races',
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: FaBell,
        path: '/referee/notifications',
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: FaCog,
        path: '/referee/settings',
    },
];

function RefereeLayout({
    children,
    activeKey,
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
}) {
    return (
        <div className="flex min-h-screen bg-[#fdf8f7]">

            {/* SIDEBAR */}
            <aside className="flex w-[260px] flex-col border-r border-[#e7d6d2] bg-[#faf5f4]">

                {/* LOGO */}
                <div className="border-b border-[#e7d6d2] px-6 py-7">
                    <h1 className="text-3xl font-black text-[#7d0000]">
                        Elite Racing League
                    </h1>
                </div>

                {/* PROFILE */}
                <div className="px-6 py-6">
                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                            <FaUserCircle
                                size={34}
                                className="text-gray-600"
                            />
                        </div>

                        <div>
                            <h3 className="font-bold text-[#2e1d1d]">
                                Ethan Crawford
                            </h3>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Official Referee Panel
                            </p>
                        </div>
                    </div>
                </div>

                {/* MENU */}
                <nav className="flex-1 px-4">

                    <div className="space-y-2">

                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            const isActive =
                                activeKey === item.key;

                            return (
                                <NavLink
                                    key={item.key}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition ${isActive
                                        ? 'bg-[#8b0000] text-white'
                                        : 'text-[#503838] hover:bg-[#f0e2df]'
                                        }`}
                                >
                                    <Icon />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* FOOTER */}
                <div className="border-t border-[#e7d6d2] p-4">

                    <button
                        type="button"
                        className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[#503838] hover:bg-[#f0e2df]"
                    >
                        <FaQuestionCircle />
                        <span>Support</span>
                    </button>

                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[#503838] hover:bg-[#f0e2df]"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>

                </div>
            </aside>

            {/* MAIN */}
            <div className="flex flex-1 flex-col">

                {/* TOPBAR */}
                <header className="flex h-[80px] items-center justify-between border-b border-[#e7d6d2] bg-white px-8">

                    <div className="w-[320px]">

                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) =>
                                onSearchChange?.(e.target.value)
                            }
                            className="w-full rounded-full border border-[#e3c9c4] bg-[#fffdfd] px-5 py-3 outline-none focus:border-[#8b0000]"
                        />
                    </div>

                    <div className="flex items-center gap-5">

                        <button
                            type="button"
                            className="relative text-[#4e3939]"
                        >
                            <FaBell size={18} />

                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-600" />
                        </button>

                        <button
                            type="button"
                            className="text-[#4e3939]"
                        >
                            <FaUserCircle size={22} />
                        </button>

                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1">
                    {children}
                </main>

            </div>
        </div>
    );
}

export default RefereeLayout;