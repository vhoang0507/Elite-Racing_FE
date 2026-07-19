import { createElement, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaFlagCheckered,
    FaMapMarkerAlt,
    FaTrophy,
} from 'react-icons/fa';

import { publicApi } from '../../api/publicApi';
import { resolveFileUrl } from '../../api/uploadApi';
import horseRacing from '../../assets/horse-racing.jpg';
import PublicLayout from './PublicLayout';

function readField(item, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);
    return item?.[key] ?? item?.[pascalKey];
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: String(value).includes('T') ? '2-digit' : undefined,
        minute: String(value).includes('T') ? '2-digit' : undefined,
    }).format(date);
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '-';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'USD',
    }).format(Number(value || 0));
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-[8px] border border-[var(--racing-border)] bg-[#fffaf8] p-4">
            <span className="block text-xs font-black uppercase text-[var(--racing-muted)]">{label}</span>
            <strong className="mt-1 block break-words text-[var(--racing-ink)]">{value ?? '-'}</strong>
        </div>
    );
}

export default function PublicDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const type = useMemo(() => {
        if (location.pathname.includes('/public/races/')) return 'race';
        if (location.pathname.includes('/public/horses/')) return 'horse';
        if (location.pathname.includes('/public/jockeys/')) return 'jockey';
        if (location.pathname.includes('/public/owners/')) return 'owner';
        return 'tournament';
    }, [location.pathname]);

    useEffect(() => {
        let isMounted = true;
        const loaders = {
            tournament: publicApi.getPublicTournamentDetail,
            race: publicApi.getPublicRaceDetail,
            horse: publicApi.getPublicHorseDetail,
            jockey: publicApi.getPublicJockeyDetail,
            owner: publicApi.getPublicOwnerDetail,
        };

        setLoading(true);
        setError('');
        loaders[type](id)
            .then((payload) => {
                if (isMounted) setDetail(payload);
            })
            .catch((err) => {
                if (isMounted) {
                    setDetail(null);
                    setError(err.message || 'Public detail is not available.');
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id, type]);

    const title = readField(detail, 'tournamentName')
        || readField(detail, 'raceName')
        || readField(detail, 'horseName')
        || readField(detail, 'fullName')
        || 'Public Detail';
    const imageUrl = readField(detail, 'imageUrl') || readField(detail, 'horseImageUrl') || readField(detail, 'profileImageUrl');
    const races = readField(detail, 'races') || [];
    const standings = readField(detail, 'standings') || [];
    const participants = readField(detail, 'participants') || [];
    const results = readField(detail, 'results') || [];

    return (
        <PublicLayout showSearch={false}>
            <section className="relative min-h-[360px] overflow-hidden">
                <img
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    src={imageUrl ? resolveFileUrl(imageUrl) : horseRacing}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[360px] max-w-7xl flex-col justify-center px-6 text-white md:px-11">
                    <Link className="mb-5 inline-flex w-fit items-center gap-2 rounded-[6px] border border-white/40 bg-white/10 px-4 py-2 text-sm font-black text-white no-underline" to="/explore-tournaments">
                        <FaArrowLeft aria-hidden="true" />
                        Back
                    </Link>
                    <span className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f7d84a]">{type}</span>
                    <h1 className="max-w-4xl text-4xl font-black tracking-[-0.03em] md:text-5xl">{title}</h1>
                    {readField(detail, 'description') && (
                        <p className="mt-4 max-w-3xl text-base leading-7 text-white/90">{readField(detail, 'description')}</p>
                    )}
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-7 px-6 py-8 md:px-11">
                {loading ? (
                    <div className="rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8] p-8 text-center font-bold text-[var(--racing-muted)]">Loading detail...</div>
                ) : error ? (
                    <div className="rounded-[10px] border border-[#e3bcb7] bg-[#f3e1df] p-8 text-center font-bold text-[#a4392f]">{error}</div>
                ) : (
                    <>
                        <section className="grid gap-4 md:grid-cols-4">
                            {type === 'tournament' && (
                                <>
                                    <InfoItem label="Location" value={readField(detail, 'location')} />
                                    <InfoItem label="Status" value={readField(detail, 'status')} />
                                    <InfoItem label="Season" value={readField(detail, 'seasonName')} />
                                    <InfoItem label="Prize Pool" value={formatMoney(readField(detail, 'prizePool'))} />
                                </>
                            )}
                            {type === 'race' && (
                                <>
                                    <InfoItem label="Tournament" value={readField(detail, 'tournamentName')} />
                                    <InfoItem label="Race Date" value={formatDate(readField(detail, 'raceDate'))} />
                                    <InfoItem label="Distance" value={`${readField(detail, 'distanceMeters') || 0}m`} />
                                    <InfoItem label="Status" value={readField(detail, 'status')} />
                                </>
                            )}
                            {type === 'horse' && (
                                <>
                                    <InfoItem label="Breed" value={readField(detail, 'breedName')} />
                                    <InfoItem label="Owner" value={readField(detail, 'ownerName')} />
                                    <InfoItem label="Wins" value={readField(detail, 'wins') ?? 0} />
                                    <InfoItem label="Published Races" value={readField(detail, 'publishedResults') ?? 0} />
                                </>
                            )}
                            {type === 'jockey' && (
                                <>
                                    <InfoItem label="Experience" value={`${readField(detail, 'yearsOfExperience') ?? 0} years`} />
                                    <InfoItem label="Health" value={readField(detail, 'healthStatus')} />
                                    <InfoItem label="Wins" value={readField(detail, 'wins') ?? 0} />
                                    <InfoItem label="Published Races" value={readField(detail, 'publishedRaces') ?? 0} />
                                </>
                            )}
                            {type === 'owner' && (
                                <>
                                    <InfoItem label="Active Horses" value={readField(detail, 'activeHorses') ?? 0} />
                                    <InfoItem label="Wins" value={readField(detail, 'wins') ?? 0} />
                                    <InfoItem label="Published Races" value={readField(detail, 'publishedRaces') ?? 0} />
                                </>
                            )}
                        </section>

                        {races.length > 0 && (
                            <section className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8]">
                                <div className="flex items-center gap-3 border-b border-[var(--racing-border)] px-5 py-4">
                                    <FaCalendarAlt className="text-[var(--racing-primary)]" />
                                    <h2 className="m-0 text-xl font-black">Races</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                        <thead className="bg-[#fff0ee] text-xs uppercase text-[var(--racing-muted)]">
                                            <tr>{['Race', 'Date', 'Location', 'Distance', 'Entries', 'Status'].map((heading) => <th className="px-5 py-3" key={heading}>{heading}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {races.map((race) => (
                                                <tr className="border-t border-[#f1dcd8]" key={readField(race, 'raceId')}>
                                                    <td className="px-5 py-4 font-black text-[var(--racing-primary)]">
                                                        <Link className="text-[var(--racing-primary)] no-underline" to={`/public/races/${readField(race, 'raceId')}`}>{readField(race, 'raceName')}</Link>
                                                    </td>
                                                    <td className="px-5 py-4">{formatDate(readField(race, 'raceDate'))}</td>
                                                    <td className="px-5 py-4">{readField(race, 'location') || '-'}</td>
                                                    <td className="px-5 py-4">{readField(race, 'distanceMeters')}m</td>
                                                    <td className="px-5 py-4">{readField(race, 'registeredCount') ?? 0}</td>
                                                    <td className="px-5 py-4">{readField(race, 'status')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {(participants.length > 0 || results.length > 0) && (
                            <section className="grid gap-7 lg:grid-cols-2">
                                <PublicTable title="Participants" icon={FaFlagCheckered} rows={participants} columns={['Horse', 'Owner', 'Jockey', 'Status']} />
                                <PublicTable title="Results" icon={FaTrophy} rows={results} columns={['Rank', 'Horse', 'Jockey', 'Time', 'Outcome']} />
                            </section>
                        )}

                        {standings.length > 0 && (
                            <PublicTable title="Tournament Standings" icon={FaTrophy} rows={standings} columns={['Rank', 'Horse', 'Owner', 'Jockey', 'Points', 'Wins']} wide />
                        )}
                    </>
                )}
            </section>
        </PublicLayout>
    );
}

function PublicTable({
    columns,
    icon: Icon,
    rows,
    title,
    wide = false,
}) {
    return (
        <section className="overflow-hidden rounded-[10px] border border-[var(--racing-border)] bg-[#fffaf8]">
            <div className="flex items-center gap-3 border-b border-[var(--racing-border)] px-5 py-4">
                {createElement(Icon, { className: 'text-[var(--racing-primary)]' })}
                <h2 className="m-0 text-xl font-black">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className={`w-full border-collapse text-left text-sm ${wide ? 'min-w-[760px]' : 'min-w-[560px]'}`}>
                    <thead className="bg-[#fff0ee] text-xs uppercase text-[var(--racing-muted)]">
                        <tr>{columns.map((heading) => <th className="px-5 py-3" key={heading}>{heading}</th>)}</tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr className="border-t border-[#f1dcd8]" key={readField(row, 'registrationId') || readField(row, 'horseId') || index}>
                                {columns.map((column) => (
                                    <td className="px-5 py-4" key={column}>{getTableValue(row, column)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function getTableValue(row, column) {
    const valueByColumn = {
        Horse: readField(row, 'horseId')
            ? <Link className="font-black text-[var(--racing-primary)] no-underline" to={`/public/horses/${readField(row, 'horseId')}`}>{readField(row, 'horseName')}</Link>
            : readField(row, 'horseName'),
        Owner: readField(row, 'ownerName'),
        Jockey: readField(row, 'jockeyName') || '-',
        Status: readField(row, 'registrationStatus') || readField(row, 'status'),
        Rank: readField(row, 'finalRank') ? `#${readField(row, 'finalRank')}` : (readField(row, 'finishPosition') ? `#${readField(row, 'finishPosition')}` : '-'),
        Time: readField(row, 'finishTimeSeconds') != null ? `${readField(row, 'finishTimeSeconds')}s` : '-',
        Outcome: readField(row, 'outcomeStatus') || '-',
        Points: readField(row, 'totalPoints') ?? 0,
        Wins: readField(row, 'wins') ?? 0,
    };

    return valueByColumn[column] ?? '-';
}
