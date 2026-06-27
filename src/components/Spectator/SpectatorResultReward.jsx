import SpectatorLayout from "./SpectatorLayout";
import ResultReward from "./components/ResultReward";

export default function SpectatorResultReward() {
    return (
        <SpectatorLayout activeKey="results">
            <section className="page-shell">
                <ResultReward />
            </section>
        </SpectatorLayout>
    );
}
