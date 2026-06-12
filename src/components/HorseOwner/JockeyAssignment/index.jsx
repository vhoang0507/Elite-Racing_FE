import { useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import HorseInfo from "./components/HorseInfo";
import JockeyGrid from "./components/JockeyGrid";
import InvitationModal from "./components/InvitationModal";

export default function JockeyAssignment() {
    const [selectedJockey, setSelectedJockey] = useState(null);

    return (
        <HorseOwnerLayout activeKey="jockey">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div className="flex items-center justify-between max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                    <div>
                        <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Jockey Assignment</h2>
                        <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                            Find the perfect match for your thoroughbred for the upcoming Derby Qualifiers.
                        </p>
                    </div>
                    <button className="inline-flex min-h-[38px] cursor-pointer items-center rounded-md bg-[var(--admin-primary)] px-5 font-bold text-white hover:bg-[var(--admin-primary-dark)]">
                        Change tournament
                    </button>
                </div>

                {/* Tournament Info */}
                <div className="flex flex-wrap gap-4 text-[0.82rem] text-[var(--admin-muted)]">
                    <span>📅 12 Jun 2026 • 18:30 GST</span>
                    <span>📍 Dubai Meydan, UAE</span>
                    <span>📏 2400m</span>
                </div>

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
                <div className="grid grid-cols-[220px_1fr] gap-5 max-[900px]:grid-cols-1">
                    <HorseInfo />
                    <JockeyGrid onInvite={setSelectedJockey} />
                </div>
            </section>

            {selectedJockey && (
                <InvitationModal
                    jockey={selectedJockey}
                    onClose={() => setSelectedJockey(null)}
                />
            )}
        </HorseOwnerLayout>
    );
}
