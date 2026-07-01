import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";

export default function RegistrationJourney({ registrationId }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchJourney = async (id) => {
            setLoading(true);
            try {
                const journey = await ownerApi.getRegistrationJourney(id);
                setData(journey);
            } catch (err) {
                if (!handleOwnerAccessError(err, navigate)) setData(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchLatest = async () => {
            setLoading(true);
            try {
                const [pending, approved] = await Promise.all([
                    ownerApi.getPendingRegistrations().catch(() => []),
                    ownerApi.getApprovedRegistrationsList().catch(() => []),
                ]);
                const all = [...pending, ...approved];
                if (all.length === 0) { setData(null); return; }
                const journey = await ownerApi.getRegistrationJourney(all[0].registrationId);
                setData(journey);
            } catch (err) {
                if (!handleOwnerAccessError(err, navigate)) setData(null);
            } finally {
                setLoading(false);
            }
        };

        if (registrationId) {
            fetchJourney(registrationId);
        } else {
            fetchLatest();
        }
    }, [registrationId]);

    if (loading) return <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>;

    if (!data) return (
        <section style={styles.section}>
            <h3 style={{ margin: "0 0 24px", textAlign: "center" }}>Registration Journey</h3>
            <p style={{ textAlign: "center", color: "#999" }}>No active registrations found.</p>
        </section>
    );

    return (
        <section style={styles.section}>
            <h3 style={{ margin: "0 0 8px", textAlign: "center" }}>Registration Journey</h3>
            <p style={{ textAlign: "center", color: "#999", fontSize: "13px", marginBottom: "24px" }}>
                Status: <strong>{data.currentStatus}</strong>
            </p>

            <div style={styles.timeline}>
                {data.steps.map((step, i) => (
                    <div key={i} style={styles.stepWrapper}>
                        {i > 0 && (
                            <div style={{
                                ...styles.line,
                                backgroundColor: step.isCompleted ? "#0b7f5a" : "#ddd",
                            }} />
                        )}
                        <div style={styles.step}>
                            <div style={{
                                ...styles.circle,
                                backgroundColor: step.isCompleted ? "#0b7f5a" : "#fff",
                                color: step.isCompleted ? "#fff" : "#999",
                                border: step.isCompleted ? "none" : "2px solid #ddd",
                            }}>
                                {step.stepNumber}
                            </div>
                            <p style={{ ...styles.label, color: step.isCompleted ? "#111" : "#999" }}>
                                {step.label}
                            </p>
                            <p style={styles.desc}>{step.description}</p>
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
