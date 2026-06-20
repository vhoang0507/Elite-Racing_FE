<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";
import TournamentSelectModal from "./components/TournamentSelectModal";
<<<<<<< HEAD
import ActivityTimeline from "./components/ActivityTimeline";
import InvitationResponses from "./components/InvitationResponses";
=======
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
import { ownerApi } from "../../../api/ownerApi";

export default function JockeyAssignment() {
    const [selectedJockey, setSelectedJockey] = useState(null);
    const [registrations, setRegistrations] = useState([]);
<<<<<<< HEAD
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

    // FE Giai đoạn 2: gọi registrations trước, chỉ load detail nếu có data
    useEffect(() => {
        let mounted = true;
        ownerApi.getJockeyAssignmentRegistrations()
=======
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        ownerApi.getApprovedRegistrationsList()
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
            .then((data) => {
                if (!mounted) return;
                const list = data ?? [];
                setRegistrations(list);
                if (list.length > 0) {
<<<<<<< HEAD
                    setSelectedRegistrationId(list[0].registrationId);
=======
                    setSelectedRegistration(list[0]);
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
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

<<<<<<< HEAD
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

    // Chỉ gọi context/candidates/summary/invitations khi có selectedRegistrationId
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
        // reload context/candidates/summary/invitations tự động qua useEffect ở trên
    };
=======
    const hasTournament = Boolean(selectedRegistration);
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0

    return (
        <HorseOwnerLayout activeKey="jockey">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div className="flex items-center justify-between max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                    <div>
                        <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Jockey Assignment</h2>
<<<<<<< HEAD
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
                    // FE Giai đoạn 2: Empty state — KHÔNG redirect khỏi trang
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

                        {/* FE Giai đoạn 4: Khóa UI nếu đã Sign */}
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
=======
                        <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                            {hasTournament
                                ? `Find the perfect match for your thoroughbred for ${selectedRegistration.tournamentName}.`
                                : "Bạn chưa có giải đấu nào được duyệt. Hãy chọn một giải đã được duyệt để tiếp tục."}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsTournamentModalOpen(true)}
                        className="inline-flex min-h-[38px] cursor-pointer items-center rounded-md bg-[var(--admin-primary)] px-5 font-bold text-white hover:bg-[var(--admin-primary-dark)]"
                    >
                        Change tournament
                    </button>
                </div>

                {/* Tournament Info */}
                {loading ? (
                    <p className="text-[0.82rem] text-[var(--admin-muted)]">Loading...</p>
                ) : hasTournament ? (
                    <div className="flex flex-wrap gap-4 text-[0.82rem] text-[var(--admin-muted)]">
                        <span>🏆 {selectedRegistration.tournamentName}</span>
                        <span>📅 {selectedRegistration.raceDate}</span>
                        <span>🐴 {selectedRegistration.horseName}</span>
                    </div>
                ) : (
                    <div className="rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-border)] bg-[#fff8f6] px-4 py-3 text-[0.82rem] text-[var(--admin-muted)]">
                        Chưa có giải đấu nào được duyệt cho bạn. Việc gửi lời mời jockey sẽ tạm khoá cho đến khi bạn chọn một giải đã được duyệt.
                    </div>
                )}

                {error && <p className="text-[0.82rem] text-red-700">{error}</p>}

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-2.5">
                    <input
                        placeholder="Search jockey name..."
                        className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                        style={{ width: '220px' }}
                    />
                    <select className="h-9 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 text-[0.82rem]">
                        <option>Health Status</option>
                        <option>Fit</option>
                        <option>Injured</option>
                        <option>Suspended</option>
                    </select>
                    <button className="h-9 cursor-pointer rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-4 text-[0.82rem] font-bold hover:bg-[#f5f5f5]">Filter</button>
                    <button className="h-9 cursor-pointer rounded-[var(--admin-radius)] border border-[#afe2c4] bg-[#dff7e9] px-4 text-[0.82rem] font-bold text-[#118548]">Active</button>
                    <button className="h-9 cursor-pointer rounded-[var(--admin-radius)] border border-[#dbaaa5] bg-[#f5e1df] px-4 text-[0.82rem] font-bold text-[var(--admin-primary)]">Inactive</button>
                </div>

                {/* Main Content */}
                {hasTournament ? (
                    <div className="grid grid-cols-[220px_1fr] gap-5 max-[900px]:grid-cols-1">
                        <HorseInfo horseName={selectedRegistration.horseName} />
                        <JockeyGrid onInvite={setSelectedJockey} disableInvite={!hasTournament} />
                    </div>
                ) : (
                    <JockeyGrid onInvite={setSelectedJockey} disableInvite={!hasTournament} />
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
                )}
            </section>

            {selectedJockey && (
                <InvitationModal
                    jockey={selectedJockey}
<<<<<<< HEAD
                    registrationId={selectedRegistrationId}
                    tournamentName={selectedRegistration?.tournamentName}
                    onClose={() => setSelectedJockey(null)}
                    onSent={handleInvitationSent}
=======
                    onClose={() => setSelectedJockey(null)}
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
                />
            )}

            {isTournamentModalOpen && (
                <TournamentSelectModal
                    registrations={registrations}
<<<<<<< HEAD
                    selectedId={selectedRegistrationId}
                    onSelect={handleChangeTournament}
=======
                    selectedId={selectedRegistration?.registrationId}
                    onSelect={(r) => {
                        setSelectedRegistration(r);
                        setIsTournamentModalOpen(false);
                    }}
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
                    onClose={() => setIsTournamentModalOpen(false)}
                />
            )}
        </HorseOwnerLayout>
    );
<<<<<<< HEAD
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
=======
>>>>>>> 1224d1d5ed14a0ebf79afefffc13dc0813d468b0
}