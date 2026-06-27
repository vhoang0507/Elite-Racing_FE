import SpectatorLayout from "./SpectatorLayout";
import Tournaments from "./components/Tournaments";

export default function SpectatorTournaments() {
    return (
        <SpectatorLayout activeKey="tournaments">
            <section className="page-shell">
                <Tournaments />
            </section>
        </SpectatorLayout>
    );
}
