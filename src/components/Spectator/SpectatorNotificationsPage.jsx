import SpectatorLayout from "./SpectatorLayout";
import SpectatorNotifications from "./components/SpectatorNotifications";

export default function SpectatorNotificationsPage() {
    return (
        <SpectatorLayout activeKey="notifications">
            <section className="page-shell">
                <SpectatorNotifications />
            </section>
        </SpectatorLayout>
    );
}
