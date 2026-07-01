import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../api/handleOwnerAccessError";
import { uploadFile, resolveFileUrl } from "../../../api/uploadApi";

const MAX_FILE_MB = 5;

function validateHorse(form, horseImageFile) {
    const errs = {};

    const name = form.horseName?.trim() ?? '';
    if (!name) {
        errs.horseName = 'Horse name is required.';
    } else if (name.length < 2 || name.length > 60) {
        errs.horseName = 'Name must be 2–60 characters.';
    } else if (!/^[A-Za-zÀ-ỹ0-9 '\-]+$/.test(name)) {
        errs.horseName = 'Name may only contain letters, numbers, spaces, hyphens or apostrophes.';
    }

    if (!form.breedId) {
        errs.breedId = 'Please select a breed.';
    }

    const age = Number(form.age);
    if (form.age === '' || form.age === null || form.age === undefined) {
        errs.age = 'Age is required.';
    } else if (!Number.isInteger(age) || age < 1 || age > 30) {
        errs.age = 'Age must be a whole number 1–30.';
    }

    if (form.heightCm !== '' && form.heightCm !== null && form.heightCm !== undefined) {
        const h = Number(form.heightCm);
        if (isNaN(h) || h < 100 || h > 220 || !Number.isInteger(h)) {
            errs.heightCm = 'Height must be 100–220 cm.';
        }
    }

    const w = Number(form.weightKg);
    if (form.weightKg === '' || form.weightKg === null || form.weightKg === undefined) {
        errs.weightKg = 'Weight is required.';
    } else if (isNaN(w) || w < 200 || w > 800 || !Number.isInteger(w)) {
        errs.weightKg = 'Weight must be a whole number 200–800 kg.';
    }

    if (form.achievementSummary && form.achievementSummary.length > 500) {
        errs.achievementSummary = `Max 500 characters (${form.achievementSummary.length} used).`;
    }

    if (horseImageFile && horseImageFile.size > MAX_FILE_MB * 1024 * 1024) {
        errs.horseImage = `File too large. Max ${MAX_FILE_MB} MB.`;
    }

    return errs;
}

function ErrMsg({ msg }) {
    if (!msg) return null;
    return <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{msg}</p>;
}

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <label style={styles.fieldLabel}>{label}</label>
            {children}
        </div>
    );
}

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
    const [fieldErrors, setFieldErrors] = useState({});
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleHorseImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setFieldErrors(prev => ({ ...prev, horseImage: `File too large. Max ${MAX_FILE_MB} MB.` }));
            e.target.value = '';
            return;
        }
        setFieldErrors(prev => ({ ...prev, horseImage: undefined }));
        setHorseImageFile(file);
        setHorseImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setError("");
        setSuccess(false);
        const errs = validateHorse(form, horseImageFile);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError("Please fix the highlighted errors before saving.");
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = form.imageUrl || null;
            if (horseImageFile) {
                const uploaded = await uploadFile(horseImageFile, "horses");
                imageUrl = uploaded.url;
            }
            await ownerApi.updateHorse(horseId, {
                horseName: form.horseName.trim(),
                breedId: Number(form.breedId),
                age: Number(form.age),
                heightCm: form.heightCm !== '' ? Number(form.heightCm) : null,
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

    const inputStyle = (field) => ({
        ...styles.input,
        ...(fieldErrors[field] ? { border: '1px solid #f87171', backgroundColor: '#fef2f2' } : {}),
    });

    return (
        <HorseOwnerLayout activeKey="my-horse">
            <section style={styles.page}>
                <button type="button" onClick={() => navigate(`/owner/horses/${horseId}`)} style={styles.backLink}>
                    ← Back to Detail
                </button>

                <div>
                    <h2 style={styles.pageTitle}>Edit Horse</h2>
                    <p style={styles.pageSubtitle}>Update your horse's information below.</p>
                </div>

                {loading && <p style={{ color: "#999", fontSize: "0.85rem" }}>Loading...</p>}

                {!loading && (
                    <div style={styles.grid}>
                        {/* Left */}
                        <div style={styles.card}>
                            <p style={styles.cardTitle}>🐴 Horse Details</p>

                            <Field label="Horse Name *">
                                <input name="horseName" value={form.horseName} onChange={handleChange}
                                    placeholder="e.g., Midnight Monarch" style={inputStyle('horseName')} />
                                <ErrMsg msg={fieldErrors.horseName} />
                            </Field>

                            <Field label="Breed Type *">
                                <select name="breedId" value={form.breedId} onChange={handleChange} style={inputStyle('breedId')}>
                                    <option value="">Select Breed</option>
                                    {breeds.map(b => (
                                        <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                    ))}
                                </select>
                                <ErrMsg msg={fieldErrors.breedId} />
                            </Field>

                            <div style={styles.threeCol}>
                                <div>
                                    <Field label="Age (yrs) *">
                                        <input name="age" value={form.age} onChange={handleChange}
                                            type="number" min="1" max="30" step="1" placeholder="1–30" style={inputStyle('age')} />
                                        <ErrMsg msg={fieldErrors.age} />
                                    </Field>
                                </div>
                                <div>
                                    <Field label="Height (cm)">
                                        <input name="heightCm" value={form.heightCm} onChange={handleChange}
                                            type="number" min="100" max="220" step="1" placeholder="100–220" style={inputStyle('heightCm')} />
                                        <ErrMsg msg={fieldErrors.heightCm} />
                                    </Field>
                                </div>
                                <div>
                                    <Field label="Weight (kg) *">
                                        <input name="weightKg" value={form.weightKg} onChange={handleChange}
                                            type="number" min="200" max="800" step="1" placeholder="200–800" style={inputStyle('weightKg')} />
                                        <ErrMsg msg={fieldErrors.weightKg} />
                                    </Field>
                                </div>
                            </div>

                            <Field label="Achievement Summary (max 500 chars)">
                                <textarea name="achievementSummary" value={form.achievementSummary} onChange={handleChange}
                                    placeholder="Detail recent race placements, notable lineage..."
                                    style={{ ...inputStyle('achievementSummary'), minHeight: "110px", resize: "vertical" }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <ErrMsg msg={fieldErrors.achievementSummary} />
                                    <span style={{ fontSize: 10, color: (form.achievementSummary?.length ?? 0) > 500 ? '#dc2626' : '#94a3b8', marginLeft: 'auto' }}>
                                        {form.achievementSummary?.length ?? 0}/500
                                    </span>
                                </div>
                            </Field>
                        </div>

                        {/* Right */}
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

                            <Field label={`Profile Photo (max ${MAX_FILE_MB} MB)`}>
                                <div style={styles.uploadBox}>
                                    {horseImagePreview ? (
                                        <img src={horseImagePreview} alt="preview" style={styles.previewImg} />
                                    ) : (
                                        <>
                                            <span style={{ fontSize: "2rem" }}>📷</span>
                                            <p style={styles.uploadHint}>Click to upload a new photo</p>
                                            <p style={styles.uploadSub}>PNG, JPG up to {MAX_FILE_MB}MB</p>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleHorseImageChange} style={styles.fileInput} />
                                </div>
                                <ErrMsg msg={fieldErrors.horseImage} />
                                {horseImagePreview && (
                                    <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#999" }}>
                                        Click the box again to change photo
                                    </p>
                                )}
                            </Field>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div style={styles.actionBar}>
                        {error   && <span style={styles.errorMsg}>⚠️ {error}</span>}
                        {success && <span style={styles.successMsg}>✅ Saved! Redirecting...</span>}
                        <button onClick={() => navigate(`/owner/horses/${horseId}`)} style={styles.cancelBtn}>Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            style={{ ...styles.saveBtn, opacity: isSubmitting ? 0.6 : 1 }}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </section>
        </HorseOwnerLayout>
    );
}

const styles = {
    page: { display: "grid", gap: "24px", padding: "36px 44px" },
    backLink: { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "1rem", fontWeight: 600, color: "#888", alignSelf: "flex-start" },
    pageTitle: { margin: 0, fontSize: "2rem", color: "#610000", fontWeight: 700 },
    pageSubtitle: { margin: "4px 0 0", fontSize: "1rem", color: "#999" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "26px 28px" },
    cardTitle: { margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "#610000" },
    fieldLabel: { display: "block", marginBottom: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.04em" },
    input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e0e0e0", fontSize: "1rem", color: "#2d2020", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa" },
    threeCol: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "0px" },
    warningBox: { backgroundColor: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "12px 16px", fontSize: "0.9rem", color: "#856404", marginBottom: "18px" },
    uploadBox: { border: "2px dashed #e0e0e0", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", position: "relative", backgroundColor: "#fafafa" },
    uploadHint: { margin: "8px 0 2px", fontSize: "0.95rem", color: "#888" },
    uploadSub:  { margin: 0, fontSize: "0.82rem", color: "#bbb" },
    previewImg: { maxHeight: "160px", borderRadius: "8px", objectFit: "cover", display: "block", margin: "0 auto" },
    fileInput: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" },
    actionBar: { display: "flex", gap: "12px", alignItems: "center" },
    errorMsg: { fontSize: "0.9rem", color: "#c62828", marginRight: "auto" },
    successMsg: { fontSize: "0.9rem", color: "#2e7d32", marginRight: "auto" },
    cancelBtn: { padding: "11px 26px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", color: "#555", fontWeight: 600, fontSize: "1rem", cursor: "pointer" },
    saveBtn: { padding: "11px 30px", borderRadius: "8px", border: "none", backgroundColor: "#0b7f5a", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
};
