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
    FaFileAlt,
    FaExclamationTriangle,
    FaCheckCircle,
} from 'react-icons/fa';

import ChangePasswordCard from '../shared/ChangePasswordCard';

import JockeyLayout from './JockeyLayout';
import { jockeyApi } from '../../api/jockeyApi';
import { uploadFile, resolveFileUrl } from '../../api/uploadApi';

const pageShellClass = 'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';
const panelClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';
const MAX_FILE_MB = 5;

function validate(profile, distanceExperiences) {
    const errs = {};

    // Weight
    const w = Number(profile?.weightKg);
    if (!profile?.weightKg && profile?.weightKg !== 0) {
        errs.weightKg = 'Weight is required.';
    } else if (isNaN(w) || w < 30 || w > 130) {
        errs.weightKg = 'Weight must be between 30 – 130 kg.';
    }

    // Experience
    const yoe = Number(profile?.yearsOfExperience);
    if (profile?.yearsOfExperience === '' || profile?.yearsOfExperience === null || profile?.yearsOfExperience === undefined) {
        errs.yearsOfExperience = 'Years of experience is required.';
    } else if (isNaN(yoe) || yoe < 0 || yoe > 50 || !Number.isInteger(yoe)) {
        errs.yearsOfExperience = 'Must be a whole number between 0 – 50.';
    }

    // Health status
    if (!profile?.healthStatus) {
        errs.healthStatus = 'Please select a health status.';
    }

    // Certificate No
    if (!profile?.certificateNo?.trim()) {
        errs.certificateNo = 'Certificate number is required.';
    } else if (!/^[A-Za-z0-9\-_./]{3,30}$/.test(profile.certificateNo.trim())) {
        errs.certificateNo = 'Only letters, numbers, hyphens (3–30 chars).';
    }

    // Distance experiences — each distance must have a level
    const missing = distanceExperiences.filter(e => !e.skillLevel);
    if (missing.length > 0) {
        errs.distanceExperiences = 'Please select a skill level for every distance.';
    }

    return errs;
}

function ErrMsg({ msg }) {
    if (!msg) return null;
    return <p style={{ margin: '4px 0 0', fontSize: 11, color: '#a4392f', fontWeight: 600 }}>{msg}</p>;
}

