import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaClipboardCheck,
    FaCheckCircle,
    FaGavel,
    FaTrophy,
    FaFileAlt,
    FaArrowRight,
    FaMapMarkerAlt,
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

function RefereeAssignedRace() {
    const navigate = useNavigate();
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadRaces() {
            setLoading(true);
            setError('');

            try {
                const data = await refereeApi.getAssignedRaces();
                if (!ignore) setRaces(data ?? []);
            } catch (err) {
                if (!ignore) setError(err.message || 'Failed to load assigned races.');
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadRaces();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <RefereeLayout
            activeKey="assigned-races"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="p-8">
                <div className="mb-10">
                    <h1 className="text-5xl font-bold text-[#7d0000]">
                        Assigned Races
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage inspections, race results, and rule violations for assigned races.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-8 rounded-2xl border border-[#ead3cf] bg-white">
                    <div className="flex items-center justify-between border-b border-[#ead3cf] p-5">
                        <h2 className="text-2xl font-bold text-[#2b1b1b]">
                            Current Assignments
                        </h2>

                        <span className="rounded-full bg-[#f7efee] px-4 py-2 text-sm font-bold text-[#7d0000]">
                            {loading ? 'Loading...' : `${races.length} races`}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#faf6f5]">
                                <tr className="text-left">
                                    <th className="p-4">RACE</th>
                                    <th className="p-4">TOURNAMENT</th>
                                    <th className="p-4">DATE</th>
                                    <th className="p-4">DISTANCE</th>
                                    <th className="p-4">STATUS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan="5">
                                            Loading assigned races...
                                        </td>
                                    </tr>
                                ) : races.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan="5">
                                            No assigned races from backend.
                                        </td>
                                    </tr>
                                ) : (
                                    races.map((race) => (
                                        <tr key={race.assignmentId} className="border-t border-[#ead3cf]">
                                            <td className="p-4">
                                                <div className="font-bold text-[#2b1b1b]">
                                                    {race.raceName}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <FaMapMarkerAlt />
                                                    {race.location || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-4">{race.tournamentName}</td>
                                            <td className="p-4">{formatDateTime(race.raceDate)}</td>
                                            <td className="p-4">{race.distanceMeters?.toLocaleString('en-US') ?? 0}m</td>
                                            <td className="p-4">
                                                <span className="rounded bg-[#f7efee] px-3 py-1 text-xs font-bold text-[#7d0000]">
                                                    {race.raceStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#faf5f4]">
                            <FaClipboardCheck size={24} className="text-[#7d0000]" />
                        </div>

                        <h2 className="text-4xl font-bold text-[#2b1b1b]">
                            Pre-Race Inspection
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Review assigned race registrations, mark inspection status, and record inspection notes before the race starts.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-gray-500" />
                                <span>Inspection status from backend</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-gray-500" />
                                <span>Pass, fail, or pending confirmation</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/referee/races/pre-race')}
                            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl border border-[#7d0000] py-4 font-semibold text-[#7d0000] transition hover:bg-[#7d0000] hover:text-white"
                        >
                            Access Inspections
                            <FaArrowRight />
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#faf5f4]">
                            <FaClipboardCheck size={24} className="text-[#7d0000]" />
                        </div>

                        <h2 className="text-4xl font-bold text-[#2b1b1b]">
                            Post-Race
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Submit official results, confirm result entries, create violation records, and file referee reports.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <FaGavel className="text-gray-500" />
                                <span>Violation and penalty log</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaTrophy className="text-gray-500" />
                                <span>Final result certification</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaFileAlt className="text-gray-500" />
                                <span>Post-event summary reports</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/referee/races/post-race')}
                            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl border border-[#7d0000] py-4 font-semibold text-[#7d0000] transition hover:bg-[#7d0000] hover:text-white"
                        >
                            Access Results and Reports
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;
