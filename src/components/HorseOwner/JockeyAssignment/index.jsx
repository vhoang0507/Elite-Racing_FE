import { useCallback, useEffect, useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";
import TournamentSelectModal from "./components/TournamentSelectModal";
import ActivityTimeline from "./components/ActivityTimeline";
import InvitationResponses from "./components/InvitationResponses";
import { ownerApi } from "../../../api/ownerApi";

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

    useEffect(() => {
        let mounted = true;
        ownerApi.getJockeyAssignmentRegistrations()
            .then((data) => {
                if (!mounted) return;
                const list = data ?? [];
                setRegistrations(list);
                if (list.length > 0) {
                    setSelectedRegistrationId(list[0].registrationId);
                }
            })
            .catch((err) => {
                if (mounted) setError(err.message || 'Failed to load registrations');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    const selectedRegistration = registrations.find(
        (r) => r.registrationId === selectedRegistrationId
    ) ?? null;

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

    const handleInvitationSent = () => {
        setSelectedJockey(null);
        refreshDetail();
    };

    const handleSign = async (invitationId) => {
        if (!selectedRegistrationId) return;
        try {
            await ownerApi.selectOfficialJockey(selectedRegistrationId, invitationId);
            refreshDetail();
            ownerApi.getJockeyAssignmentRegistrations().then(setRegistrations).catch(() => { });
        } catch (err) {
            setError(err.message || 'Failed to select official jockey');
        }
    };

    const handleChangeTournament = (registration) => {
        setSelectedRegistrationId(registration.registrationId);
        setIsTournamentModalOpen(false);
    };

    return (
        <HorseOwnerLayout activeKey="jockey">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div className="flex items-center justify-between max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                    <div>
                        <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Jockey Assignment</h2>
                        {hasTournament && (
                            <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                                Find the perfect match for your thoroughbred for {selectedRegistration.tournamentName}.
                            </p>
                        )}
                    </div>
                    {registrations.length > 0 && (
                        <button
                            onClick={() => setIsTournamentModalOpen(true)}
                            className="inline-flex min-h-[38px] cursor-pointer items-center rounded-md bg-[var(--admin-primary)] px-5 font-bold text-white hover:bg-[var(--admin-primary-dark)]"
                        >
                            Change tournament
                        </button>
                    )}
                </div>

                {error && <p className="text-[0.82rem] text-red-700">{error}</p>}

                {loading ? (
                    <p className="text-[0.82rem] text-[var(--admin-muted)]">Loading...</p>
                ) : !hasTournament ? (
                    <div className="flex flex-col items-center justify-center rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-border)] bg-[#fff8f6] px-6 py-16 text-center">
                        <p className="m-0 max-w-[480px] text-[0.9rem] text-[var(--admin-muted)]">
                            No approved tournaments available for jockey assignment. Please register for a tournament and wait for admin approval.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-4 text-[0.82rem] text-[var(--admin-muted)]">
                            <span>🏆 {selectedRegistration.tournamentName}</span>
                            <span>📅 {selectedRegistration.raceDate}</span>
                            <span>🐴 {selectedRegistration.horseName}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                            <StatCard icon="✉️" label="INVITED" value={summary.invitedCount} />
                            <StatCard icon="⏳" label="PENDING" value={summary.pendingCount} />
                            <StatCard icon="✅" label="ACCEPTED" value={summary.acceptedCount} />
                        </div>

                        {hasOfficialJockey && (
                            <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[#afe2c4] bg-[#dff7e9] px-5 py-4">
                                <span className="rounded-full bg-[#118548] px-3 py-1 text-[0.7rem] font-bold uppercase text-white">
                                    Official / Signed
                                </span>
                                <span className="text-[0.85rem] text-[#118548]">
                                    Official jockey selected: <strong>{context?.officialJockeyName ?? context?.assignedJockeyName}</strong>
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2.5">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search jockey name..."
                                className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                                style={{ width: '220px' }}
                            />
                            <select
                                value={healthStatus}
                                onChange={(e) => setHealthStatus(e.target.value)}
                                className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem]"
                            >
                                <option value="">Health Status</option>
                                <option value="Fit">Fit</option>
                                <option value="Injured">Injured</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-[280px_1fr] gap-5 max-[900px]:grid-cols-1">
                            <div className="flex flex-col gap-5">
                                <HorseInfo
                                    context={context}
                                    loading={loadingDetail}
                                    horseImageUrl={selectedRegistration?.horseImageUrl}
                                />
                                <ActivityTimeline summary={summary} hasOfficialJockey={hasOfficialJockey} />
                            </div>

                            <div className="flex flex-col gap-5">
                                {canSendInvitation ? (
                                    <JockeyGrid
                                        registrationId={selectedRegistrationId}
                                        search={search}
                                        healthStatus={healthStatus}
                                        disableInvite={!canSendInvitation}
                                        onInvite={setSelectedJockey}
                                    />
                                ) : (
                                    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-5 py-4 text-[0.85rem] text-[var(--admin-muted)]">
                                        An official jockey has already been selected for this race. No further invitations can be sent.
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
            </section>

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
        </HorseOwnerLayout>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-5 py-4">
            <span className="text-xl">{icon}</span>
            <div>
                <p className="m-0 text-[0.7rem] font-bold tracking-wide text-[var(--admin-muted)]">{label}</p>
                <p className="m-0 text-[1.4rem] font-bold text-[var(--admin-primary-dark)]">{value}</p>
            </div>
        </div>
    );
}