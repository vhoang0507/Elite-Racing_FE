import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaRoute } from "react-icons/fa";
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
                const mostRecent = all.reduce((latest, current) => (
                    current.registrationId > latest.registrationId ? current : latest
                ));
                const journey = await ownerApi.getRegistrationJourney(mostRecent.registrationId);
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
            <div style={styles.header}>
                <span style={styles.headerIcon}><FaRoute aria-hidden="true" /></span>
                <div>
                    <h3 style={styles.title}>Registration Journey</h3>
                    <p style={styles.subtitle}>Track your race entry from submission to race day.</p>
                </div>
            </div>
            <p style={styles.emptyText}>No active registrations found.</p>
        </section>
    );

    const activeIndex = data.steps.findIndex((step) => !step.isCompleted);
    const currentStepIndex = activeIndex === -1 ? data.steps.length - 1 : activeIndex;

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <span style={styles.headerIcon}><FaRoute aria-hidden="true" /></span>
                <div>
                    <h3 style={styles.title}>Registration Journey</h3>
                    <p style={styles.subtitle}>
                        Current status: <strong style={{ color: "#16305c" }}>{data.currentStatus}</strong>
                    </p>
                </div>
            </div>

            <div style={styles.timeline}>
                {data.steps.map((step, i) => {
                    const isCurrent = i === currentStepIndex && !step.isCompleted;

                    return (
                        <div key={i} style={styles.stepWrapper}>
                            {i > 0 && (
                                <div style={styles.lineTrack}>
                                    <div style={{
                                        ...styles.line,
                                        backgroundColor: step.isCompleted || (data.steps[i - 1]?.isCompleted && isCurrent) ? "#16305c" : "#e5decb",
                                    }} />
                                </div>
                            )}
                            <div style={styles.step}>
                                <div style={{
                                    ...styles.circle,
                                    backgroundColor: step.isCompleted ? "#16305c" : isCurrent ? "#fff" : "#fff",
                                    color: step.isCompleted ? "#fff" : isCurrent ? "#16305c" : "#b3a98f",
                                    border: step.isCompleted ? "none" : isCurrent ? "2px solid #16305c" : "2px solid #e5decb",
                                    boxShadow: isCurrent ? "0 0 0 4px rgba(200,162,74,0.22)" : "none",
                                }}>
                                    {step.isCompleted ? <FaCheck aria-hidden="true" style={{ fontSize: "13px" }} /> : step.stepNumber}
                                </div>
                                <p style={{ ...styles.label, color: step.isCompleted || isCurrent ? "#0a1930" : "#a89e86" }}>
                                    {step.label}
                                </p>
                                <p style={styles.desc}>{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #ded2ad", marginBottom: "24px", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
    headerIcon: {
        display: "grid", placeItems: "center", flexShrink: 0,
        width: "42px", height: "42px", borderRadius: "999px",
        backgroundColor: "#edf2fa", color: "#16305c", fontSize: "17px",
    },
    title: { margin: 0, fontSize: "1.15rem", color: "#0a1930" },
    subtitle: { margin: "3px 0 0", fontSize: "0.82rem", color: "#6b6456" },
    emptyText: { textAlign: "center", color: "#94a3b8", fontSize: "0.88rem", padding: "20px 0" },
    timeline: { display: "flex", alignItems: "flex-start", justifyContent: "center" },
    stepWrapper: { display: "flex", alignItems: "flex-start", flex: 1, minWidth: 0 },
    lineTrack: { display: "flex", alignItems: "center", flex: 1, height: "38px", marginTop: "0" },
    line: { width: "100%", height: "2px" },
    step: { display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", minWidth: "84px", maxWidth: "150px" },
    circle: { width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", flexShrink: 0, transition: "all 0.2s ease" },
    label: { margin: 0, fontSize: "0.8rem", fontWeight: "700", textAlign: "center" },
    desc: { margin: 0, fontSize: "0.72rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.4 },
};
