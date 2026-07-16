import { FaCheckCircle, FaMedal, FaTrophy } from "react-icons/fa";
import { formatCurrency } from "../../../../utils/currency";

const toneClass = {
    gold: "bg-[#faf2e0] text-[#8a6209]",
    green: "bg-[#e8f7ee] text-[#16864f]",
    navy: "bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]",
};

export default function RewardStats({ summary, loading }) {
    return (
        <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
            <StatCard icon={FaMedal} tone="gold" label="TOTAL PRIZE EARNED" value={loading ? "..." : formatCurrency(summary?.totalPrizeEarned ?? 0)} />
            <StatCard icon={FaCheckCircle} tone="green" label="CLAIMED REWARDS" value={loading ? "..." : formatCurrency(summary?.claimedRewards ?? 0)} />
            <StatCard icon={FaTrophy} tone="navy" label="TOURNAMENT WINS" value={loading ? "..." : (summary?.tournamentWins ?? 0)} />
        </div>
    );
}

function StatCard({ icon: Icon, tone, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-5 py-4">
            <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${toneClass[tone]}`}>
                <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
                <p className="m-0 text-[0.7rem] font-bold tracking-wide text-[var(--admin-muted)]">{label}</p>
                <p className="m-0 text-[1.4rem] font-bold text-[var(--admin-primary-dark)]">{value}</p>
            </div>
        </div>
    );
}
