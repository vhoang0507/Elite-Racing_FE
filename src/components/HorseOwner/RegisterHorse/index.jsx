import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../HorseOwnerDashboard/components/Sidebar";

export default function RegisterHorse() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        horseName: "",
        breedType: "",
        age: "",
        height: "",
        weight: "",
        achievement: "",
        healthState: "Healthy",
        notes: "",
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flex: 1, padding: "24px", backgroundColor: "#faf8f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <input
                        placeholder="Search records, horses, races..."
                        style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd", width: "280px", fontSize: "13px" }}
                    />
                    <div style={{ display: "flex", gap: "12px", fontSize: "20px" }}>
                        <span>🔔</span><span>👤</span>
                    </div>
                </div>

                {/* Title */}
                <h2 style={{ margin: "0 0 4px" }}>Register New Horse</h2>
                <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#999" }}>
                    After adding a horse, it will be pending admin approval.
                </p>

                {/* Form 2 cột */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                    {/* Cột trái */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>🐴 Horse Registration Form</h3>

                        <div style={styles.field}>
                            <label style={styles.label}>Horse Name</label>
                            <input name="horseName" value={form.horseName} onChange={handleChange}
                                placeholder="e.g., Midnight Monarch"
                                style={styles.input} />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Breed Type</label>
                            <select name="breedType" value={form.breedType} onChange={handleChange} style={styles.input}>
                                <option value="">Select Breed</option>
                                <option>Arabian</option>
                                <option>Thoroughbred</option>
                                <option>Mustang</option>
                                <option>Andalusian</option>
                            </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                            <div style={styles.field}>
                                <label style={styles.label}>Age (Years)</label>
                                <input name="age" value={form.age} onChange={handleChange}
                                    placeholder="0" type="number" style={styles.input} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Height (Cm)</label>
                                <input name="height" value={form.height} onChange={handleChange}
                                    placeholder="15.2" type="number" style={styles.input} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Weight (Kg)</label>
                                <input name="weight" value={form.weight} onChange={handleChange}
                                    placeholder="1100" type="number" style={styles.input} />
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Achievement Summary & Bloodline History</label>
                            <textarea name="achievement" value={form.achievement} onChange={handleChange}
                                placeholder="Detail recent race placements, notable lineage, and distinctive physical characteristics..."
                                style={{ ...styles.input, height: "100px", resize: "vertical" }} />
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>🏥 Clinical Status</h3>

                        <div style={styles.field}>
                            <label style={styles.label}>Current Health State</label>
                            <select name="healthState" value={form.healthState} onChange={handleChange} style={styles.input}>
                                <option>Healthy</option>
                                <option>Injured</option>
                                <option>Training</option>
                            </select>
                        </div>

                        <div style={{ ...styles.noteBox, marginBottom: "20px" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "#856404" }}>
                                ⚠️ Only horses with 'Healthy' status are eligible for Grade 1 stakes races in the upcoming tournament.
                            </p>
                        </div>

                        {/* Upload Photo */}
                        <div style={styles.field}>
                            <label style={styles.label}>Upload Profile Photo</label>
                            <div style={styles.uploadBox}>
                                <span style={{ fontSize: "28px" }}>📷</span>
                                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#999" }}>Upload Profile Photo</p>
                                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#bbb" }}>PNG, JPG up to 10MB</p>
                                <input type="file" accept="image/*" style={{ marginTop: "12px" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button
                        onClick={() => navigate("/my-horse")}
                        style={styles.draftBtn}
                    >
                        Draft
                    </button>
                    <button style={styles.registerBtn}>
                        Register Horse
                    </button>
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Footer */}
                <footer style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#999" }}>
                    <span style={{ fontWeight: "bold", color: "#8B0000" }}>Elite Racing League</span>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Terms of Service</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Privacy Policy</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Contact Support</a>
                        <a href="#" style={{ color: "#999", textDecoration: "none" }}>Racing Rules</a>
                    </div>
                </footer>

            </main>
        </div>
    );
}

const styles = {
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eee" },
    cardTitle: { margin: "0 0 20px", fontSize: "16px" },
    field: { marginBottom: "16px" },
    label: { display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: "500" },
    input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
    noteBox: { backgroundColor: "#fff3cd", borderRadius: "8px", padding: "12px", border: "1px solid #ffc107" },
    uploadBox: { border: "2px dashed #ddd", borderRadius: "8px", padding: "24px", textAlign: "center" },
    draftBtn: { padding: "10px 24px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px" },
    registerBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", backgroundColor: "#8B0000", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
};