import { useState, useEffect, useMemo } from 'react';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaHorseHead,
    FaUsers,
    FaTimes,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import { resolveFileUrl } from '../../api/uploadApi';
import ImageLightbox from '../shared/ImageLightbox';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

function HealthCertificateLink({ url }) {
    if (!url) {
        return <span className="text-[var(--admin-muted)]">Not uploaded</span>;
    }

    const [lightboxSrc, setLightboxSrc] = useState(null);
    const resolvedUrl = resolveFileUrl(url);

    return (
        <>
            <button
                className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-bold text-[var(--admin-primary)] hover:underline"
                onClick={() => setLightboxSrc(resolvedUrl)}
                type="button"
            >
                <img alt="Health certificate" className="h-7 w-9 rounded border border-[var(--admin-border)] object-cover" src={resolvedUrl} />
                Open certificate
            </button>
            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
    );
}

function AcceptedRaces() {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRace, setSelectedRace] = useState(null);
    const [selectedRaceLoading, setSelectedRaceLoading] = useState(false);
    const [selectedRaceError, setSelectedRaceError] = useState('');
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        jockeyApi.getAcceptedRaces()
            .then(res => setRaces(res.items ?? []))
            .catch(() => setRaces([]))
            .finally(() => setLoading(false));
    }, []);

    const upcomingCount = races.filter(r => new Date(r.raceDate) > new Date()).length;

    const filteredRaces = useMemo(() => {
        const now = new Date();
        const q = search.trim().toLowerCase();
        return races.filter(race => {
            const matchesSearch = !q || [race.raceName, race.tournamentName, race.location, race.horseName]
                .some(v => String(v || '').toLowerCase().includes(q));
            const isUpcoming = new Date(race.raceDate) >= now;
            const matchesDate = dateFilter === 'all' || (dateFilter === 'upcoming' ? isUpcoming : !isUpcoming);
            return matchesSearch && matchesDate;
        });
    }, [races, search, dateFilter]);

    const handleViewRaceDetail = async (race) => {
        setSelectedRace(race);
        setSelectedRaceError('');
        setSelectedRaceLoading(true);

        try {
            const detail = await jockeyApi.getRaceDetail(race.raceId);
            setSelectedRace({ ...race, ...detail });
        } catch (err) {
            setSelectedRaceError(err.message || 'Failed to load race detail');
        } finally {
            setSelectedRaceLoading(false);
        }
    };

    const handleCloseRaceDetail = () => {
        setSelectedRace(null);
        setSelectedRaceError('');
        setSelectedRaceLoading(false);
    };

    if (loading) return (
        <JockeyLayout activeKey="accepted">
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="accepted">
            <section className={pageShellClass}>
                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)]">
                        Accepted Races
                    </h1>
                    <p className="mb-0 mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Track your confirmed races, schedules, and assigned horses.
                    </p>
                </div>

                {/* Summary Cards */}
                <section className="grid grid-cols-2 gap-5 max-[720px]:grid-cols-1">
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f7ef] text-[var(--admin-primary)]">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Accepted Races</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">{races.length}</strong>
                        </div>
                    </article>
                    <article className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f2fd] text-[#1565c0]">
                            <FaCalendarAlt />
                        </div>
                        <div>
                            <span className="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--admin-muted)]">Upcoming Races</span>
                            <strong className="block text-[1.5rem] leading-[1.2] text-[var(--admin-ink)]">{upcomingCount}</strong>
                        </div>
                    </article>
                </section>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search race, tournament, location..."
                        className="h-9 flex-1 min-w-[200px] rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                    />
                    <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem]"
                    >
                        <option value="all">All Dates</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </select>
                </div>

                {/* Race Cards */}
                <div className="grid gap-6">
                    {filteredRaces.length === 0 ? (
                        <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '24px' }}>
                            {races.length === 0 ? 'No accepted races yet' : 'No races match your filter.'}
                        </p>
                    ) : (
                        filteredRaces.map((race) => (
                            <article key={race.raceRegistrationId} className="grid grid-cols-[200px_1fr] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] max-[800px]:grid-cols-1">
                                <div className="h-full min-h-[200px] overflow-hidden bg-[#3d2c1e] flex items-center justify-center max-[800px]:h-[160px]">
                                    {race.horseImageUrl ? (
                                        <img src={resolveFileUrl(race.horseImageUrl)} alt={race.horseName || 'Horse'} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-[4rem]">🏇</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 p-5">
                                    <div>
                                        <strong className="block text-[1.1rem] text-[var(--admin-ink)]">{race.raceName}</strong>
                                        <span className="inline-flex mt-1 rounded bg-[#e8f5e9] px-2 py-0.5 text-[0.7rem] font-bold text-[#2e7d32]">
                                            {race.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.82rem]">
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Date</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaCalendarAlt className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{formatDate(race.raceDate)}</span>
                                            </div>
                                        </div>
                                        {race.location && (
                                            <div>
                                                <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Location</span>
                                                <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                    <FaMapMarkerAlt className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                    <span>{race.location}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Horse</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaHorseHead className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{race.horseName}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Owner</span>
                                            <div className="flex items-center gap-1.5 text-[var(--admin-ink)]">
                                                <FaUsers className="text-[0.65rem] text-[var(--admin-muted)]" />
                                                <span>{race.ownerName}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-[0.65rem] font-bold uppercase text-[var(--admin-muted)]">Health Certificate</span>
                                            <div className="mt-1 text-[var(--admin-ink)]">
                                                <HealthCertificateLink url={race.healthCertificateImageUrl} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-md bg-[var(--admin-primary)] px-5 text-[0.82rem] font-[850] text-white hover:bg-[var(--admin-primary-dark)]"
                                            onClick={() => handleViewRaceDetail(race)}
                                            type="button"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>

                {/* Detail Modal */}
                {selectedRace && (
                    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(45,32,32,0.38)] px-5 py-8 overflow-auto" onClick={handleCloseRaceDetail}>
                        <section className="grid w-[min(600px,100%)] gap-0 overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="relative h-[160px] bg-[#3d2c1e] flex items-center justify-center overflow-hidden">
                                {selectedRace.horseImageUrl ? (
                                    <img src={resolveFileUrl(selectedRace.horseImageUrl)} alt={selectedRace.horseName || 'Horse'} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-[4rem]">🏇</span>
                                )}
                                {selectedRace.horseImageUrl && <div className="absolute inset-0 bg-black/35" />}
                                <button className="absolute right-4 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(0,0,0,0.5)] text-white" onClick={handleCloseRaceDetail} type="button">
                                    <FaTimes />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <h2 className="m-0 text-[1.5rem] font-black text-white">{selectedRace.raceName}</h2>
                                    <span className="mt-1 inline-flex rounded bg-[#e8f5e9] px-2 py-0.5 text-[0.7rem] font-bold text-[#2e7d32]">
                                        {selectedRace.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6">
                                {(selectedRaceLoading || selectedRaceError) && (
                                    <div className={`rounded-md border px-4 py-3 text-[0.82rem] font-bold ${selectedRaceError ? 'border-[#e7a49a] bg-[#e8f7ef] text-[var(--admin-primary)]' : 'border-[var(--admin-border)] bg-[#fff8f6] text-[var(--admin-muted)]'}`}>
                                        {selectedRaceError || 'Loading race detail...'}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                                    <div className="rounded-md bg-[#fff8f6] p-4 text-[0.85rem]">
                                        <h4 className="m-0 mb-2 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Race Info</h4>
                                        <p className="m-0"><strong>Date:</strong> {formatDate(selectedRace.raceDate)}</p>
                                        {selectedRace.location && <p className="m-0 mt-1"><strong>Location:</strong> {selectedRace.location}</p>}
                                    </div>
                                    <div className="rounded-md bg-[#fff8f6] p-4 text-[0.85rem]">
                                        <h4 className="m-0 mb-2 text-[0.72rem] font-black uppercase text-[var(--admin-primary)]">Details</h4>
                                        <p className="m-0"><strong>Horse:</strong> {selectedRace.horseName}</p>
                                        <p className="m-0 mt-1"><strong>Owner:</strong> {selectedRace.ownerName}</p>
                                        <div className="mt-2">
                                            <strong>Health Certificate:</strong>
                                            <div className="mt-1">
                                                <HealthCertificateLink url={selectedRace.healthCertificateImageUrl} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-4 font-black text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]"
                                    onClick={handleCloseRaceDetail}
                                    type="button"
                                >
                                    Close
                                </button>
                            </div>
                        </section>
                    </div>
                )}


            </section>
        </JockeyLayout>
    );
}

export default AcceptedRaces;
