import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../api/handleOwnerAccessError";
import { uploadFile, resolveFileUrl } from "../../../api/uploadApi";

export default function HorseEdit() {
    const { horseId } = useParams();
    const navigate = useNavigate();
    const [breeds, setBreeds] = useState([]);
    const [form, setForm] = useState({
        horseName: "",
        breedId: "",
        age: "",
        heightCm: "",
        weightKg: "",
        achievementSummary: "",
        healthStatus: "Healthy",
        imageUrl: "",
    });
    const [horseImageFile, setHorseImageFile] = useState(null);
    const [horseImagePreview, setHorseImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        ownerApi.getHorseBreeds().then(setBreeds).catch(() => { });
        ownerApi.getHorseDetail(horseId)
            .then(horse => {
                setForm({
                    horseName: horse.horseName ?? "",
                    breedId: horse.breedId ?? "",
                    age: horse.age ?? "",
                    heightCm: horse.heightCm ?? "",
                    weightKg: horse.weightKg ?? "",
                    achievementSummary: horse.achievementSummary ?? "",
                    healthStatus: horse.healthStatus ?? "Healthy",
                    imageUrl: horse.imageUrl ?? "",
                });
                if (horse.imageUrl) setHorseImagePreview(resolveFileUrl(horse.imageUrl));
            })
            .catch(err => {
                if (!handleOwnerAccessError(err, navigate)) setError("Failed to load horse.");
            })
            .finally(() => setLoading(false));
    }, [horseId]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleHorseImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHorseImageFile(file);
        setHorseImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setError("");
        setSuccess(false);
        setIsSubmitting(true);
        try {
            let imageUrl = form.imageUrl || null;
            if (horseImageFile) {
                const uploaded = await uploadFile(horseImageFile, "horses");
                imageUrl = uploaded.url;
            }
            await ownerApi.updateHorse(horseId, {
                horseName: form.horseName,
                breedId: Number(form.breedId),
                age: Number(form.age),
                heightCm: form.heightCm ? Number(form.heightCm) : null,
                weightKg: Number(form.weightKg),
                healthStatus: form.healthStatus,
                achievementSummary: form.achievementSummary,
                imageUrl,
            });
            setSuccess(true);
            setTimeout(() => navigate(`/owner/horses/${horseId}`), 800);
        } catch (err) {
            setError(err.message || "Failed to update horse.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <HorseOwnerLayout activeKey="my-horse">
            <section style={styles.page}>
                {/* Back link */}
                <button
                    type="button"
                    onClick={() => navigate(`/owner/horses/${horseId}`)}
                    style={styles.backLink}
                >
                    ← Back to Detail
                </button>

                {/* Header */}
                <div>
                    <h2 style={styles.pageTitle}>Edit Horse</h2>
                    <p style={styles.pageSubtitle}>Update your horse's information below.</p>
                </div>

                {loading && <p style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</p>}

                {!loading && (
                    <div style={styles.grid}>
                        {/* ── Left: Details ──────────────────────── */}
                        <div style={styles.card}>
                            <p style={styles.cardTitle}>🐴 Horse Details</p>

                            <Field label="Horse Name">
                                <input
                                    name="horseName"
                                    value={form.horseName}
                                    onChange={handleChange}
                                    placeholder="e.g., Midnight Monarch"
                                    style={styles.input}
                                />
                            </Field>

                            <Field label="Breed Type">
                                <select name="breedId" value={form.breedId} onChange={handleChange} style={styles.input}>
                                    <option value="">Select Breed</option>
                                    {breeds.map(b => (
                                        <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                    ))}
                                </select>
                            </Field>

                            <div style={styles.threeCol}>
                                <Field label="Age (yrs)">
                                    <input name="age" value={form.age} onChange={handleChange} type="number" placeholder="0" style={styles.input} />
                                </Field>
                                <Field label="Height (cm)">
                                    <input name="heightCm" value={form.heightCm} onChange={handleChange} type="number" placeholder="155" style={styles.input} />
                                </Field>
                                <Field label="Weight (kg)">
                                    <input name="weightKg" value={form.weightKg} onChange={handleChange} type="number" placeholder="500" style={styles.input} />
                                </Field>
                            </div>

                            <Field label="Achievement Summary & Bloodline History">
                                <textarea
                                    name="achievementSummary"
                                    value={form.achievementSummary}
                                    onChange={handleChange}
                                    placeholder="Detail recent race placements, notable lineage..."
                                    style={{ ...styles.input, minHeight: "110px", resize: "vertical" }}
                                />
                            </Field>
                        </div>

                        {/* ── Right: Status + Photo ─────────────── */}
                        <div style={styles.card}>
                            <p style={styles.cardTitle}>🏥 Clinical Status</p>

                            <Field label="Current Health State">
                                <select name="healthStatus" value={form.healthStatus} onChange={handleChange} style={styles.input}>
                                    <option value="Healthy">Healthy</option>
                                    <option value="NeedsCheck">NeedsCheck</option>
                                    <option value="Sick">Sick</option>
                                    <option value="Injured">Injured</option>
                                    <option value="Recovering">Recovering</option>
                                    <option value="UnfitToRace">UnfitToRace</option>
                                </select>
                            </Field>

                            <div style={styles.warningBox}>
                                ⚠️ Only horses with <strong>Healthy</strong> status are eligible for Grade 1 stakes races.
                            </div>

                            <Field label="Profile Photo">
                                <div style={styles.uploadBox}>
                                    {horseImagePreview ? (
                                        <img src={horseImagePreview} alt="preview" style={styles.previewImg} />
                                    ) : (
                                        <>
                                            <span style={{ fontSize: "2rem" }}>📷</span>
                                            <p style={styles.uploadHint}>Click to upload a new photo</p>
                                            <p style={styles.uploadSub}>PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleHorseImageChange}
                                        style={styles.fileInput}
                                    />
                                </div>
                                {horseImagePreview && (
                                    <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#999" }}>
                                        Click the box again to change photo
                                    </p>
                                )}
                            </Field>
                        </div>
                    </div>
                )}

                {/* ── Action bar ─────────────────────────────── */}
                {!loading && (
                    <div style={styles.actionBar}>
                        {error   && <span style={styles.errorMsg}>{error}</span>}
                        {success && <span style={styles.successMsg}>✅ Saved! Redirecting...</span>}
                        <button
                            onClick={() => navigate(`/owner/horses/${horseId}`)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{ ...styles.saveBtn, opacity: isSubmitting ? 0.6 : 1 }}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </section>
        </HorseOwnerLayout>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <label style={styles.fieldLabel}>{label}</label>
            {children}
        </div>
    );
}

const styles = {
    page: {
        display: "grid",
        gap: "24px",
        padding: "36px 44px",
    },
    backLink: {
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: 600,
        color: "#888",
        alignSelf: "flex-start",
    },
    pageTitle: {
        margin: 0,
        fontSize: "2rem",
        color: "#610000",
        fontWeight: 700,
    },
    pageSubtitle: {
        margin: "4px 0 0",
        fontSize: "1rem",
        color: "#999",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #eee",
        padding: "26px 28px",
    },
    cardTitle: {
        margin: "0 0 20px",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#610000",
    },
    fieldLabel: {
        display: "block",
        marginBottom: "6px",
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#aaa",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        fontSize: "1rem",
        color: "#2d2020",
        outline: "none",
        boxSizing: "border-box",
        backgroundColor: "#fafafa",
    },
    threeCol: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
        marginBottom: "18px",
    },
    warningBox: {
        backgroundColor: "#fff8e1",
        border: "1px solid #ffe082",
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "0.9rem",
        color: "#856404",
        marginBottom: "18px",
    },
    uploadBox: {
        border: "2px dashed #e0e0e0",
        borderRadius: "10px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        position: "relative",
        backgroundColor: "#fafafa",
    },
    uploadHint: { margin: "8px 0 2px", fontSize: "0.95rem", color: "#888" },
    uploadSub:  { margin: 0, fontSize: "0.82rem", color: "#bbb" },
    previewImg: {
        maxHeight: "160px",
        borderRadius: "8px",
        objectFit: "cover",
        display: "block",
        margin: "0 auto",
    },
    fileInput: {
        position: "absolute",
        inset: 0,
        opacity: 0,
        cursor: "pointer",
        width: "100%",
        height: "100%",
    },
    actionBar: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
    },
    errorMsg: {
        fontSize: "0.95rem",
        color: "#c62828",
        marginRight: "auto",
    },
    successMsg: {
        fontSize: "0.95rem",
        color: "#2e7d32",
        marginRight: "auto",
    },
    cancelBtn: {
        padding: "11px 26px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        color: "#555",
        fontWeight: 600,
        fontSize: "1rem",
        cursor: "pointer",
    },
    saveBtn: {
        padding: "11px 30px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#8B0000",
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        cursor: "pointer",
    },
};
