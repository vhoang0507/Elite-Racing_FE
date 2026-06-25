import SpectatorLayout from "./SpectatorLayout";
import Predictions from "./components/Predictions";

export default function SpectatorPredictions() {
    return (
        <SpectatorLayout activeKey="predictions">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <Predictions />
            </section>
        </SpectatorLayout>
    );
}
