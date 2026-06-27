import SpectatorLayout from './SpectatorLayout';
import Leaderboard from './components/Leaderboard';

export default function SpectatorLeaderboard() {
    return (
        <SpectatorLayout activeKey="leaderboard">
            <section className="page-shell">
                <Leaderboard />
            </section>
        </SpectatorLayout>
    );
}
