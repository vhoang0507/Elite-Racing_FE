import SpectatorLayout from "./SpectatorLayout";
import SpectatorNotifications from "./components/SpectatorNotifications";

export default function SpectatorNotificationsPage() {
    return (
        <SpectatorLayout activeKey="notifications">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <SpectatorNotifications />
            </section>
        </SpectatorLayout>
    );
}
