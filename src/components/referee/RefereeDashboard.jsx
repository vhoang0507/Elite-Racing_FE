import {
    FaClipboardCheck,
    FaExclamationTriangle,
    FaBullhorn,
    FaCheckCircle,
} from 'react-icons/fa';

import RefereeLayout from './RefereeLayout';

function RefereeDashboard() {
    const inspections = [
        {
            time: '14:30',
            event: 'Pre-Race Paddock Inspection',
            race: 'Race 05 - Sprint Cup',
            location: 'Paddock B',
            status: 'Upcoming',
            action: 'Start',
        },
        {
            time: '15:15',
            event: 'Equipment Check',
            race: 'Race 06 - Endurance',
            location: 'Stalls 1-12',
            status: 'Delayed',
            action: 'Review',
        },
        {
            time: '12:00',
            event: 'Track Condition Assessment',
            race: 'Morning Session',
            location: 'Main Track',
            status: 'Completed',
            action: 'View',
        },
    ];

    const updates = [
        {
            title: 'Stewards Inquiry Called',
            text: 'Race 03 - Possible interference at the final turn involving Horse #4 and #7.',
            time: '10 mins ago',
        },
        {
            title: 'Roster Substitution',
            text: 'Jockey J. Smith replaced by M. Davis on Horse #2 for Race 05.',
            time: '45 mins ago',
        },
        {
            title: 'Official Results Posted',
            text: 'Race 02 results have been validated and published.',
            time: '1 hour ago',
        },
    ];

    return (
        <RefereeLayout
            activeKey="dashboard"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="space-y-8 p-8">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-5xl font-bold text-[#2f1d1d]">
                            Referee Overview
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Manage your active inspections and race validations.
                        </p>
                    </div>

                    <div className="rounded-full bg-[#f6e6e2] px-5 py-2 text-sm font-semibold text-[#8b0000]">
                        Oct 24, 2023 • Dubai World Cup Prep
                    </div>
                </div>

                {/* TOP CARDS */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Card 1 */}
                    <div className="rounded-2xl border bg-white p-8 shadow-sm">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-gray-500">
                                    Inspections Completed
                                </p>

                                <h2 className="mt-4 text-6xl font-bold">
                                    24
                                </h2>

                                <span className="font-semibold text-red-600">
                                    ↑ 12%
                                </span>
                            </div>

                            <FaClipboardCheck
                                size={40}
                                className="text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-2xl border bg-white p-8 shadow-sm">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-gray-500">
                                    Pending Inspections
                                </p>

                                <h2 className="mt-4 text-6xl font-bold">
                                    5
                                </h2>

                                <span className="text-gray-500">
                                    Requires Action
                                </span>
                            </div>

                            <FaExclamationTriangle
                                size={40}
                                className="text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Priority Card */}
                    <div className="rounded-2xl bg-gradient-to-r from-[#8b0000] to-[#b30000] p-8 text-white shadow-sm">
                        <span className="rounded bg-white/20 px-3 py-1 text-xs font-bold uppercase">
                            Priority Action
                        </span>

                        <h2 className="mt-4 text-3xl font-bold">
                            Enter Race Results
                        </h2>

                        <p className="mt-3">
                            Race 04 "The Diamond Stakes" concluded 15 minutes
                            ago. Awaiting official referee validation.
                        </p>

                        <button className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-[#8b0000]">
                            Validate Now →
                        </button>
                    </div>
                </div>

                {/* TABLE + UPDATES */}
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b p-5">
                            <h2 className="text-xl font-bold">
                                Assigned Inspections
                            </h2>

                            <button className="font-semibold text-[#8b0000]">
                                View Schedule →
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">

                                <thead className="bg-[#faf5f4]">
                                    <tr>
                                        <th className="p-4 text-left">TIME</th>
                                        <th className="p-4 text-left">
                                            RACE / EVENT
                                        </th>
                                        <th className="p-4 text-left">
                                            LOCATION
                                        </th>
                                        <th className="p-4 text-left">
                                            STATUS
                                        </th>
                                        <th className="p-4 text-left">
                                            ACTION
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inspections.map((item) => (
                                        <tr
                                            key={item.event}
                                            className="border-t"
                                        >
                                            <td className="p-4">
                                                {item.time}
                                            </td>

                                            <td className="p-4">
                                                <div className="font-semibold">
                                                    {item.event}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {item.race}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                {item.location}
                                            </td>

                                            <td className="p-4">

                                                <span
                                                    className={`rounded-md px-3 py-1 text-xs font-semibold
                                                    ${item.status ===
                                                            'Completed'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : item.status ===
                                                                'Delayed'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>

                                            </td>

                                            <td className="p-4 font-semibold text-[#8b0000]">
                                                {item.action}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/* UPDATES */}
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                        <div className="border-b p-5">
                            <h2 className="flex items-center gap-2 text-xl font-bold">
                                <FaBullhorn />
                                Race Updates
                            </h2>
                        </div>

                        {updates.map((item) => (
                            <div
                                key={item.title}
                                className="border-b p-5"
                            >
                                <div className="flex gap-3">

                                    <FaCheckCircle className="mt-1 text-red-500" />

                                    <div>
                                        <h3 className="font-semibold">
                                            {item.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-600">
                                            {item.text}
                                        </p>

                                        <span className="mt-3 block text-xs text-gray-400">
                                            {item.time}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}

                        <button className="w-full p-4 font-semibold text-[#8b0000]">
                            View All Notifications
                        </button>

                    </div>
                </div>
            </div>
        </RefereeLayout>
    );
}

export default RefereeDashboard;