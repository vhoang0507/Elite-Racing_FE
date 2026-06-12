import { useState } from 'react';
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

import {
    jockeyProfile,
    jockeyDistanceExperiences,
    jockeyBreedExperiences,
    availableBreeds,
    experienceLevels,
} from '../../data/jockeyMockData';

const pageShellClass =
    'grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7';

const panelClass =
    'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]';

function JockeySetting() {
    const [breedExperiences, setBreedExperiences] = useState(
        jockeyBreedExperiences
    );

    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    const addBreed = () => {
        if (!selectedBreed || !selectedLevel) return;

        setBreedExperiences((prev) => [
            ...prev,
            {
                id: Date.now(),
                breed: selectedBreed,
                description: 'Custom Experience',
                level: selectedLevel,
            },
        ]);

        setSelectedBreed('');
        setSelectedLevel('');
    };

    const removeBreed = (id) => {
        setBreedExperiences((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <JockeyLayout activeKey="settings">
            <section className={pageShellClass}>
                {/* Header */}
                <div>
                    <h1 className="m-0 text-[2rem] text-[var(--admin-primary-dark)]">
                        Settings
                    </h1>

                    <p className="mt-1.5 font-[650] text-[var(--admin-muted)]">
                        Manage your profile, horse breed experience and
                        distance preferences.
                    </p>
                </div>

                {/* Profile */}
                <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-5 max-[1080px]:grid-cols-1">
                    <article className={`${panelClass} p-7`}>
                        <div className="flex gap-7 max-[720px]:flex-col">
                            <img
                                src={jockeyProfile.image}
                                alt={jockeyProfile.name}
                                className="h-[190px] w-[150px] rounded-lg border border-[var(--admin-border)] object-cover shadow-md"
                            />

                            <div className="flex-1">
                                <h2 className="text-[3.2rem] font-black leading-[1.05] text-[var(--admin-primary-dark)]">
                                    Sebastian
                                    <br />
                                    Reid
                                </h2>

                                <p className="mt-3 text-[1.1rem] text-[var(--admin-muted)]">
                                    {jockeyProfile.id}
                                </p>

                                <div className="mt-6 border-t border-[var(--admin-border)] pt-5">
                                    <div className="grid grid-cols-2 gap-6 max-[720px]:grid-cols-1">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#ffe8e4] text-[var(--admin-primary)]">
                                                <FaPhoneAlt />
                                            </div>

                                            <div>
                                                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">
                                                    Phone Number
                                                </div>

                                                <strong>
                                                    {jockeyProfile.phone}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#ffe8e4] text-[var(--admin-primary)]">
                                                <FaEnvelope />
                                            </div>

                                            <div>
                                                <div className="text-[0.7rem] font-black uppercase text-[var(--admin-muted)]">
                                                    Email
                                                </div>

                                                <strong>
                                                    {jockeyProfile.email}
                                                </strong>
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

                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">
                                    Weight
                                </p>

                                <strong className="text-[1.8rem]">
                                    {jockeyProfile.weight}
                                </strong>
                            </article>

                            <article className={`${panelClass} p-5 text-center`}>
                                <FaShieldAlt className="mx-auto text-[1.3rem] text-[#12a150]" />

                                <p className="mt-2 text-[0.8rem] text-[var(--admin-muted)]">
                                    Health
                                </p>

                                <strong className="text-[1.8rem] text-[#12a150]">
                                    {jockeyProfile.health}
                                </strong>
                            </article>
                        </div>

                        <article className={`${panelClass} p-6`}>
                            <p className="text-[0.75rem] font-black uppercase tracking-wide text-[var(--admin-muted)]">
                                Experience
                            </p>

                            <strong className="text-[3rem] font-light text-[var(--admin-primary-dark)]">
                                {jockeyProfile.experienceYears} years
                            </strong>
                        </article>
                    </div>
                </section>

                {/* Distance Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">
                        Distance Experience
                    </h2>

                    <div className="mt-7 grid gap-7">
                        {jockeyDistanceExperiences.map((item) => (
                            <div
                                key={item.distance}
                                className="flex items-center justify-between border-b border-[var(--admin-border)] pb-6 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4"
                            >
                                <strong>{item.distance}</strong>

                                <div className="flex flex-wrap gap-2">
                                    {experienceLevels.map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`rounded-full px-4 py-2 text-[0.8rem] font-bold ${item.level === level
                                                ? 'bg-[var(--admin-primary)] text-white'
                                                : 'border border-[var(--admin-border)] text-[var(--admin-ink)]'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Breed Experience */}
                <section className={`${panelClass} p-7`}>
                    <h2 className="text-[1.5rem] font-bold">
                        Breed Experience
                    </h2>

                    <div className="mt-6 grid gap-4">
                        {breedExperiences.map((breed) => (
                            <article
                                key={breed.id}
                                className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[#fff8f6] p-4 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-3"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-[var(--admin-primary)]">
                                        <FaPaw />
                                    </div>

                                    <div>
                                        <strong>{breed.breed}</strong>

                                        <p className="text-[0.85rem] text-[var(--admin-muted)]">
                                            {breed.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-[var(--admin-primary)] px-4 py-1 text-[0.8rem] font-bold text-white">
                                        {breed.level}
                                    </span>

                                    <button
                                        onClick={() =>
                                            removeBreed(breed.id)
                                        }
                                        type="button"
                                        className="text-red-600"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Add Breed */}
                    <div className="mt-6 rounded-lg border border-dashed border-[var(--admin-border)] p-5">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 max-[980px]:grid-cols-1">
                            <select
                                value={selectedBreed}
                                onChange={(e) =>
                                    setSelectedBreed(e.target.value)
                                }
                                className="rounded-md border border-[var(--admin-border)] px-4 py-3"
                            >
                                <option value="">
                                    Choose a breed...
                                </option>

                                {availableBreeds.map((breed) => (
                                    <option
                                        key={breed}
                                        value={breed}
                                    >
                                        {breed}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedLevel}
                                onChange={(e) =>
                                    setSelectedLevel(e.target.value)
                                }
                                className="rounded-md border border-[var(--admin-border)] px-4 py-3"
                            >
                                <option value="">
                                    Choose level...
                                </option>

                                {experienceLevels.map((level) => (
                                    <option
                                        key={level}
                                        value={level}
                                    >
                                        {level}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={addBreed}
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-700 px-5 py-3 font-bold text-blue-700"
                            >
                                <FaPlus />
                                Add Breed
                            </button>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        className="rounded-md border border-[#b89d36] px-8 py-3 font-bold text-[#8b7515]"
                    >
                        Cancel Changes
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md bg-[var(--admin-primary)] px-8 py-3 font-bold text-white"
                    >
                        <FaSave />
                        Save Changes
                    </button>
                </div>
            </section>
        </JockeyLayout>
    );
}

export default JockeySetting;