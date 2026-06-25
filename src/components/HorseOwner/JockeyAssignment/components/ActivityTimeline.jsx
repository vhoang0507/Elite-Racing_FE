export default function ActivityTimeline({ summary, hasOfficialJockey }) {
    const steps = [
        {
            title: "Send Jockey Invitations",
            description: "Invite one or more jockeys to participate in the tournament with your horse.",
            done: (summary?.invitedCount ?? 0) > 0,
        },
        {
            title: "Jockey Responses",
            description: "Wait for invited jockeys to accept or decline the invitation.",
            done: (summary?.acceptedCount ?? 0) > 0,
        },
        {
            title: "Select Official Jockey",
            description: "Review accepted invitations and choose the official jockey for the race.",
            done: hasOfficialJockey,
        },
    ];

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>Activity Timeline</div>
            <div style={styles.list}>
                {steps.map((step, i) => (
                    <div key={i} style={styles.item}>
                        <span style={{ ...styles.dot, backgroundColor: step.done ? "#610000" : "#ddd" }} />
                        <div>
                            <p style={styles.itemTitle}>{step.title}</p>
                            <p style={styles.itemDesc}>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "16px" },
    cardHeader: { fontSize: "14px", fontWeight: "600", marginBottom: "12px" },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    item: { display: "flex", gap: "10px" },
    dot: { width: "10px", height: "10px", borderRadius: "50%", marginTop: "4px", flexShrink: 0 },
    itemTitle: { margin: 0, fontSize: "13px", fontWeight: "600" },
    itemDesc: { margin: "2px 0 0", fontSize: "11px", color: "#999" },
};