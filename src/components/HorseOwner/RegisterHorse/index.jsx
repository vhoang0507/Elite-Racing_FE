import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HorseOwnerLayout from "../HorseOwnerLayout";

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
                            <select name="breedType" value={form.breedType} onChange={handleChange} className={inputClass}>
                                <option value="">Select Breed</option>
                                <option>Arabian</option>
                                <option>Thoroughbred</option>
                                <option>Mustang</option>
                                <option>Andalusian</option>
                            </select>
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>Age (Years)</label>
                                <input name="age" value={form.age} onChange={handleChange} placeholder="0" type="number" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Height (Cm)</label>
                                <input name="height" value={form.height} onChange={handleChange} placeholder="15.2" type="number" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Weight (Kg)</label>
                                <input name="weight" value={form.weight} onChange={handleChange} placeholder="1100" type="number" className={inputClass} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className={labelClass}>Achievement Summary & Bloodline History</label>
                            <textarea name="achievement" value={form.achievement} onChange={handleChange}
                                placeholder="Detail recent race placements, notable lineage, and distinctive physical characteristics..."
                                className={`${inputClass} min-h-[100px] resize-y`} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
                        <h3 className="m-0 mb-5 text-[1rem] font-bold text-[var(--admin-ink)]">🏥 Clinical Status</h3>

                        <div className="mb-4">
                            <label className={labelClass}>Current Health State</label>
                            <select name="healthState" value={form.healthState} onChange={handleChange} className={inputClass}>
                                <option>Healthy</option>
                                <option>Injured</option>
                                <option>Training</option>
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
                                <input type="file" accept="image/*" className="mt-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button onClick={() => navigate("/owner/my-horse")} className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-6 font-bold text-[var(--admin-ink)] hover:bg-[#f5f5f5]">
                        Draft
                    </button>
                    <button className="min-h-[38px] cursor-pointer rounded-[var(--admin-radius)] border-0 bg-[var(--admin-primary)] px-6 font-bold text-white hover:bg-[var(--admin-primary-dark)]">
                        Register Horse
                    </button>
                </div>
            </section>
        </HorseOwnerLayout>
    );
}
