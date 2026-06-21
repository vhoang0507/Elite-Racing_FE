import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function AssignedPreRace() {
    const navigate = useNavigate();

    const [races, setRaces] = useState([]);
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadRaces() {
            setLoadingRaces(true);
            setError('');

            try {
                const data = await refereeApi.getAssignedRaces();

                if (!ignore) {
                    setRaces(data ?? []);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load assigned races.');
                }
            } finally {
                if (!ignore) {
                    setLoadingRaces(false);
                }
            }
        }

        loadRaces();

        return () => {
            ignore = true;
        };
    }, []);

    const openInspectionRegistry = (race) => {
        navigate(`/referee/races/pre-race/${race.raceId}`, {
            state: { race },
        });
    };

    return (
        <RefereeLayout activeKey="assigned-races">
            <div className="p-8">
                <h1 className="text-5xl font-bold text-[#7d0000]">
                    Pre-Race Tournaments
                </h1>

                <p className="mt-2 text-gray-600">
                    Select a tournament race to open its inspection registry on a separate page.
                </p>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {loadingRaces ? (
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-6 text-gray-500">
                            Loading assigned races...
                        </div>
                    ) : races.length === 0 ? (
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-6 text-gray-500">
                            No assigned races from backend.
                        </div>
                    ) : (
                        races.map((race) => (
                            <button
                                type="button"
                                key={race.raceId}
                                onClick={() => openInspectionRegistry(race)}
                                className="group cursor-pointer rounded-2xl border border-[#ead3cf] bg-white p-6 text-left transition hover:border-[#7d0000] hover:shadow-md"
                            >
                                <div className="flex justify-between">
                                    <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                        {race.raceStatus}
                                    </span>

                                    <span className="font-bold">
                                        #{race.raceId}
                                    </span>
                                </div>

                                <h2 className="mt-5 text-3xl font-semibold text-[#2b1b1b]">
                                    {race.raceName}
                                </h2>

                                {race.tournamentName && (
                                    <p className="mt-1 text-sm font-semibold text-[#7d0000]">
                                        {race.tournamentName}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-gray-500">
                                    <FaMapMarkerAlt />
                                    {race.location || 'N/A'}
                                </div>

                                <div className="mt-6 border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-400">
                                                TIME
                                            </div>

                                            <div className="font-semibold">
                                                {formatDateTime(race.raceDate)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-gray-400">
                                                DISTANCE
                                            </div>

                                            <div className="font-semibold">
                                                {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-[#7d0000] py-3 font-semibold text-[#7d0000] transition group-hover:bg-[#7d0000] group-hover:text-white">
                                    Open Inspection Registry
                                    <FaArrowRight />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </RefereeLayout>
    );
}

export default AssignedPreRace;