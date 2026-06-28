import { NavLink } from "react-router-dom";

const navItems = [
    { label: "Dashboard", icon: "📊", path: "/spectator/dashboard" },
    { label: "Tournaments", icon: "🏆", path: "/spectator/tournaments" },
    { label: "Predictions", icon: "🎯", path: "/spectator/predictions" },
    { label: "Result & Reward", icon: "🏅", path: "/spectator/results" },
    { label: "Notifications", icon: "🔔", path: "/spectator/notifications" },
];

export default function SpectatorSidebar() {
    return (
        <aside style={styles.sidebar}>
            <div style={styles.logo}>Elite Racing League</div>

            <div style={styles.userInfo}>
                <div style={styles.avatar}>SR</div>
                <div>
                    <p style={styles.userName}>Sebastian Reid</p>
                    <p style={styles.userRole}>SPECTATOR</p>
                </div>
            </div>

            <nav style={styles.nav}>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            ...styles.navItem,
                            backgroundColor: isActive ? "#0b7f5a" : "transparent",
                            color: isActive ? "#fff" : "#333",
                        })}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={styles.bottom}>
                <button style={styles.bottomBtn}>⚙ Support</button>
                <button style={styles.bottomBtn}>↪ Logout</button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: { width: "180px", minHeight: "100vh", backgroundColor: "#fff", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", padding: "20px 0" },
    logo: { fontWeight: "bold", fontSize: "14px", color: "#0b7f5a", padding: "0 16px 20px", borderBottom: "1px solid #eee" },
    userInfo: { display: "flex", alignItems: "center", gap: "10px", padding: "16px", borderBottom: "1px solid #eee" },
    avatar: { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0b7f5a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" },
    userName: { margin: 0, fontSize: "13px", fontWeight: "bold" },
    userRole: { margin: 0, fontSize: "10px", color: "#999" },
    nav: { display: "flex", flexDirection: "column", padding: "12px 8px", gap: "4px", flex: 1 },
    navItem: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px" },
    bottom: { display: "flex", flexDirection: "column", padding: "16px", gap: "8px", borderTop: "1px solid #eee" },
    bottomBtn: { background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "13px", color: "#666", padding: "4px 0" },
};