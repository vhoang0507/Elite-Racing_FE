import { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaPhoneAlt,
    FaWeight,
    FaShieldAlt,
    FaPaw,
    FaTrash,
    FaPlus,
    FaSave,
} from 'react-icons/fa';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

function JockeySetting() {
    const [profile, setProfile] = useState(null);
    const [options, setOptions] = useState(null);
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [distanceExperiences, setDistanceExperiences] = useState([]);
    const [breedExperiences, setBreedExperiences] = useState([]);
    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [profileData, optionsData, breedsData] = await Promise.all([
                    jockeyApi.getJockeyProfile(),
                    jockeyApi.getJockeySettingsOptions(),
                    jockeyApi.getJockeyHorseBreeds(),
                ]);
                setProfile(profileData);
                setOptions(optionsData);
                setBreeds(breedsData);
                setDistanceExperiences(profileData.distanceExperiences ?? []);
                setBreedExperiences(profileData.breedExperiences ?? []);
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleDistanceSkill = (distanceMeters, skillLevel) => {
        setDistanceExperiences(prev => {
            const exists = prev.find(e => e.distanceMeters === distanceMeters);
            if (exists) return prev.map(e => e.distanceMeters === distanceMeters ? { ...e, skillLevel } : e);
            return [...prev, { distanceMeters, skillLevel }];
        });
    };

    const addBreed = () => {
        if (!selectedBreed || !selectedLevel) return;
        const breedId = Number(selectedBreed);
        const breedObj = breeds.find(b => b.breedId === breedId);
        if (!breedObj) return;
        if (breedExperiences.find(e => e.breedId === breedId)) return;
        setBreedExperiences(prev => [...prev, { breedId, breedName: breedObj.breedName, experienceLevel: selectedLevel }]);
        setSelectedBreed('');
        setSelectedLevel('');
    };

    const removeBreed = (breedId) => {
        setBreedExperiences(prev => prev.filter(e => e.breedId !== breedId));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await jockeyApi.updateJockeyVerification({
                weightKg: profile.weightKg ?? 65,
                yearsOfExperience: profile.yearsOfExperience ?? 5,
                healthStatus: 'Healthy',
                certificateNo: profile.certificateNo,
                certificateFileUrl: profile.certificateFileUrl,
                profileImageUrl: profile.profileImageUrl,
                idCardFrontUrl: profile.idCardFrontUrl,
                idCardBackUrl: profile.idCardBackUrl,
                healthCertificateUrl: profile.healthCertificateUrl,
                distanceExperiences: distanceExperiences.map(e => ({
                    distanceMeters: e.distanceMeters,
                    skillLevel: e.skillLevel,
                })),
                breedExperiences: breedExperiences.map(e => ({
                    breedId: e.breedId,
                    experienceLevel: e.experienceLevel,
                })),
            });
            setSuccess('Đã gửi hồ sơ. Vui lòng chờ admin duyệt.');
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <JockeyLayout activeKey="settings">
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</p>
        </JockeyLayout>
    );

    return (
        <JockeyLayout activeKey="settings">
            <section className={pageShellClass}>
                {/* Header */}
                <div>
                    <h1 className="m-0 text-[2rem] text-[var(--admin-primary-dark)]">Settings</h1>
                    <p className="mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage your profile, horse breed experience and distance preferences.
                    </p>
                </div>

                {/* Profile */}
                <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-5 max-[1080px]:grid-cols-1">
                    <article className={`${panelClass} p-7`}>
                        <div className="flex gap-7 max-[720px]:flex-col">
                            <img
                                src={profile?.profileImageUrl || '/Jockey1.jpg'}
                                alt={profile?.fullName}
                                className="h-[190px] w-[150px] rounded-lg border border-[var(--admin-border)] object-cover shadow-md"
                            />
                            <div className="flex-1">
                                <h2 className="text-[3.2rem] font-black leading-[1.05] text-[var(--admin-primary-dark)]">
                                    {profile?.fullName}
                                </h2>
                                <p className="mt-3 text-[1.1rem] text-[var(--admin-muted)]">{profile?.jockeyCode}</p>
                                <div className="mt-6 border-t border-[var(--admin-border)] pt-5">
                                    <div className="grid grid-cols-2 gap-6 max-[720px]:grid-cols-1">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#ffe8e4] text-[var(--admin-primary)]">
                                                <FaPhoneAlt />
                                            </div>
                                            <div>
                                                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">Phone Number</div>
                                                <strong>{profile?.phone || '-'}</strong>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#ffe8e4] text-[var(--admin-primary)]">
                                                <FaEnvelope />
                                            </div>
                                            <div>
                                                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">Email</div>
                                                <strong>{profile?.email}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <article className={`${panelClass} p-5 text-center`}>
                                <FaWeight className="mx-auto text-[1.3rem] text-[var(--admin-primary)]" />
                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">Weight</p>
                                <strong className="text-[1.8rem]">{profile?.weightKg ?? '-'}kg</strong>
                            </article>
                            <article className={`${panelClass} p-5 text-center`}>
                                <FaShieldAlt className="mx-auto text-[1.3rem] text-[#12a150]" />
                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">Health</p>
                                <strong className="text-[1.3rem] text-[#12a150]">{profile?.healthStatus ?? '-'}</strong>
                            </article>
                        </div>
                        <article className={`${panelClass} p-6`}>
                            <p className="text-[0.75rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">Experience</p>
                            <strong className="text-[3rem] font-light text-[var(--admin-primary-dark)]">
                                {profile?.yearsOfExperience ?? '-'} years
                            </strong>
                        </article>
                    </div>
                </section>

                {/* Verification Documents */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Verification Documents</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">Upload and manage required verification documents.</p>

                    <div className="mt-6 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                        {/* Profile Avatar */}
                        <div className="rounded-lg border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">Profile Avatar</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#faf8f8] p-4">
                                {profile?.profileImageUrl ? (
                                    <img src={profile.profileImageUrl} alt="avatar" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#ccc]">
                                        <span className="text-[2rem]">🖼</span>
                                        <span className="text-[0.75rem]">profileAvatar.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input
                                value={profile?.profileImageUrl ?? ''}
                                onChange={e => setProfile(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                                placeholder="Image URL..."
                                className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                            />
                        </div>

                        {/* National ID Front */}
                        <div className="rounded-lg border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">National ID - Front</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#faf8f8] p-4">
                                {profile?.idCardFrontUrl ? (
                                    <img src={profile.idCardFrontUrl} alt="id front" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#ccc]">
                                        <span className="text-[2rem]">🖼</span>
                                        <span className="text-[0.75rem]">national_id_front.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input
                                value={profile?.idCardFrontUrl ?? ''}
                                onChange={e => setProfile(prev => ({ ...prev, idCardFrontUrl: e.target.value }))}
                                placeholder="Image URL..."
                                className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                            />
                        </div>

                        {/* National ID Back */}
                        <div className="rounded-lg border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">National ID - Back</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#faf8f8] p-4">
                                {profile?.idCardBackUrl ? (
                                    <img src={profile.idCardBackUrl} alt="id back" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#ccc]">
                                        <span className="text-[2rem]">🖼</span>
                                        <span className="text-[0.75rem]">national_id_back.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input
                                value={profile?.idCardBackUrl ?? ''}
                                onChange={e => setProfile(prev => ({ ...prev, idCardBackUrl: e.target.value }))}
                                placeholder="Image URL..."
                                className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                            />
                        </div>

                        {/* Horse Racing Certificate */}
                        <div className="rounded-lg border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">Horse Racing Certificate</p>
                            {profile?.certificateFileUrl && (
                                <div className="mb-2 flex items-center gap-2 rounded-md bg-[#fff3ef] px-3 py-2 text-[0.82rem]">
                                    <span>📄</span>
                                    <span className="flex-1 truncate text-[var(--admin-primary)]">{profile.certificateFileUrl}</span>
                                </div>
                            )}
                            <div className="mb-3 flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#faf8f8] p-4">
                                <div className="flex flex-col items-center gap-1 text-[#ccc]">
                                    <span className="text-[1.5rem]">📄</span>
                                    <span className="text-[0.75rem]">Upload PDF/Image</span>
                                </div>
                            </div>
                            <div className="mb-2">
                                <label className="mb-1 block text-[0.72rem] font-bold uppercase text-[var(--admin-muted)]">Certificate No</label>
                                <input
                                    value={profile?.certificateNo ?? ''}
                                    onChange={e => setProfile(prev => ({ ...prev, certificateNo: e.target.value }))}
                                    placeholder="e.g. CERT-2024-001"
                                    className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                                />
                            </div>
                            <input
                                value={profile?.certificateFileUrl ?? ''}
                                onChange={e => setProfile(prev => ({ ...prev, certificateFileUrl: e.target.value }))}
                                placeholder="Certificate file URL..."
                                className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                            />
                        </div>
                    </div>

                    {/* Health Certificate - full width */}
                    <div className="mt-4 rounded-lg border border-[var(--admin-border)] p-4">
                        <p className="mb-3 text-[0.85rem] font-bold">Health Examination Certificate</p>
                        <div className="mb-3 flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-[#faf8f8] p-4">
                            {profile?.healthCertificateUrl ? (
                                <div className="flex items-center gap-2 text-[0.82rem] text-[var(--admin-muted)]">
                                    <span>📄</span>
                                    <span className="truncate">{profile.healthCertificateUrl}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-[#ccc]">
                                    <span className="text-[1.5rem]">📄</span>
                                    <span className="text-[0.75rem]">No file selected</span>
                                </div>
                            )}
                        </div>
                        <input
                            value={profile?.healthCertificateUrl ?? ''}
                            onChange={e => setProfile(prev => ({ ...prev, healthCertificateUrl: e.target.value }))}
                            placeholder="Health certificate URL..."
                            className="w-full rounded-md border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)]"
                        />
                    </div>
                </section>

                {/* Distance Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Distance Experience</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">3 fixed race distances • each row = 1 jockey_distance_experiences record</p>
                    <div className="mt-7 grid gap-7">
                        {options?.distanceOptions?.map((item) => {
                            const current = distanceExperiences.find(e => e.distanceMeters === item.distanceMeters);
                            return (
                                <div key={item.distanceMeters} className="flex items-center justify-between border-b border-[var(--admin-border)] pb-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
                                    <strong>{item.label}</strong>
                                    <div className="flex flex-wrap gap-2">
                                        {options?.skillLevels?.map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => handleDistanceSkill(item.distanceMeters, level)}
                                                className={`rounded-full px-4 py-2 text-[0.8rem] font-bold ${current?.skillLevel === level
                                                    ? 'bg-[var(--admin-primary)] text-white'
                                                    : 'border border-[var(--admin-border)] text-[var(--admin-ink)]'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Breed Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Breed Experience</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">Only 8 horse breeds available • each row = 1 jockey_breed_experiences record</p>
                    <div className="mt-6 grid gap-4">
                        {breedExperiences.map((breed) => (
                            <article key={breed.breedId} className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[#fff8f6] p-4 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-[var(--admin-primary)]">
                                        <FaPaw />
                                    </div>
                                    <div>
                                        <strong>{breed.breedName}</strong>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-[var(--admin-primary)] px-4 py-1 text-[0.8rem] font-bold text-white">
                                        {breed.experienceLevel}
                                    </span>
                                    <button onClick={() => removeBreed(breed.breedId)} type="button" className="text-red-600">
                                        <FaTrash />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 rounded-lg border border-dashed border-[var(--admin-border)] p-5">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 max-[980px]:grid-cols-1">
                            <select value={selectedBreed} onChange={(e) => setSelectedBreed(e.target.value)} className="rounded-md border border-[var(--admin-border)] px-4 py-3">
                                <option value="">Choose a breed...</option>
                                {breeds.map((b) => (
                                    <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                ))}
                            </select>
                            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="rounded-md border border-[var(--admin-border)] px-4 py-3">
                                <option value="">Choose level...</option>
                                {options?.breedExperienceLevels?.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <button onClick={addBreed} type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-700 px-5 py-3 font-bold text-blue-700">
                                <FaPlus /> Add Breed
                            </button>
                        </div>
                    </div>
                </section>

                {/* Error/Success */}
                {error && <p style={{ color: '#721c24', fontSize: '13px' }}>{error}</p>}
                {success && <p style={{ color: '#155724', fontSize: '13px' }}>{success}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button type="button" className="rounded-md border border-[#b89d36] px-8 py-3 font-bold text-[#8b7515]">
                        Cancel Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-md bg-[var(--admin-primary)] px-8 py-3 font-bold text-white disabled:opacity-50"
                    >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </section>
        </JockeyLayout>
    );
}

export default JockeySetting;