export default function RewardStats({ summary, loading }) {
    return (
        <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
            <StatCard icon="🏅" label="TOTAL PRIZE EARNED" value={loading ? "..." : `$${Number(summary?.totalPrizeEarned ?? 0).toLocaleString()}`} />
            <StatCard icon="✅" label="CLAIMED REWARDS" value={loading ? "..." : `$${Number(summary?.claimedRewards ?? 0).toLocaleString()}`} />
            <StatCard icon="🏆" label="TOURNAMENT WINS" value={loading ? "..." : (summary?.tournamentWins ?? 0)} />
        </div>
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