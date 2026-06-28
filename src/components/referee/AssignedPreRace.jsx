import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaArrowRight,
    FaMapMarkerAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import { resolveFileUrl } from '../../api/uploadApi';
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

function CertificatePreviewList({ certificates }) {
    if (!certificates?.length) {
        return (
            <p className="m-0 mt-2 text-xs font-semibold text-gray-500">
                No health certificates uploaded yet.
            </p>
        );
    }

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {certificates.slice(0, 3).map((item) => {
                const resolvedUrl = resolveFileUrl(item.healthCertificateImageUrl);

                return (
                    <span
                        key={item.registrationId}
                        className="inline-flex items-center gap-2 rounded border border-[#ead3cf] bg-white px-2 py-1 text-xs font-bold text-[#7d0000]"
                    >
                        <img
                            src={resolvedUrl}
                            alt="Health certificate"
                            className="h-7 w-9 rounded object-cover"
                        />
                        {item.horseName || `#${item.registrationId}`}
                    </span>
                );
            })}
            {certificates.length > 3 && (
                <span className="inline-flex items-center rounded bg-[#f7efee] px-2 py-1 text-xs font-bold text-[#7d0000]">
                    +{certificates.length - 3} more
                </span>
            )}
        </div>
    );
}

function AssignedPreRace() {
    const navigate = useNavigate();

    const [races, setRaces] = useState([]);
    const [certificatesByRace, setCertificatesByRace] = useState({});
    const [loadingRaces, setLoadingRaces] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadRaces() {
            setLoadingRaces(true);
            setError('');
            setCertificatesByRace({});

            try {
                const data = await refereeApi.getAssignedRaces();
                const assignedRaces = (data ?? []).filter(
                    (r) => r.raceStatus === 'Scheduled'
                );

                if (!ignore) {
                    setRaces(assignedRaces);
                }

                Promise.allSettled(
                    assignedRaces.map(async (race) => {
                        const registrations = await refereeApi.getRaceRegistrations(race.raceId);
                        return [
                            race.raceId,
                            (registrations ?? []).filter((item) => item.healthCertificateImageUrl),
                        ];
                    })
                ).then((results) => {
                    if (ignore) return;

                    const next = {};

                    results.forEach((result) => {
                        if (result.status === 'fulfilled') {
                            const [raceId, certificates] = result.value;
                            next[raceId] = certificates;
                        }
                    });

                    setCertificatesByRace(next);
                });
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
        <RefereeLayout activeKey="pre-race">
            <section className="page-shell">
                <h1 className="page-title">
                    Pre-Race Tournaments
                </h1>

                <p className="page-subtitle">
                    Select a tournament race to open its inspection registry on a separate page.
                </p>

                {error && (
                    <div className="mt-6 rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {loadingRaces ? (
                        <div className="soft-card p-6 text-gray-500">
                            Loading assigned races...
                        </div>
                    ) : races.length === 0 ? (
                        <div className="soft-card p-6 text-gray-500">
                            No scheduled races for pre-race inspection.
                        </div>
                    ) : (
                        races.map((race) => {
                            const certificates = certificatesByRace[race.raceId] ?? [];

                            return (
                            <button
                                type="button"
                                key={race.raceId}
                                onClick={() => openInspectionRegistry(race)}
                                className="soft-card group cursor-pointer p-6 text-left transition hover:border-[#7d0000] hover:shadow-md"
                            >
                                <div className="flex justify-between">
                                    <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                        {race.raceStatus}
                                    </span>

                                    <span className="font-bold">
                                        #{race.raceId}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-[1.05rem] font-bold text-[#2b1b1b]">
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

                                <div className="mt-4 border-t pt-3">
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

                                <div className="mt-4 rounded border border-[#ead3cf] bg-[#fff8f6] p-3">
                                    <div className="text-xs font-bold uppercase text-[#7d0000]">
                                        Health Certificates ({certificates.length})
                                    </div>
                                    <CertificatePreviewList certificates={certificates} />
                                </div>

                                <div className="secondary-button mt-6 gap-3 group-hover:bg-[#7d0000] group-hover:text-white">
                                    Open Inspection Registry
                                    <FaArrowRight />
                                </div>
                            </button>
                            );
                        })
                    )}
                </div>
            </section>
        </RefereeLayout>
    );
}

export default AssignedPreRace;
