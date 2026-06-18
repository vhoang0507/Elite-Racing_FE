import { useEffect, useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";
import TournamentSelectModal from "./components/TournamentSelectModal";
import { ownerApi } from "../../../api/ownerApi";

export default function JockeyAssignment() {
    const [selectedJockey, setSelectedJockey] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        ownerApi.getApprovedRegistrationsList()
            .then((data) => {
                if (!mounted) return;
                const list = data ?? [];
                setRegistrations(list);
                if (list.length > 0) {
                    setSelectedRegistration(list[0]);
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

    const hasTournament = Boolean(selectedRegistration);

    return (
        <HorseOwnerLayout activeKey="jockey">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div className="flex items-center justify-between max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                    <div>
                        <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Jockey Assignment</h2>
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
                )}
            </section>

            {selectedJockey && (
                <InvitationModal
                    jockey={selectedJockey}
                    onClose={() => setSelectedJockey(null)}
                />
            )}

            {isTournamentModalOpen && (
                <TournamentSelectModal
                    registrations={registrations}
                    selectedId={selectedRegistration?.registrationId}
                    onSelect={(r) => {
                        setSelectedRegistration(r);
                        setIsTournamentModalOpen(false);
                    }}
                    onClose={() => setIsTournamentModalOpen(false)}
                />
            )}
        </HorseOwnerLayout>
    );
}