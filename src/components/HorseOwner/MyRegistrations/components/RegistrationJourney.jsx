const steps = [
    { number: 1, label: "Submitted", desc: "Initial form receipt" },
    { number: 2, label: "Pending Review", desc: "Admin verification" },
    { number: 3, label: "Approved", desc: "Entry confirmed" },
    { number: 4, label: "Jockey Selection", desc: "Athlete assignment" },
    { number: 5, label: "Ready to Race", desc: "Pre-race checks ok" },
];

export default function RegistrationJourney() {
    const currentStep = 3;

    return (
        <section style={styles.section}>
            <h3 style={{ margin: "0 0 24px", textAlign: "center" }}>Registration Journey</h3>

            <div style={styles.timeline}>
                {steps.map((step, i) => (
                    <div key={i} style={styles.stepWrapper}>
                        {/* Line trước */}
                        {i > 0 && (
                            <div style={{
                                ...styles.line,
                                backgroundColor: step.number <= currentStep ? "#8B0000" : "#ddd",
                            }} />
                        )}

                        <div style={styles.step}>
                            <div style={{
                                ...styles.circle,
                                backgroundColor: step.number <= currentStep ? "#8B0000" : "#fff",
                                color: step.number <= currentStep ? "#fff" : "#999",
                                border: step.number <= currentStep ? "none" : "2px solid #ddd",
                            }}>
                                {step.number}
                            </div>
                            <p style={{ ...styles.label, color: step.number <= currentStep ? "#111" : "#999" }}>
                                {step.label}
                            </p>
                            <p style={styles.desc}>{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eee", marginBottom: "24px" },
    timeline: { display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative" },
    stepWrapper: { display: "flex", alignItems: "center", flex: 1 },
    line: { flex: 1, height: "2px", marginTop: "-24px" },
    step: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "80px" },
    circle: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" },
    label: { margin: 0, fontSize: "12px", fontWeight: "600", textAlign: "center" },
    desc: { margin: 0, fontSize: "11px", color: "#999", textAlign: "center" },
};