function JockeySetting() {
    const [profile, setProfile] = useState(null);
    const [originalProfile, setOriginalProfile] = useState(null);
    const [options, setOptions] = useState(null);
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [distanceExperiences, setDistanceExperiences] = useState([]);
    const [originalDistExp, setOriginalDistExp] = useState([]);
    const [breedExperiences, setBreedExperiences] = useState([]);
    const [originalBreedExp, setOriginalBreedExp] = useState([]);
    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    const [selectedFiles, setSelectedFiles] = useState({});
    const [previewUrls, setPreviewUrls] = useState({});
    const [fileErrors, setFileErrors] = useState({});

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
                setOriginalProfile(profileData);
                setOptions(optionsData);
                setBreeds(breedsData);
                const de = profileData.distanceExperiences ?? [];
                const be = profileData.breedExperiences ?? [];
                setDistanceExperiences(de);
                setOriginalDistExp(de);
                setBreedExperiences(be);
                setOriginalBreedExp(be);
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleCancel = () => {
        setProfile(originalProfile);
        setDistanceExperiences(originalDistExp);
        setBreedExperiences(originalBreedExp);
        setSelectedFiles({});
        setPreviewUrls({});
        setFileErrors({});
        setFieldErrors({});
        setError('');
        setSuccess('');
    };

    const handleDistanceSkill = (distanceMeters, skillLevel) => {
        setDistanceExperiences(prev => {
            const exists = prev.find(e => e.distanceMeters === distanceMeters);
            if (exists) return prev.map(e => e.distanceMeters === distanceMeters ? { ...e, skillLevel } : e);
            return [...prev, { distanceMeters, skillLevel }];
        });
        setFieldErrors(prev => ({ ...prev, distanceExperiences: undefined }));
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

    const handleFileChange = (field) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxBytes = MAX_FILE_MB * 1024 * 1024;
        if (file.size > maxBytes) {
            setFileErrors(prev => ({ ...prev, [field]: `File too large. Max ${MAX_FILE_MB} MB.` }));
            e.target.value = '';
            return;
        }
        setFileErrors(prev => ({ ...prev, [field]: undefined }));
        setSelectedFiles(prev => ({ ...prev, [field]: file }));
        setPreviewUrls(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    };

    const uploadSelectedFiles = async () => {
        const uploadedUrls = {};
        for (const [field, file] of Object.entries(selectedFiles)) {
            const uploaded = await uploadFile(file, 'jockeys');
            uploadedUrls[field] = uploaded.url;
        }
        return uploadedUrls;
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        const errs = validate(profile, distanceExperiences);
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError('Please fix the errors above before saving.');
            return;
        }

        setSaving(true);
        try {
            const uploadedUrls = await uploadSelectedFiles();
            const nextProfile = { ...profile, ...uploadedUrls };

            await jockeyApi.updateJockeyVerification({
                weightKg: Number(nextProfile.weightKg),
                yearsOfExperience: Number(nextProfile.yearsOfExperience),
                healthStatus: nextProfile.healthStatus,
                certificateNo: nextProfile.certificateNo,
                certificateFileUrl: nextProfile.certificateFileUrl,
                profileImageUrl: nextProfile.profileImageUrl,
                idCardFrontUrl: nextProfile.idCardFrontUrl,
                idCardBackUrl: nextProfile.idCardBackUrl,
                healthCertificateUrl: nextProfile.healthCertificateUrl,
                distanceExperiences: distanceExperiences.map(e => ({
                    distanceMeters: e.distanceMeters,
                    skillLevel: e.skillLevel,
                })),
                breedExperiences: breedExperiences.map(e => ({
                    breedId: e.breedId,
                    experienceLevel: e.experienceLevel,
                })),
            });

            setProfile(nextProfile);
            setOriginalProfile(nextProfile);
            setOriginalDistExp(distanceExperiences);
            setOriginalBreedExp(breedExperiences);
            setSelectedFiles({});
            setPreviewUrls({});
            setFieldErrors({});
            setSuccess('Profile submitted. Please wait for admin approval.');
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <JockeyLayout activeKey="settings">
            <p className="p-10 text-center font-semibold text-[var(--admin-muted)]">Loading...</p>
        </JockeyLayout>
    );

    const getPreview = (field) => previewUrls[field] ?? (profile?.[field] ? resolveFileUrl(profile[field]) : null);

    return (
        <JockeyLayout activeKey="settings">
            <section className={pageShellClass}>
                {/* Header */}
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">
                        Manage your profile, horse breed experience and distance preferences.
                    </p>
                </div>

                {/* Profile */}
                <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-5 max-[1080px]:grid-cols-1">
                    <article className={`${panelClass} p-7`}>
                        <div className="flex gap-7 max-[720px]:flex-col">
                            <img
                                src={previewUrls.profileImageUrl ? previewUrls.profileImageUrl : (profile?.profileImageUrl ? resolveFileUrl(profile.profileImageUrl) : '/Jockey1.jpg')}
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
                                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
                                                <FaPhoneAlt />
                                            </div>
                                            <div>
                                                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">Phone Number</div>
                                                <strong>{profile?.phone || '-'}</strong>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
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
                            {/* Weight */}
                            <article className={`${panelClass} p-5 text-center`}>
                                <FaWeight className="mx-auto text-[1.3rem] text-[var(--admin-primary)]" />
                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">Weight (kg)</p>
                                <input
                                    type="number"
                                    min="30"
                                    max="130"
                                    value={profile?.weightKg ?? ''}
                                    onChange={(e) => {
                                        setProfile(prev => ({ ...prev, weightKg: e.target.value }));
                                        setFieldErrors(prev => ({ ...prev, weightKg: undefined }));
                                    }}
                                    className={`mt-1 w-full rounded-[var(--admin-radius)] border px-2 py-1 text-center text-[1.2rem] font-bold outline-none focus:border-[var(--admin-primary)] ${fieldErrors.weightKg ? 'border-[#d89288] bg-[#f3e1df]' : 'border-[var(--admin-border)]'}`}
                                />
                                <ErrMsg msg={fieldErrors.weightKg} />
                            </article>

                            {/* Health */}
                            <article className={`${panelClass} p-5 text-center`}>
                                <FaShieldAlt className="mx-auto text-[1.3rem] text-[#16864f]" />
                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">Health</p>
                                <select
                                    value={profile?.healthStatus ?? ''}
                                    onChange={(e) => {
                                        setProfile(prev => ({ ...prev, healthStatus: e.target.value }));
                                        setFieldErrors(prev => ({ ...prev, healthStatus: undefined }));
                                    }}
                                    className={`mt-1 w-full rounded-[var(--admin-radius)] border px-2 py-1 text-center text-[1rem] font-bold text-[#16864f] outline-none focus:border-[var(--admin-primary)] ${fieldErrors.healthStatus ? 'border-[#d89288] bg-[#f3e1df]' : 'border-[var(--admin-border)]'}`}
                                >
                                    <option value="">-- Select --</option>
                                    {options?.healthStatuses?.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <ErrMsg msg={fieldErrors.healthStatus} />
                            </article>
                        </div>

                        {/* Experience */}
                        <article className={`${panelClass} p-6`}>
                            <p className="text-[0.75rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">Experience (years)</p>
                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="1"
                                value={profile?.yearsOfExperience ?? ''}
                                onChange={(e) => {
                                    setProfile(prev => ({ ...prev, yearsOfExperience: e.target.value }));
                                    setFieldErrors(prev => ({ ...prev, yearsOfExperience: undefined }));
                                }}
                                className={`mt-2 w-32 rounded-[var(--admin-radius)] border px-3 py-2 text-[1.5rem] font-light text-[var(--admin-primary-dark)] outline-none focus:border-[var(--admin-primary)] ${fieldErrors.yearsOfExperience ? 'border-[#d89288] bg-[#f3e1df]' : 'border-[var(--admin-border)]'}`}
                            />
                            <ErrMsg msg={fieldErrors.yearsOfExperience} />
                        </article>
                    </div>
                </section>

                {/* Verification Documents */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Verification Documents</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">Max {MAX_FILE_MB} MB per file. Images: jpg/png/webp. Certificate/Health: image or PDF.</p>

                    <div className="mt-6 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
                        {/* Profile Avatar */}
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">Profile Avatar</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
                                {getPreview('profileImageUrl') ? (
                                    <img src={getPreview('profileImageUrl')} alt="avatar" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#d8cfb8]">
                                        <FaSave className="text-[1.6rem]" />
                                        <span className="text-[0.75rem]">profileAvatar.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange('profileImageUrl')}
                                className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none" />
                            <ErrMsg msg={fileErrors.profileImageUrl} />
                        </div>

                        {/* ID Front */}
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">National ID - Front</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
                                {getPreview('idCardFrontUrl') ? (
                                    <img src={getPreview('idCardFrontUrl')} alt="id front" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#d8cfb8]">
                                        <FaSave className="text-[1.6rem]" />
                                        <span className="text-[0.75rem]">national_id_front.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange('idCardFrontUrl')}
                                className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none" />
                            <ErrMsg msg={fileErrors.idCardFrontUrl} />
                        </div>

                        {/* ID Back */}
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">National ID - Back</p>
                            <div className="mb-3 flex min-h-[140px] flex-col items-center justify-center rounded-[var(--admin-radius)] border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
                                {getPreview('idCardBackUrl') ? (
                                    <img src={getPreview('idCardBackUrl')} alt="id back" className="max-h-[120px] rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#d8cfb8]">
                                        <FaSave className="text-[1.6rem]" />
                                        <span className="text-[0.75rem]">national_id_back.jpg</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange('idCardBackUrl')}
                                className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none" />
                            <ErrMsg msg={fileErrors.idCardBackUrl} />
                        </div>

                        {/* Certificate */}
                        <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
                            <p className="mb-3 text-[0.85rem] font-bold">Horse Racing Certificate</p>
                            {(selectedFiles.certificateFileUrl || profile?.certificateFileUrl) && (
                                <div className="mb-2 flex items-center gap-2 rounded-full bg-[var(--admin-surface-strong)] px-3 py-2 text-[0.82rem]">
                                    <FaFileAlt className="text-[var(--admin-primary)]" />
                                    <span className="flex-1 truncate text-[var(--admin-primary)]">
                                        {selectedFiles.certificateFileUrl?.name ?? profile?.certificateFileUrl}
                                    </span>
                                </div>
                            )}
                            <div className="mb-2">
                                <label className="mb-1 block text-[0.72rem] font-bold uppercase text-[var(--admin-muted)]">Certificate No <span className="text-red-500">*</span></label>
                                <input
                                    value={profile?.certificateNo ?? ''}
                                    onChange={e => {
                                        setProfile(prev => ({ ...prev, certificateNo: e.target.value }));
                                        setFieldErrors(prev => ({ ...prev, certificateNo: undefined }));
                                    }}
                                    placeholder="e.g. CERT-2024-001"
                                    className={`w-full rounded-[var(--admin-radius)] border px-3 py-2 text-[0.82rem] outline-none focus:border-[var(--admin-primary)] ${fieldErrors.certificateNo ? 'border-[#d89288] bg-[#f3e1df]' : 'border-[var(--admin-border)]'}`}
                                />
                                <ErrMsg msg={fieldErrors.certificateNo} />
                            </div>
                            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange('certificateFileUrl')}
                                className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none" />
                            <ErrMsg msg={fileErrors.certificateFileUrl} />
                        </div>
                    </div>

                    {/* Health Certificate */}
                    <div className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
                        <p className="mb-3 text-[0.85rem] font-bold">Health Examination Certificate</p>
                        {(selectedFiles.healthCertificateUrl || profile?.healthCertificateUrl) && (
                            <div className="mb-3 flex items-center gap-2 rounded-full bg-[var(--admin-surface-strong)] px-3 py-2 text-[0.82rem]">
                                <span>📄</span>
                                <span className="truncate">{selectedFiles.healthCertificateUrl?.name ?? profile?.healthCertificateUrl}</span>
                            </div>
                        )}
                        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange('healthCertificateUrl')}
                            className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2 text-[0.82rem] outline-none" />
                        <ErrMsg msg={fileErrors.healthCertificateUrl} />
                    </div>
                </section>

                {/* Distance Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Distance Experience</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">3 fixed race distances • select a skill level for each.</p>
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
                    <ErrMsg msg={fieldErrors.distanceExperiences} />
                </section>

                {/* Breed Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">Breed Experience</h2>
                    <p className="mt-1 text-[0.85rem] text-[var(--admin-muted)]">Only 8 horse breeds available • each row = 1 breed record</p>
                    <div className="mt-6 grid gap-4">
                        {breedExperiences.map((breed) => (
                            <article key={breed.breedId} className="flex items-center justify-between rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--admin-primary)]">
                                        <FaPaw />
                                    </div>
                                    <strong>{breed.breedName}</strong>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-[var(--admin-primary)] px-4 py-1 text-[0.8rem] font-bold text-white">
                                        {breed.experienceLevel}
                                    </span>
                                    <button onClick={() => removeBreed(breed.breedId)} type="button" className="text-[#a4392f] hover:text-[#7d2b23]">
                                        <FaTrash />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-border)] p-5">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 max-[980px]:grid-cols-1">
                            <select value={selectedBreed} onChange={(e) => setSelectedBreed(e.target.value)} className="rounded-full border border-[var(--admin-border)] px-4 py-3">
                                <option value="">Choose a breed...</option>
                                {breeds
                                    .filter(b => !breedExperiences.find(e => e.breedId === b.breedId))
                                    .map((b) => (
                                        <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                                    ))}
                            </select>
                            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="rounded-full border border-[var(--admin-border)] px-4 py-3">
                                <option value="">Choose level...</option>
                                {options?.breedExperienceLevels?.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            <button
                                onClick={addBreed}
                                disabled={!selectedBreed || !selectedLevel}
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--admin-primary)] px-5 py-3 font-bold text-[var(--admin-primary)] transition-colors hover:bg-[var(--admin-surface-strong)] disabled:opacity-40"
                            >
                                <FaPlus /> Add Breed
                            </button>
                        </div>
                    </div>
                </section>
                <ChangePasswordCard />
                {/* Error/Success */}
                {error && (
                    <div className="flex items-center gap-2 rounded-full border border-[#d89288] bg-[#f3e1df] px-4 py-3 text-[13px] font-semibold text-[#a4392f]">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 rounded-full border border-[#9fdcb9] bg-[#e8f7ee] px-4 py-3 text-[13px] font-semibold text-[#16864f]">
                        <FaCheckCircle /> {success}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={handleCancel} className="rounded-full border border-[var(--racing-gold-bright)] px-8 py-3 font-bold text-[#8a6209] transition-colors hover:bg-[#faf2e0]">
                        Cancel Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-primary)] px-8 py-3 font-bold text-white transition-colors hover:bg-[var(--admin-primary-dark)] disabled:opacity-50"
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
