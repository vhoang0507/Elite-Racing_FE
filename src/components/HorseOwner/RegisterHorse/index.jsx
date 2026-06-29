import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";
import { ownerApi } from "../../../api/ownerApi";
import { uploadFile, resolveFileUrl } from "../../../api/uploadApi";
import Toast, { useToast } from "../../shared/Toast";

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
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleHorseImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setHorseImageFile(file);
        setHorseImagePreview(URL.createObjectURL(file));
    };

    const handleHealthCertificateChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setHealthCertificateFile(file);
        setHealthCertificatePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setError('');
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
                horseName: form.horseName,
                breedId: Number(form.breedId),
                age: Number(form.age),
                heightCm: form.heightCm ? Number(form.heightCm) : null,
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

    const inputClass = "w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-3 py-2.5 text-[0.9rem] text-[var(--admin-ink)] outline-none focus:border-[var(--admin-primary)]";
    const labelClass = "mb-1.5 block text-[0.78rem] font-bold text-[var(--admin-muted)]";

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
                            <label className={labelClass}>Horse Name</label>
                            <input name="horseName" value={form.horseName} onChange={handleChange} placeholder="e.g., Midnight Monarch" className={inputClass} />
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Breed Type</label>
                            <select name="breedId" value={form.breedId} onChange={handleChange} className={inputClass}>
                                <option value="">Select Breed</option>
                                {breeds.map(b => (
                                    <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>Age (Years)</label>
                                <input name="age" value={form.age} onChange={handleChange} placeholder="0" type="number" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Height (Cm)</label>
                                <input name="heightCm" value={form.heightCm} onChange={handleChange} placeholder="155" type="number" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Weight (Kg)</label>
                                <input name="weightKg" value={form.weightKg} onChange={handleChange} placeholder="500" type="number" className={inputClass} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Achievement Summary & Bloodline History</label>
                            <textarea name="achievementSummary" value={form.achievementSummary} onChange={handleChange}
                                placeholder="Detail recent race placements, notable lineage, and distinctive physical characteristics..."
                                className={`${inputClass} min-h-[100px] resize-y`} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
                        <h3 className="m-0 mb-5 text-[1rem] font-bold text-[var(--admin-ink)]">🏥 Clinical Status</h3>

                        <div className="mb-4">
                            <label className={labelClass}>Current Health State</label>
                            <select name="healthStatus" value={form.healthStatus} onChange={handleChange} className={inputClass}>
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
                            <label className={labelClass}>Upload Profile Photo</label>
                            <div className="rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] p-6 text-center">
                                <span className="text-[1.5rem]">📷</span>
                                <p className="m-0 mt-2 text-[0.82rem] text-[var(--admin-muted)]">Upload Profile Photo</p>
                                <p className="m-0 mt-1 text-[0.72rem] text-[#bbb]">PNG, JPG up to 10MB</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleHorseImageChange}
                                    className="mt-3"
                                />

                                {horseImagePreview && (
                                    <img
                                        src={resolveFileUrl(horseImagePreview)}
                                        alt="Horse preview"
                                        className="mx-auto mt-4 max-h-[160px] rounded-md object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Upload Health Certificate Image</label>
                            <div className="rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] p-6 text-center">
                                <span className="text-[1.5rem]">HC</span>
                                <p className="m-0 mt-2 text-[0.82rem] text-[var(--admin-muted)]">Upload Health Certificate</p>
                                <p className="m-0 mt-1 text-[0.72rem] text-[#bbb]">PNG, JPG, WEBP up to 10MB</p>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleHealthCertificateChange}
                                    className="mt-3"
                                />

                                {healthCertificatePreview && (
                                    <img
                                        src={resolveFileUrl(healthCertificatePreview)}
                                        alt="Health certificate preview"
                                        className="mx-auto mt-4 max-h-[180px] rounded-md border border-[var(--admin-border)] object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    {error && <p className="m-0 text-[0.82rem] text-[#c62828]">{error}</p>}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate("/owner/my-horse")} className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-6 font-bold text-[var(--admin-ink)] hover:bg-[#f5f5f5]">
                        Draft
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
