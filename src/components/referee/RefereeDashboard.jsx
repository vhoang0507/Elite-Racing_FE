import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaClipboardCheck,
    FaExclamationTriangle,
    FaBullhorn,
    FaCheckCircle,
    FaFileAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import RefereeLayout from './RefereeLayout';

function formatDateTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatTime(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function RefereeDashboard() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadDashboard() {
            setLoading(true);
            setError('');

            try {
                const data = await refereeApi.getRefereeDashboard();
                if (!ignore) setDashboard(data);
            } catch (err) {
                if (!ignore) setError(err.message || 'Failed to load referee dashboard.');
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadDashboard();

        return () => {
            ignore = true;
        };
    }, []);

    const summary = dashboard?.summary ?? {};
    const upcomingRaces = useMemo(() => dashboard?.upcomingRaces ?? [], [dashboard]);
    const recentViolations = dashboard?.recentViolations ?? [];

    const completedInspections = (summary.passedInspections ?? 0) + (summary.failedInspections ?? 0);
    const priorityRace = useMemo(
        () => upcomingRaces.find((race) => ['Ongoing', 'Completed', 'ResultPending'].includes(race.raceStatus)) ?? upcomingRaces[0],
        [upcomingRaces]
    );

    return (
        <RefereeLayout
            activeKey="dashboard"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="space-y-8 p-8">
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
                        {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                        }).format(new Date())}
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border bg-white p-8 text-center font-semibold text-gray-500">
                        Loading referee dashboard...
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 lg:grid-cols-4">
                            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold uppercase text-gray-500">
                                            Assigned Races
                                        </p>

                                        <h2 className="mt-4 text-6xl font-bold">
                                            {summary.assignedRaces ?? 0}
                                        </h2>

                                        <span className="font-semibold text-gray-500">
                                            Active assignments
                                        </span>
                                    </div>

                                    <FaClipboardCheck size={40} className="text-gray-300" />
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold uppercase text-gray-500">
                                            Inspections Done
                                        </p>

                                        <h2 className="mt-4 text-6xl font-bold">
                                            {completedInspections}
                                        </h2>

                                        <span className="font-semibold text-green-600">
                                            {summary.passedInspections ?? 0} passed
                                        </span>
                                    </div>

                                    <FaCheckCircle size={40} className="text-gray-300" />
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold uppercase text-gray-500">
                                            Pending Inspections
                                        </p>

                                        <h2 className="mt-4 text-6xl font-bold">
                                            {summary.pendingInspections ?? 0}
                                        </h2>

                                        <span className="text-gray-500">
                                            Requires action
                                        </span>
                                    </div>

                                    <FaExclamationTriangle size={40} className="text-gray-300" />
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-8 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold uppercase text-gray-500">
                                            Reports Submitted
                                        </p>

                                        <h2 className="mt-4 text-6xl font-bold">
                                            {summary.submittedReports ?? 0}
                                        </h2>

                                        <span className="text-gray-500">
                                            {summary.violationReports ?? 0} violations
                                        </span>
                                    </div>

                                    <FaFileAlt size={40} className="text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-r from-[#8b0000] to-[#b30000] p-8 text-white shadow-sm">
                            <span className="rounded bg-white/20 px-3 py-1 text-xs font-bold uppercase">
                                Priority Action
                            </span>

                            <h2 className="mt-4 text-3xl font-bold">
                                {priorityRace ? 'Review Assigned Race' : 'No Assigned Race'}
                            </h2>

                            <p className="mt-3 max-w-3xl">
                                {priorityRace
                                    ? `${priorityRace.raceName} at ${priorityRace.location || 'N/A'} is scheduled for ${formatDateTime(priorityRace.raceDate)}.`
                                    : 'There are no assigned races from the backend for this referee account.'}
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate('/referee/races/post-race')}
                                disabled={!priorityRace}
                                className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-[#8b0000] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Open Race Workflow
                            </button>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b p-5">
                                    <h2 className="text-xl font-bold">
                                        Assigned Races
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/referee/races')}
                                        className="font-semibold text-[#8b0000]"
                                    >
                                        View Schedule
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#faf5f4]">
                                            <tr>
                                                <th className="p-4 text-left">TIME</th>
                                                <th className="p-4 text-left">RACE</th>
                                                <th className="p-4 text-left">LOCATION</th>
                                                <th className="p-4 text-left">STATUS</th>
                                                <th className="p-4 text-left">ACTION</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {upcomingRaces.length === 0 ? (
                                                <tr>
                                                    <td className="p-6 text-center text-gray-500" colSpan="5">
                                                        No assigned races.
                                                    </td>
                                                </tr>
                                            ) : (
                                                upcomingRaces.map((item) => (
                                                    <tr key={item.assignmentId} className="border-t">
                                                        <td className="p-4">
                                                            {formatTime(item.raceDate)}
                                                        </td>

                                                        <td className="p-4">
                                                            <div className="font-semibold">
                                                                {item.raceName}
                                                            </div>

                                                            <div className="text-sm text-gray-500">
                                                                {item.tournamentName}
                                                            </div>
                                                        </td>

                                                        <td className="p-4">
                                                            {item.location || 'N/A'}
                                                        </td>

                                                        <td className="p-4">
                                                            <span className="rounded-md bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                                {item.raceStatus}
                                                            </span>
                                                        </td>

                                                        <td className="p-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate('/referee/races/pre-race')}
                                                                className="font-semibold text-[#8b0000]"
                                                            >
                                                                Inspect
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                <div className="border-b p-5">
                                    <h2 className="flex items-center gap-2 text-xl font-bold">
                                        <FaBullhorn />
                                        Recent Violations
                                    </h2>
                                </div>

                                {recentViolations.length === 0 ? (
                                    <div className="p-5 text-sm text-gray-500">
                                        No violation reports from this referee yet.
                                    </div>
                                ) : (
                                    recentViolations.map((item) => (
                                        <div key={item.violationId} className="border-b p-5">
                                            <div className="flex gap-3">
                                                <FaExclamationTriangle className="mt-1 text-red-500" />

                                                <div>
                                                    <h3 className="font-semibold">
                                                        {item.violationType}
                                                    </h3>

                                                    <p className="mt-2 text-sm text-gray-600">
                                                        {item.horseName} in {item.raceName}. Action: {item.action}.
                                                    </p>

                                                    <span className="mt-3 block text-xs text-gray-400">
                                                        {formatDateTime(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <button
                                    type="button"
                                    onClick={() => navigate('/referee/races/post-race')}
                                    className="w-full p-4 font-semibold text-[#8b0000]"
                                >
                                    Open Violation Log
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </RefereeLayout>
    );
}

export default RefereeDashboard;
