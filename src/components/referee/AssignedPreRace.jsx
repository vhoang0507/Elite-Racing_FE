import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaArrowRight,
    FaMapMarkerAlt,
} from 'react-icons/fa';

import { refereeApi } from '../../api/refereeApi';
import { resolveFileUrl } from '../../api/uploadApi';
import RefereeLayout from './RefereeLayout';
import Toast from '../shared/Toast';
import { useToast } from '../shared/useToast';

function formatDateTime(value) {
    if (!value) return 'N/A';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

const STATUS_LABELS = {
    AssignedReferee: 'Assigned Referee',
    ClosedRegistration: 'Closed Registration',
    OpenRegistration: 'Open Registration',
    RefereeReady: 'Referee Ready',
    ResultPending: 'Result Pending',
};

function getDisplayStatus(race) {
    return race?.tournamentStatus === 'ClosedRegistration'
        ? race.tournamentStatus
        : race?.raceStatus;
}

function formatStatus(status) {
    return STATUS_LABELS[status] || status || 'N/A';
}

function isSeasonActive(race) {
    return !race?.seasonStatus || race.seasonStatus === 'Active';
}

function canOpenPreRace(race) {
    if (!isSeasonActive(race)) return false;

    const actions = race?.allowedActions ?? {};
    return Boolean(
        actions.canInspect ||
        actions.canSubmitPreRaceReport ||
        actions.canMarkReady ||
        race?.tournamentStatus === 'ClosedRegistration' ||
        ['AssignedReferee', 'Scheduled'].includes(race?.raceStatus)
    );
}

function CertificatePreviewList({ certificates }) {
    if (!certificates?.length) {
        return (
            <p className="m-0 mt-2 text-xs font-semibold text-[var(--admin-muted)]">
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
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white px-2 py-1 text-xs font-bold text-[var(--admin-primary)]"
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
                <span className="inline-flex items-center rounded bg-[var(--admin-surface-strong)] px-2 py-1 text-xs font-bold text-[var(--admin-primary)]">
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
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let ignore = false;

        async function loadRaces() {
            setLoadingRaces(true);
            setCertificatesByRace({});

            try {
                const data = await refereeApi.getAssignedRacesWithLifecycle();
                const assignedRaces = (data ?? []).filter(
                    (r) => canOpenPreRace(r)
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
                    showToast(err.message || 'Failed to load assigned races.', 'error');
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
            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <section className="page-shell">
                <h1 className="page-title">
                    Pre-Race Tournaments
                </h1>

                <p className="page-subtitle">
                    Select a tournament race to open its inspection registry on a separate page.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {loadingRaces ? (
                        <div className="soft-card p-6 text-[var(--admin-muted)]">
                            Loading assigned races...
                        </div>
                    ) : races.length === 0 ? (
                        <div className="soft-card p-6 text-[var(--admin-muted)]">
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
                                className="soft-card group cursor-pointer p-6 text-left transition hover:border-[var(--admin-primary)] hover:shadow-md"
                            >
                                <div className="flex justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-[var(--admin-surface-strong)] px-3 py-1 text-xs font-semibold">
                                            {formatStatus(getDisplayStatus(race))}
                                        </span>
                                        {race.seasonStatus && (
                                            <span className="rounded-full bg-[var(--admin-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--admin-primary)]">
                                                Season: {race.seasonStatus}
                                            </span>
                                        )}
                                    </div>

                                    <span className="font-bold text-[var(--admin-ink)]">
                                        #{race.raceId}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-[1.05rem] font-bold text-[var(--admin-ink)]">
                                    {race.raceName}
                                </h2>

                                {race.tournamentName && (
                                    <p className="mt-1 text-sm font-semibold text-[var(--admin-primary)]">
                                        {race.tournamentName}
                                    </p>
                                )}

                                <div className="mt-2 flex items-center gap-2 text-[var(--admin-muted)]">
                                    <FaMapMarkerAlt />
                                    {race.location || 'N/A'}
                                </div>

                                <div className="mt-4 border-t border-[var(--admin-border)] pt-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-[var(--admin-muted)]">
                                                TIME
                                            </div>

                                            <div className="font-semibold">
                                                {formatDateTime(race.raceDate)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-[var(--admin-muted)]">
                                                DISTANCE
                                            </div>

                                            <div className="font-semibold">
                                                {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-3">
                                    <div className="text-xs font-bold uppercase text-[var(--admin-primary)]">
                                        Health Certificates ({certificates.length})
                                    </div>
                                    <CertificatePreviewList certificates={certificates} />
                                </div>

                                <div className="secondary-button mt-6 gap-3 group-hover:bg-[var(--admin-primary)] group-hover:text-white">
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
