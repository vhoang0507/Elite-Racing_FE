import SpectatorLayout from "./SpectatorLayout";
import Predictions from "./components/Predictions";

export default function SpectatorPredictions() {
    return (
        <SpectatorLayout activeKey="predictions">
            <section className="page-shell">
                <Predictions />
            </section>
        </SpectatorLayout>
    );
}
