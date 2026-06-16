import SpectatorLayout from "./SpectatorLayout";
import Tournaments from "./components/Tournaments";

export default function SpectatorTournaments() {
    return (
        <SpectatorLayout activeKey="tournaments">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <Tournaments />
            </section>
        </SpectatorLayout>
    );
}
