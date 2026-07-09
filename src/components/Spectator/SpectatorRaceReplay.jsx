import SpectatorLayout from "./SpectatorLayout";
import RaceReplay from "./components/RaceReplay";

export default function SpectatorRaceReplay() {
    return (
        <SpectatorLayout activeKey="tournaments">
            <section className="page-shell">
                <RaceReplay />
            </section>
        </SpectatorLayout>
    );
}
