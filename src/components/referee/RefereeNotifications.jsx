import {
    FaBell,
    FaExclamationTriangle,
    FaInfoCircle,
} from 'react-icons/fa';

import RefereeLayout from './RefereeLayout';

function RefereeNotification() {
    const notifications = [
        {
            title: 'New Race Assignment',
            preview: 'You have been appointed as Lead...',
            time: '10m ago',
            tag: 'NEW',
        },
        {
            title: 'Pre-race Inspection Pending',
            preview: '3 horses in Heat 4 require...',
            time: '45m ago',
        },
        {
            title: 'Result Submission Deadline',
            preview: 'Reminder: Final results for Dubai...',
            time: '2h ago',
        },
        {
            title: 'Race Violation Report Needed',
            preview: 'Protest filed in Race 7 regarding...',
            time: '4h ago',
        },
        {
            title: 'System Maintenance Update',
            preview: 'Database sync scheduled for...',
            time: '1d ago',
        },
    ];

    return (
        <RefereeLayout
            activeKey="notifications"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="min-h-screen bg-[#faf8f8] p-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#7d0000]">
                        Referee Notifications
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Track race assignments, inspection updates,
                        result submissions, and official race alerts.
                    </p>
                </div>

                {/* STATS */}
                <div className="mb-8 flex gap-5">

                    <div className="flex w-52 justify-between rounded-xl border border-[#ead3cf] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-gray-500">
                                Total Notifications
                            </p>

                            <h3 className="mt-2 text-2xl font-bold">
                                24
                            </h3>
                        </div>

                        <FaBell
                            className="text-[#8b0000]"
                            size={22}
                        />
                    </div>

                    <div className="flex w-52 justify-between rounded-xl border border-[#ead3cf] bg-white p-5">
                        <div>
                            <p className="text-sm uppercase text-gray-500">
                                Unread Alerts
                            </p>

                            <h3 className="mt-2 text-2xl font-bold text-red-600">
                                8
                            </h3>
                        </div>

                        <FaExclamationTriangle
                            className="text-red-500"
                            size={22}
                        />
                    </div>

                </div>

                {/* CONTENT */}
                <div className="grid gap-8 xl:grid-cols-[300px_1fr]">

                    {/* LEFT PANEL */}
                    <div className="space-y-2">

                        {notifications.map((item) => (
                            <div
                                key={item.title}
                                className="cursor-pointer rounded-xl border border-[#ead3cf] bg-white p-4 hover:bg-[#faf5f4]"
                            >
                                <div className="flex justify-between">
                                    <h3 className="font-medium">
                                        {item.title}
                                    </h3>

                                    <span className="text-sm text-gray-500">
                                        {item.time}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    {item.preview}
                                </p>

                                {item.tag && (
                                    <span className="mt-3 inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                        {item.tag}
                                    </span>
                                )}
                            </div>
                        ))}

                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-4">

                        <div className="overflow-hidden rounded-xl border border-[#ead3cf] bg-white">

                            <div className="flex items-center justify-between border-b p-4">

                                <div className="rounded-full bg-[#f3a697] px-4 py-1 text-sm text-white">
                                    Race Assignment
                                </div>

                                <div className="text-right">
                                    <p className="text-xs uppercase text-gray-500">
                                        Time Received
                                    </p>

                                    <p className="font-medium">
                                        Today, 09:12 AM
                                    </p>
                                </div>

                            </div>

                            <div className="p-6 text-gray-700 leading-8">

                                <p>Dear Ethan Crawford,</p>

                                <br />

                                <p>
                                    You have been assigned as the Lead
                                    Field Referee for the upcoming Royal
                                    Ascot Sprint Invitational.
                                </p>

                                <p>
                                    This assignment involves overseeing
                                    the start gate alignment, monitoring
                                    mid-race trajectory, and confirming
                                    the photo-finish sequence for Race 3
                                    and Race 5.
                                </p>

                                <br />

                                <p>
                                    Please ensure your pre-race checklist
                                    is completed in the system 60 minutes
                                    before the first bell.
                                </p>

                            </div>

                            <div className="border-t p-4">

                                <div className="flex flex-wrap gap-3">

                                    <button className="rounded-lg bg-[#8b0000] px-5 py-2 text-white">
                                        View Assigned Race
                                    </button>

                                    <button className="rounded-lg border px-5 py-2">
                                        Open Inspection
                                    </button>

                                    <button className="rounded-lg border px-5 py-2">
                                        Enter Results
                                    </button>

                                    <button className="rounded-lg border px-5 py-2">
                                        Mark as Read
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* ACTIVITY */}
                        <div className="rounded-xl border border-[#ead3cf] bg-white p-5">

                            <h3 className="mb-5 font-semibold">
                                Recent Referee Activity
                            </h3>

                            <div className="space-y-4">

                                <div className="flex gap-3">
                                    <div className="mt-2 h-3 w-3 rounded-full bg-red-700" />
                                    <div>
                                        <p>
                                            Assigned to Royal Ascot Sprint
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Today, 09:12 AM
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-2 h-3 w-3 rounded-full bg-yellow-500" />
                                    <div>
                                        <p>
                                            Completed Paddock Inspection -
                                            Dubai Derby
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Yesterday, 04:30 PM
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-2 h-3 w-3 rounded-full bg-blue-700" />
                                    <div>
                                        <p>
                                            Submitted Final Race Report
                                            #8821
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Oct 22, 11:15 AM
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </RefereeLayout>
    );
}

export default RefereeNotification;