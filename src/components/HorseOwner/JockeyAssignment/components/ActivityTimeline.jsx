export default function ActivityTimeline({ summary, hasOfficialJockey }) {
    const steps = [
        {
            icon: '✉️',
            title: 'Send Invitations',
            description: 'Invite jockeys to participate in the race.',
            done: (summary?.invitedCount ?? 0) > 0,
        },
        {
            icon: '💬',
            title: 'Await Responses',
            description: 'Jockeys accept or decline your invitation.',
            done: (summary?.acceptedCount ?? 0) > 0,
        },
        {
            icon: '🏆',
            title: 'Confirm Official',
            description: 'Select the official jockey for the race.',
            done: hasOfficialJockey,
        },
    ];

    return (
        <div style={styles.card}>
            <p style={styles.cardTitle}>Progress</p>
            <div style={styles.steps}>
                {steps.map((step, i) => (
                    <div key={i} style={styles.step}>
                        {/* Connector line */}
                        <div style={styles.connectorCol}>
                            <div style={{ ...styles.dot, backgroundColor: step.done ? '#610000' : '#e2d9d6', boxShadow: step.done ? '0 0 0 3px #f5e1df' : 'none' }}>
                                {step.done ? <span style={{ fontSize: 10, color: '#fff' }}>✓</span> : <span style={{ fontSize: 9, color: '#a38f8f' }}>{i + 1}</span>}
                            </div>
                            {i < steps.length - 1 && (
                                <div style={{ ...styles.line, backgroundColor: step.done ? '#f5e1df' : '#f0ebe8' }} />
                            )}
                        </div>
                        {/* Content */}
                        <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
                            <p style={{ ...styles.stepTitle, color: step.done ? '#610000' : '#94a3b8' }}>
                                {step.icon} {step.title}
                            </p>
                            <p style={styles.stepDesc}>{step.description}</p>
                            {step.done && (
                                <span style={styles.donePill}>Completed</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8ddd9', padding: '16px 20px' },
    cardTitle: { margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1e293b' },
    steps: { display: 'flex', flexDirection: 'column' },
    step: { display: 'flex', gap: 12 },
    connectorCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
    dot: { width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
    line: { width: 2, flex: 1, minHeight: 16, borderRadius: 2 },
    stepTitle: { margin: '2px 0 2px', fontSize: 13, fontWeight: 700 },
    stepDesc: { margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 },
    donePill: { marginTop: 4, display: 'inline-block', fontSize: 10, fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 8px' },
};
