import { useCallback, useEffect, useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";
import TournamentSelectModal from "./components/TournamentSelectModal";
import ActivityTimeline from "./components/ActivityTimeline";
import InvitationResponses from "./components/InvitationResponses";
import { ownerApi } from "../../../api/ownerApi";
import Toast from "../../shared/Toast";
import { useToast } from "../../shared/useToast";

export default function JockeyAssignment() {
    const [selectedJockey, setSelectedJockey] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState(null);
    const [context, setContext] = useState(null);
    const [summary, setSummary] = useState({ invitedCount: 0, pendingCount: 0, acceptedCount: 0 });
    const [invitations, setInvitations] = useState([]);
    const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [healthStatus, setHealthStatus] = useState('');
    const [gridKey, setGridKey] = useState(0);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let mounted = true;
        ownerApi.getJockeyAssignmentRegistrations()
            .then((data) => {
                if (!mounted) return;
                const list = data ?? [];
                setRegistrations(list);
                if (list.length > 0) setSelectedRegistrationId(list[0].registrationId);
            })
            .catch((err) => { if (mounted) setError(err.message || 'Failed to load registrations'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const selectedRegistration = registrations.find(r => r.registrationId === selectedRegistrationId) ?? null;

    const refreshDetail = useCallback(() => {
        if (!selectedRegistrationId) return;
        setLoadingDetail(true);
        Promise.all([
            ownerApi.getJockeyAssignmentContext(selectedRegistrationId),
            ownerApi.getJockeyAssignmentSummary(selectedRegistrationId),
            ownerApi.getJockeyInvitations(selectedRegistrationId),
        ])
            .then(([contextData, summaryData, invitationsData]) => {
                setContext(contextData);
                setSummary(summaryData ?? { invitedCount: 0, pendingCount: 0, acceptedCount: 0 });
                setInvitations(invitationsData ?? []);
            })
            .catch((err) => setError(err.message || 'Failed to load jockey assignment details'))
            .finally(() => setLoadingDetail(false));
    }, [selectedRegistrationId]);

    useEffect(() => {
        if (selectedRegistrationId) {
            refreshDetail();
        } else {
            setContext(null);
            setSummary({ invitedCount: 0, pendingCount: 0, acceptedCount: 0 });
            setInvitations([]);
        }
    }, [selectedRegistrationId, refreshDetail]);

    const hasTournament = Boolean(selectedRegistration);
    const hasOfficialJockey = Boolean(context?.hasOfficialJockey);
    const canSendInvitation = context?.canSendInvitation ?? !hasOfficialJockey;
    const canSignJockey = context?.canSignJockey ?? !hasOfficialJockey;

    const handleInvitationSent = (jockeyName) => {
        setSelectedJockey(null);
        refreshDetail();
        setGridKey(k => k + 1);
        showToast(`Invitation sent to ${jockeyName ?? 'the jockey'} successfully.`, 'success', 'Invitation Sent');
    };

    const handleSign = async (invitationId) => {
        if (!selectedRegistrationId) return;
        try {
            await ownerApi.selectOfficialJockey(selectedRegistrationId, invitationId);
            // Optimistically close all invitations: confirmed one → Confirmed, rest → Cancelled
            setInvitations(prev => prev.map(inv => ({
                ...inv,
                status: inv.invitationId === invitationId ? 'Confirmed' : 'Cancelled',
                isOfficial: inv.invitationId === invitationId,
                canSign: false,
            })));
            refreshDetail();
            ownerApi.getJockeyAssignmentRegistrations().then(setRegistrations).catch(() => {});
            showToast('🎉 Jockey officially confirmed! Your registration is ready for the race.', 'success', 'Jockey Confirmed');
        } catch (err) {
            const msg = err.message || 'Failed to select official jockey';
            setError(msg);
            showToast(msg, 'error', 'Failed to Confirm Jockey');
        }
    };

    const handleChangeTournament = (registration) => {
        setSelectedRegistrationId(registration.registrationId);
        setIsTournamentModalOpen(false);
    };

    return (
        <HorseOwnerLayout activeKey="jockey">
            <div style={styles.page}>
                {/* ── Page Header ──────────────────────────────────── */}
                <div style={styles.pageHeader}>
                    <div>
                        <h2 style={styles.pageTitle}>Jockey Assignment</h2>
                        <p style={styles.pageSubtitle}>
                            {hasTournament
                                ? `Find the perfect jockey for ${selectedRegistration.horseName} · ${selectedRegistration.tournamentName}`
                                : 'Assign jockeys to your approved race registrations'}
                        </p>
                    </div>
                    {registrations.length > 0 && (
                        <button onClick={() => setIsTournamentModalOpen(true)} style={styles.changeTournBtn}>
                            🏆 Change Tournament
                        </button>
                    )}
                </div>

                {error && (
                    <div style={styles.errorBar}>{error}</div>
                )}

                {loading ? (
                    <div style={styles.emptyBox}>
                        <span style={styles.emptyIcon}>⏳</span>
                        <p style={styles.emptyText}>Loading registrations...</p>
                    </div>
                ) : !hasTournament ? (
                    <div style={styles.emptyBox}>
                        <span style={styles.emptyIcon}>🏟️</span>
                        <p style={styles.emptyTitle}>No approved registrations</p>
                        <p style={styles.emptyText}>Register for a tournament and wait for admin approval to start assigning jockeys.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Meta info strip ────────────────────────────── */}
                        <div style={styles.metaStrip}>
                            <MetaTag icon="🏆" label={selectedRegistration.tournamentName} />
                            <MetaTag icon="📅" label={selectedRegistration.raceDate} />
                            <MetaTag icon="🐴" label={selectedRegistration.horseName} />
                        </div>

                        {/* ── Stat cards ─────────────────────────────────── */}
                        <div style={styles.statGrid}>
                            <StatCard icon="✉️" label="Invited" value={summary.invitedCount} accent="#e3f2fd" iconBg="#1565c0" />
                            <StatCard icon="⏳" label="Pending" value={summary.pendingCount} accent="#fff8e1" iconBg="#b45309" />
                            <StatCard icon="✅" label="Accepted" value={summary.acceptedCount} accent="#e8f5e9" iconBg="#2e7d32" />
                        </div>

                        {/* ── Official jockey banner ─────────────────────── */}
                        {hasOfficialJockey && (
                            <div style={styles.officialBanner}>
                                <span style={styles.officialBadge}>✅ Official</span>
                                <span style={styles.officialText}>
                                    Official jockey confirmed: <strong>{context?.officialJockeyName ?? context?.assignedJockeyName}</strong>
                                </span>
                            </div>
                        )}

                        {/* ── Search / filter row ────────────────────────── */}
                        <div style={styles.filterRow}>
                            <div style={styles.searchWrap}>
                                <span style={styles.searchIcon}>🔍</span>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search jockey name..."
                                    style={styles.searchInput}
                                />
                            </div>
                            <select
                                value={healthStatus}
                                onChange={(e) => setHealthStatus(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="">All Health Status</option>
                                <option value="Fit">Fit</option>
                                <option value="Injured">Injured</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        {/* ── Main 2-col layout ──────────────────────────── */}
                        <div style={styles.mainGrid}>
                            {/* Sidebar */}
                            <div style={styles.sidebar}>
                                <HorseInfo
                                    context={context}
                                    loading={loadingDetail}
                                    horseImageUrl={selectedRegistration?.horseImageUrl}
                                    healthCertificateImageUrl={selectedRegistration?.healthCertificateImageUrl}
                                />
                                <ActivityTimeline summary={summary} hasOfficialJockey={hasOfficialJockey} />
                            </div>

                            {/* Main panel */}
                            <div style={styles.mainPanel}>
                                {canSendInvitation ? (
                                    <JockeyGrid
                                        registrationId={selectedRegistrationId}
                                        search={search}
                                        healthStatus={healthStatus}
                                        disableInvite={!canSendInvitation}
                                        onInvite={setSelectedJockey}
                                        refreshKey={gridKey}
                                    />
                                ) : (
                                    <div style={styles.noInviteBox}>
                                        <span style={{ fontSize: '2rem' }}>🔒</span>
                                        <p style={styles.noInviteText}>
                                            An official jockey has already been selected. No further invitations can be sent.
                                        </p>
                                    </div>
                                )}
                                <InvitationResponses
                                    invitations={invitations}
                                    loading={loadingDetail}
                                    onSign={canSignJockey ? handleSign : undefined}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedJockey && (
                <InvitationModal
                    jockey={selectedJockey}
                    registrationId={selectedRegistrationId}
                    tournamentName={selectedRegistration?.tournamentName}
                    onClose={() => setSelectedJockey(null)}
                    onSent={handleInvitationSent}
                />
            )}

            {isTournamentModalOpen && (
                <TournamentSelectModal
                    registrations={registrations}
                    selectedId={selectedRegistrationId}
                    onSelect={handleChangeTournament}
                    onClose={() => setIsTournamentModalOpen(false)}
                />
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={4000}
            />
        </HorseOwnerLayout>
    );
}

function MetaTag({ icon, label }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f0ebe8', border: '1px solid #ddd0cb', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#4a2020', fontWeight: 600 }}>
            {icon} {label}
        </span>
    );
}

function StatCard({ icon, label, value, accent, iconBg }) {
    return (
        <div style={{ backgroundColor: accent, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${accent}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</p>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: '36px 44px', display: 'grid', gap: 24, maxWidth: '100%' },
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
    pageTitle: { margin: 0, fontSize: '1.9rem', fontWeight: 800, color: '#610000' },
    pageSubtitle: { margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' },
    changeTournBtn: { backgroundColor: '#610000', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' },
    errorBar: { backgroundColor: '#fff3f3', border: '1px solid #f0b4b4', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#c62828', fontWeight: 600 },
    emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf7f5', border: '2px dashed #ddd0cb', borderRadius: 14, padding: '60px 24px', textAlign: 'center', gap: 8 },
    emptyIcon: { fontSize: '2.5rem' },
    emptyTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#2d2020' },
    emptyText: { margin: 0, fontSize: 13, color: '#64748b', maxWidth: 440 },
    metaStrip: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
    officialBanner: { display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 18px' },
    officialBadge: { backgroundColor: '#065f46', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 },
    officialText: { fontSize: 14, color: '#065f46' },
    filterRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
    searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: 10, fontSize: 14, pointerEvents: 'none' },
    searchInput: { paddingLeft: 32, paddingRight: 12, height: 38, border: '1px solid #ddd0cb', borderRadius: 8, fontSize: 13, outline: 'none', width: 230, backgroundColor: '#fff' },
    filterSelect: { height: 38, border: '1px solid #ddd0cb', borderRadius: 8, fontSize: 13, padding: '0 10px', backgroundColor: '#fff', color: '#2d2020' },
    mainGrid: { display: 'grid', gridTemplateColumns: '290px 1fr', gap: 20 },
    sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
    mainPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
    noInviteBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, backgroundColor: '#faf7f5', border: '1px solid #e8ddd9', borderRadius: 12, padding: '32px 20px', textAlign: 'center' },
    noInviteText: { margin: 0, fontSize: 13, color: '#64748b', maxWidth: 400 },
};
