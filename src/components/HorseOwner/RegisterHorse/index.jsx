import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { uploadFile, resolveFileUrl } from "../../../api/uploadApi";
import Toast, { useToast } from "../../shared/Toast";

const MAX_FILE_MB = 5;

function validateHorse(form, horseImageFile, healthCertificateFile) {
    const errs = {};

    // Name
    const name = form.horseName?.trim() ?? '';
    if (!name) {
        errs.horseName = 'Horse name is required.';
    } else if (name.length < 2 || name.length > 60) {
        errs.horseName = 'Name must be 2–60 characters.';
    } else if (!/^[A-Za-zÀ-ỹ0-9 '\-]+$/.test(name)) {
        errs.horseName = 'Name may only contain letters, numbers, spaces, hyphens or apostrophes.';
    }

    // Breed
    if (!form.breedId) {
        errs.breedId = 'Please select a breed.';
    }

    // Age
    const age = Number(form.age);
    if (form.age === '' || form.age === null || form.age === undefined) {
        errs.age = 'Age is required.';
    } else if (!Number.isInteger(age) || age < 1 || age > 30) {
        errs.age = 'Age must be a whole number 1–30.';
    }

    // Height (optional)
    if (form.heightCm !== '' && form.heightCm !== null && form.heightCm !== undefined) {
        const h = Number(form.heightCm);
        if (isNaN(h) || h < 100 || h > 220 || !Number.isInteger(h)) {
            errs.heightCm = 'Height must be 100–220 cm.';
        }
    }

    // Weight
    const w = Number(form.weightKg);
    if (form.weightKg === '' || form.weightKg === null || form.weightKg === undefined) {
        errs.weightKg = 'Weight is required.';
    } else if (isNaN(w) || w < 200 || w > 800 || !Number.isInteger(w)) {
        errs.weightKg = 'Weight must be a whole number 200–800 kg.';
    }

    // Achievement (optional, max 500 chars)
    if (form.achievementSummary && form.achievementSummary.length > 500) {
        errs.achievementSummary = `Max 500 characters (${form.achievementSummary.length} used).`;
    }

    // File size
    const maxBytes = MAX_FILE_MB * 1024 * 1024;
    if (horseImageFile && horseImageFile.size > maxBytes) {
        errs.horseImage = `Profile photo too large. Max ${MAX_FILE_MB} MB.`;
    }
    if (healthCertificateFile && healthCertificateFile.size > maxBytes) {
        errs.healthCert = `Health certificate too large. Max ${MAX_FILE_MB} MB.`;
    }

    return errs;
}

function ErrMsg({ msg }) {
    if (!msg) return null;
    return <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{msg}</p>;
}

export default function RegisterHorse() {
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
        healthCertificateImageUrl: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const [horseImageFile, setHorseImageFile] = useState(null);
    const [horseImagePreview, setHorseImagePreview] = useState('');
    const [healthCertificateFile, setHealthCertificateFile] = useState(null);
    const [healthCertificatePreview, setHealthCertificatePreview] = useState('');

    useEffect(() => {
        ownerApi.getHorseBreeds()
            .then(setBreeds)
            .catch(() => { });
    }, []);

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

    const handleHealthCertificateChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setFieldErrors(prev => ({ ...prev, healthCert: `File too large. Max ${MAX_FILE_MB} MB.` }));
            e.target.value = '';
            return;
        }
        setFieldErrors(prev => ({ ...prev, healthCert: undefined }));
        setHealthCertificateFile(file);
        setHealthCertificatePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setError('');
        const errs = validateHorse(form, horseImageFile, healthCertificateFile);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            showToast('Please fix the highlighted errors before submitting.', 'error', 'Validation Error');
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = form.imageUrl || null;
            let healthCertificateImageUrl = form.healthCertificateImageUrl || null;

            if (horseImageFile) {
                const uploaded = await uploadFile(horseImageFile, 'horses');
                imageUrl = uploaded.url;
            }
            if (healthCertificateFile) {
                const uploaded = await uploadFile(healthCertificateFile, 'horses');
                healthCertificateImageUrl = uploaded.url;
            }

            await ownerApi.createHorse({
                horseName: form.horseName.trim(),
                breedId: Number(form.breedId),
                age: Number(form.age),
                heightCm: form.heightCm !== '' ? Number(form.heightCm) : null,
                weightKg: Number(form.weightKg),
                healthStatus: form.healthStatus,
                achievementSummary: form.achievementSummary,
                imageUrl,
                healthCertificateImageUrl,
            });
            navigate('/owner/my-horse');
        } catch (err) {
            const msg = err.message || 'Horse registration failed. Please try again.';
            setError(msg);
            showToast(msg, 'error', 'Registration Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBase = "w-full rounded-[var(--admin-radius)] border bg-white px-3 py-2.5 text-[0.9rem] text-[var(--admin-ink)] outline-none focus:border-[var(--admin-primary)]";
    const inputOk  = `${inputBase} border-[var(--admin-border)]`;
    const inputErr = `${inputBase} border-red-400 bg-red-50`;
    const labelClass = "mb-1.5 block text-[0.78rem] font-bold text-[var(--admin-muted)]";

    const ic = (field) => fieldErrors[field] ? inputErr : inputOk;

    return (
        <HorseOwnerLayout activeKey="register-horse">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Register New Horse</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        After adding a horse, it will be pending admin approval.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
                    {/* Left Column */}
                    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
                        <h3 className="m-0 mb-5 text-[1rem] font-bold text-[var(--admin-ink)]">🐴 Horse Registration Form</h3>

                        <div className="mb-4">
                            <label className={labelClass}>Horse Name <span className="text-red-500">*</span></label>
                            <input name="horseName" value={form.horseName} onChange={handleChange}
                                placeholder="e.g., Midnight Monarch" className={ic('horseName')} />
                            <ErrMsg msg={fieldErrors.horseName} />
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Breed Type <span className="text-red-500">*</span></label>
                            <select name="breedId" value={form.breedId} onChange={handleChange} className={ic('breedId')}>
                                <option value="">Select Breed</option>
                                {breeds.map(b => (
                                    <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                ))}
                            </select>
                            <ErrMsg msg={fieldErrors.breedId} />
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>Age (yrs) <span className="text-red-500">*</span></label>
                                <input name="age" value={form.age} onChange={handleChange}
                                    placeholder="1–30" type="number" min="1" max="30" step="1" className={ic('age')} />
                                <ErrMsg msg={fieldErrors.age} />
                            </div>
                            <div>
                                <label className={labelClass}>Height (cm)</label>
                                <input name="heightCm" value={form.heightCm} onChange={handleChange}
                                    placeholder="100–220" type="number" min="100" max="220" step="1" className={ic('heightCm')} />
                                <ErrMsg msg={fieldErrors.heightCm} />
                            </div>
                            <div>
                                <label className={labelClass}>Weight (kg) <span className="text-red-500">*</span></label>
                                <input name="weightKg" value={form.weightKg} onChange={handleChange}
                                    placeholder="200–800" type="number" min="200" max="800" step="1" className={ic('weightKg')} />
                                <ErrMsg msg={fieldErrors.weightKg} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Achievement Summary & Bloodline History <span className="text-[#bbb]">(optional, max 500 chars)</span></label>
                            <textarea name="achievementSummary" value={form.achievementSummary} onChange={handleChange}
                                placeholder="Detail recent race placements, notable lineage, and distinctive physical characteristics..."
                                className={`${ic('achievementSummary')} min-h-[100px] resize-y`} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <ErrMsg msg={fieldErrors.achievementSummary} />
                                <span style={{ fontSize: 10, color: form.achievementSummary?.length > 500 ? '#dc2626' : '#94a3b8', marginLeft: 'auto' }}>
                                    {form.achievementSummary?.length ?? 0}/500
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
                        <h3 className="m-0 mb-5 text-[1rem] font-bold text-[var(--admin-ink)]">🏥 Clinical Status</h3>

                        <div className="mb-4">
                            <label className={labelClass}>Current Health State</label>
                            <select name="healthStatus" value={form.healthStatus} onChange={handleChange} className={inputOk}>
                                <option value="Healthy">Healthy</option>
                                <option value="NeedsCheck">NeedsCheck</option>
                                <option value="Sick">Sick</option>
                                <option value="Injured">Injured</option>
                                <option value="Recovering">Recovering</option>
                                <option value="UnfitToRace">UnfitToRace</option>
                            </select>
                        </div>

                        <div className="mb-5 rounded-[var(--admin-radius)] border border-[#ffc107] bg-[#fff3cd] p-3 text-[0.82rem] text-[#856404]">
                            ⚠️ Only horses with 'Healthy' status are eligible for Grade 1 stakes races in the upcoming tournament.
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Upload Profile Photo <span className="text-[#bbb]">(max {MAX_FILE_MB} MB)</span></label>
                            <div className="rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] p-6 text-center">
                                <span className="text-[1.5rem]">📷</span>
                                <p className="m-0 mt-2 text-[0.82rem] text-[var(--admin-muted)]">Upload Profile Photo</p>
                                <p className="m-0 mt-1 text-[0.72rem] text-[#bbb]">PNG, JPG up to {MAX_FILE_MB}MB</p>
                                <input type="file" accept="image/*" onChange={handleHorseImageChange} className="mt-3" />
                                {horseImagePreview && (
                                    <img src={horseImagePreview} alt="Horse preview"
                                        className="mx-auto mt-4 max-h-[160px] rounded-md object-cover" />
                                )}
                            </div>
                            <ErrMsg msg={fieldErrors.horseImage} />
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Upload Health Certificate <span className="text-[#bbb]">(max {MAX_FILE_MB} MB)</span></label>
                            <div className="rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] p-6 text-center">
                                <span className="text-[1.5rem]">🏥</span>
                                <p className="m-0 mt-2 text-[0.82rem] text-[var(--admin-muted)]">Upload Health Certificate</p>
                                <p className="m-0 mt-1 text-[0.72rem] text-[#bbb]">PNG, JPG, WEBP up to {MAX_FILE_MB}MB</p>
                                <input type="file" accept="image/png,image/jpeg,image/webp"
                                    onChange={handleHealthCertificateChange} className="mt-3" />
                                {healthCertificatePreview && (
                                    <img src={healthCertificatePreview} alt="Health certificate preview"
                                        className="mx-auto mt-4 max-h-[180px] rounded-md border border-[var(--admin-border)] object-contain" />
                                )}
                            </div>
                            <ErrMsg msg={fieldErrors.healthCert} />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                {error && (
                    <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                        ⚠️ {error}
                    </div>
                )}
                <div className="flex gap-3">
                    <button onClick={() => navigate("/owner/my-horse")}
                        className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-6 font-bold text-[var(--admin-ink)] hover:bg-[#f5f5f5]">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border-0 bg-[var(--admin-primary)] px-6 font-bold text-white hover:bg-[var(--admin-primary-dark)] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Registering...' : 'Register Horse'}
                    </button>
                </div>
            </section>

            <Toast
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
                duration={3500}
            />
        </HorseOwnerLayout>
    );
}
