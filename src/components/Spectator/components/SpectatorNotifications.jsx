import { useState, useEffect } from 'react';
import { spectatorApi } from '../../../api/spectatorApi';

export default function SpectatorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        spectatorApi.getSpectatorNotifications()
            .then(setNotifications)
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await spectatorApi.markSpectatorNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        } catch { }
    };

    const unread = notifications.filter(n => !n.isRead).length;

    if (loading) return <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>;

    return (
        <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "bold" }}>Notifications</h2>
            <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                Stay updated with live races, prediction events, tournament news, and exclusive spectator rewards.
            </p>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "TOTAL ALERTS", value: notifications.length, icon: "🔔" },
                    { label: "UNREAD", value: unread, icon: "🎯" },
                    { label: "READ", value: notifications.length - unread, icon: "✅" },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ fontSize: "24px" }}>{s.icon}</span>
                        <div>
                            <small style={styles.statLabel}>{s.label}</small>
                            <h3 style={styles.statValue}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notification List */}
            <div style={styles.list}>
                {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No notifications.</p>
                ) : (
                    notifications.map((n) => (
                        <div key={n.notificationId} style={{
                            ...styles.notifCard,
                            borderLeft: !n.isRead ? '3px solid #8B0000' : '3px solid transparent',
                            backgroundColor: !n.isRead ? '#fff5f5' : '#fff',
                        }}>
                            <span style={{ fontSize: "24px" }}>🔔</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p style={styles.notifTitle}>{n.title}</p>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: n.isRead ? '#d4edda' : '#fff3cd',
                                        color: n.isRead ? '#155724' : '#856404',
                                    }}>
                                        {n.isRead ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                                <p style={styles.notifDesc}>{n.message}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                    <span style={{ fontSize: "11px", color: "#999" }}>
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(n.notificationId)}
                                            style={{ ...styles.actionBtn, backgroundColor: '#8B0000', color: '#fff', border: 'none' }}
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    statCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" },
    statLabel: { color: "#999", fontSize: "11px", fontWeight: "600" },
    statValue: { margin: "4px 0 0", fontSize: "28px", fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    notifCard: { borderRadius: "12px", padding: "16px", border: "1px solid #eee", display: "flex", gap: "16px", alignItems: "flex-start" },
    notifTitle: { margin: 0, fontWeight: "600", fontSize: "14px" },
    notifDesc: { margin: "4px 0 0", fontSize: "13px", color: "#666" },
    badge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "500", whiteSpace: "nowrap" },
    actionBtn: { padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
};