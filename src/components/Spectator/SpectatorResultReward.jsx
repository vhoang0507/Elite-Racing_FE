import SpectatorLayout from "./SpectatorLayout";
import ResultReward from "./components/ResultReward";

export default function SpectatorResultReward() {
    return (
        <SpectatorLayout activeKey="results">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <ResultReward />
            </section>
        </SpectatorLayout>
    );
}
