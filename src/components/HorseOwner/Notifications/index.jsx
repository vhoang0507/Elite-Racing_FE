import { useState } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";

const notifications = [
    { id: 1, type: "registration", icon: "🟡", title: "Registration Approved", desc: "Desert Thunder for Dubai Sprint Cup", time: "2 mins ago", status: "APPROVED", statusColor: { bg: "#dff7e9", color: "#118548" }, read: false },
    { id: 2, type: "jockey", icon: "🔵", title: "Invitation Accepted", desc: "Julian de la Cruz has confirmed for seasonal duty.", time: "15 mins ago", status: "CONFIRMED", statusColor: { bg: "#e3f2fd", color: "#1565c0" }, read: false },
    { id: 3, type: "registration", icon: "🔴", title: "Registration Returned", desc: "Update health documents for Pegasus Derby entry.", time: "1 hr ago", status: "RETURNED", statusColor: { bg: "#f5e1df", color: "#860707" }, read: true },
];

const tabs = ["All", "Registrations", "Jockeys", "Tournaments"];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState("All");

    const filtered = notifications.filter(n => {
        if (activeTab === "All") return true;
        if (activeTab === "Registrations") return n.type === "registration";
        if (activeTab === "Jockeys") return n.type === "jockey";
        return true;
    });

    return (
        <HorseOwnerLayout activeKey="notifications">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Notifications</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        Stay updated with tournaments, race schedules, jockey responses
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
                    {[
                        { label: "UNREAD", value: 12, icon: "📬" },
                        { label: "INVITATIONS", value: 3, icon: "👤" },
                        { label: "UPCOMING RACES", value: 5, icon: "📅" },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
                            <span className="text-[1.3rem]">{s.icon}</span>
                            <div>
                                <small className="text-[0.7rem] font-bold uppercase text-[var(--admin-muted)]">{s.label}</small>
                                <h3 className="m-0 text-[1.5rem] text-[var(--admin-ink)]">{s.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`cursor-pointer rounded-md border-0 px-4 py-2 text-[0.82rem] font-bold transition-colors ${activeTab === tab ? 'bg-[var(--admin-primary)] text-white' : 'bg-transparent text-[var(--admin-muted)] hover:bg-[#f8dfda]'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                    <button className="ml-auto cursor-pointer border-0 bg-transparent text-[0.82rem] font-bold text-[var(--admin-primary)]">View All</button>
                </div>

                {/* Notification List */}
                <div className="grid gap-3">
                    {filtered.map((n) => (
                        <div key={n.id} className="flex items-start gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
                            <span className="text-[1.3rem]">{n.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="m-0 text-[0.9rem] font-bold text-[var(--admin-ink)]">{n.title}</p>
                                    {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--admin-primary)]" />}
                                </div>
                                <p className="m-0 mt-1 text-[0.82rem] text-[var(--admin-muted)]">{n.desc}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[0.72rem] text-[var(--admin-muted)]">⏰ {n.time}</span>
                                    <span className="rounded-full px-2 py-0.5 text-[0.68rem] font-bold" style={{ backgroundColor: n.statusColor.bg, color: n.statusColor.color }}>
                                        {n.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </HorseOwnerLayout>
    );
}
