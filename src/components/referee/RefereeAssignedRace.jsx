import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaClipboardCheck,
    FaGavel,
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

const STATUS_STYLE = {
    Scheduled:     { bg: '#e3f2fd', color: '#1565c0' },
    Ongoing:       { bg: '#fff3cd', color: '#856404' },
    Completed:     { bg: '#d4edda', color: '#155724' },
    ResultPending: { bg: '#fff3cd', color: '#856404' },
    Cancelled:     { bg: '#f8d7da', color: '#721c24' },
};

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
        return () => { ignore = true; };
    }, []);

    return (
        <RefereeLayout activeKey="assigned-races">
            <section className="page-shell">
                <div>
                    <h1 className="page-title">My Assigned Races</h1>
                    <p className="page-subtitle">
                        Select a race to perform pre-race inspection or manage post-race results and reports.
                    </p>
                </div>

                {error && (
                    <div className="rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="surface-card p-8 text-center font-semibold text-[var(--admin-muted)]">
                        Loading assigned races...
                    </div>
                ) : races.length === 0 ? (
                    <div className="surface-card p-8 text-center font-semibold text-[var(--admin-muted)]">
                        No assigned races yet.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {races.map((race) => {
                            const s = STATUS_STYLE[race.raceStatus] ?? { bg: '#f7efee', color: '#7d0000' };
                            const canPreRace = race.raceStatus === 'Scheduled';
                            const canPostRace = ['Ongoing', 'Completed', 'Finished', 'ResultPending'].includes(race.raceStatus);
                            return (
                                <div
                                    key={race.raceId}
                                    className="surface-card"
                                    style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}
                                >
                                    {/* Left accent bar */}
                                    <div style={{ width: 5, alignSelf: 'stretch', backgroundColor: s.color, flexShrink: 0 }} />

                                    {/* Race info */}
                                    <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2b1b1b' }}>
                                                {race.raceName}
                                            </span>
                                            <span style={{
                                                backgroundColor: s.bg, color: s.color,
                                                fontSize: 11, fontWeight: 700,
                                                padding: '2px 10px', borderRadius: 20,
                                            }}>
                                                {race.raceStatus}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: 13, color: '#7d0000', fontWeight: 600, marginTop: 2 }}>
                                            {race.tournamentName}
                                        </div>

                                        <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FaMapMarkerAlt /> {race.location || 'N/A'}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#999' }}>
                                                📅 {formatDateTime(race.raceDate)}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#999' }}>
                                                🏃 {race.distanceMeters?.toLocaleString('en-US') ?? 0}m
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: 8, padding: '0 20px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/referee/races/pre-race/${race.raceId}`, { state: { race } })}
                                            disabled={!canPreRace}
                                            title={!canPreRace ? 'Only available for Scheduled races' : 'Pre-race inspection'}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '8px 16px', borderRadius: 8,
                                                border: '1px solid #edcfc9',
                                                background: canPreRace ? '#fff8f6' : '#f5f5f5',
                                                color: canPreRace ? '#7d0000' : '#bbb',
                                                fontWeight: 700, fontSize: 13,
                                                cursor: canPreRace ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            <FaClipboardCheck /> Pre-Race Inspect
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/referee/races/post-race', { state: { raceId: race.raceId } })}
                                            disabled={!canPostRace}
                                            title={!canPostRace ? 'Only available for Ongoing / Completed / ResultPending races' : 'Post-race workflow'}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '8px 16px', borderRadius: 8,
                                                border: 'none',
                                                background: canPostRace ? '#7d0000' : '#e0e0e0',
                                                color: canPostRace ? '#fff' : '#bbb',
                                                fontWeight: 700, fontSize: 13,
                                                cursor: canPostRace ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            <FaGavel /> Post-Race
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;
