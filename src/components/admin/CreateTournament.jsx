import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    FaDollarSign,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaTrophy,
    FaUserTie,
} from 'react-icons/fa';

import { apiRequest } from '../../api/httpClient';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-[22px] px-11 py-[34px] max-[760px]:px-5 max-[760px]:py-7';
const wrapClass = 'grid w-[min(960px,100%)] gap-[18px]';
const formClass = 'grid gap-5';
const cardClass = 'grid gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px] max-[760px]:p-[18px]';
const cardTitleClass = 'm-0 flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5 text-[0.9rem] font-black text-[var(--admin-ink)]';
const fieldClass = 'grid gap-[7px]';
const labelClass = 'text-[0.76rem] font-[750] text-[#5b403c]';
const controlBaseClass = 'w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#9b8580] focus:border-[#c6897e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(134,7,7,0.08)]';
const inputClass = `${controlBaseClass} h-10 px-3`;
const selectClass = `${controlBaseClass} h-10 px-3`;
const textareaClass = `${controlBaseClass} min-h-[88px] resize-y px-3 py-3 leading-[1.45]`;
const fileControlClass = `${controlBaseClass} flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2`;
const twoColumnClass = 'grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1';
const iconClass = 'pointer-events-none absolute top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#9b7771]';
const actionButtonClass = 'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md px-[18px] text-[0.78rem] font-[850] no-underline max-[760px]:w-full';
const distanceOptions = [1000, 1500, 2400];

function CreateTournament() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [referees, setReferees] = useState([]);
    const [isLoadingReferees, setIsLoadingReferees] = useState(true);
    const [refereeError, setRefereeError] = useState('');
    const [tournamentImageName, setTournamentImageName] = useState('');
    const [tournamentImagePreview, setTournamentImagePreview] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadReferees = async () => {
            try {
                const data = await apiRequest('/admin/tournaments/referees');

                if (isMounted) {
                    setReferees(Array.isArray(data) ? data : []);
                    setRefereeError('');
                }
            } catch (err) {
                if (isMounted) {
                    setReferees([]);
                    setRefereeError(err.message || 'Failed to load referees.');
                }
            } finally {
                if (isMounted) {
                    setIsLoadingReferees(false);
                }
            }
        };

        loadReferees();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => () => {
        if (tournamentImagePreview) {
            URL.revokeObjectURL(tournamentImagePreview);
        }
    }, [tournamentImagePreview]);

    const handleTournamentImageChange = (event) => {
        const file = event.target.files?.[0];

        if (tournamentImagePreview) {
            URL.revokeObjectURL(tournamentImagePreview);
        }

        setTournamentImageName(file ? file.name : '');
        setTournamentImagePreview(file ? URL.createObjectURL(file) : '');
    };

    const persistTournament = async (form, action) => {
        const formData = new FormData(form);
        setError('');

        // Validation
        const name = formData.get('name')?.trim();
        const raceDateTime = formData.get('raceDate');
        const [raceDate, raceStartTimeValue = ''] = String(raceDateTime || '').split('T');
        const raceStartTime = raceStartTimeValue.slice(0, 5);
        const registrationDeadline = formData.get('registrationDeadline');
        const distanceMeters = Number(formData.get('distanceMeters') || 0);
        const maxHorses = Number(formData.get('maxHorses') || 0);

        if (!name) {
            setError('Tournament name is required.');
            return;
        }
        if (!raceDateTime || !raceDate || !raceStartTime) {
            setError('Race Date is required.');
            return;
        }
        if (!registrationDeadline) {
            setError('Registration Deadline is required.');
            return;
        }
        if (raceDate <= registrationDeadline) {
            setError('Race Date must be after Registration Deadline.');
            return;
        }
        if (!distanceOptions.includes(distanceMeters)) {
            setError('Distance must be 1000, 1500, or 2400 meters.');
            return;
        }
        if (maxHorses <= 0) {
            setError('Max horses must be greater than 0.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = new FormData();
            const tournamentImage = formData.get('tournamentImage');

            payload.append('TournamentName', name);
            payload.append('Description', formData.get('description') || '');
            payload.append('Location', formData.get('location') || '');
            payload.append('RaceDate', raceDate);
            payload.append('RaceStartTime', raceStartTime);
            payload.append('RegistrationDeadline', registrationDeadline);
            payload.append('DistanceMeters', String(distanceMeters));
            payload.append('MaxHorses', String(maxHorses));
            payload.append('PrizePool', String(
                Number(formData.get('goldPrize') || 0)
                + Number(formData.get('silverPrize') || 0)
                + Number(formData.get('bronzePrize') || 0)
            ));
            payload.append('Rules', formData.get('rules') || '');

            if (typeof File !== 'undefined' && tournamentImage instanceof File && tournamentImage.size > 0) {
                payload.append('TournamentImage', tournamentImage);
            }

            const createdTournament = await apiRequest('/admin/tournaments', {
                method: 'POST',
                body: payload,
            });

            const refereeId = formData.get('referee');

            if (refereeId && createdTournament?.tournamentId) {
                await apiRequest(`/admin/tournaments/${createdTournament.tournamentId}/assign-referee`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        RefereeId: Number(refereeId),
                    }),
                });
            }

            // Tournament created with Draft status by default
            if (action === 'publish' && createdTournament?.tournamentId) {
                await apiRequest(`/admin/tournaments/${createdTournament.tournamentId}/approve`, {
                    method: 'PUT',
                });
            }

            navigate('/admin/races');
        } catch (err) {
            setError(err.message || 'Failed to create tournament. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const submitter = event.nativeEvent.submitter;
        const action = submitter ? submitter.value : 'publish';
        persistTournament(event.currentTarget, action);
    };

    return (
        <AdminLayout activeKey="races">
                <section className={pageShellClass}>
                    <div className={wrapClass}>
                        <div>
                            <h1 className="m-0 text-[2rem] leading-[1.1] text-[var(--admin-primary-dark)] max-[760px]:text-[1.6rem]">
                                Create Tournament
                            </h1>
                            <p className="mb-0 mt-1.5 text-[0.9rem] font-[650] text-[var(--admin-muted)]">
                                Configure parameters for a new premier racing event.
                            </p>
                        </div>

                        <form className={formClass} onSubmit={handleSubmit}>
                            <section className={cardClass}>
                                <h2 className={cardTitleClass}>
                                    <FaInfoCircle aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                    <span>SECTION 1: TOURNAMENT INFORMATION</span>
                                </h2>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Tournament Name</span>
                                    <input className={inputClass} name="name" placeholder="e.g. The Prestige Cup 2024" required type="text" />
                                </label>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Location</span>
                                        <div className="relative flex min-h-10 items-center">
                                            <FaMapMarkerAlt aria-hidden="true" className={`${iconClass} left-3`} />
                                            <input className={`${controlBaseClass} h-10 py-0 pl-9 pr-3`} name="location" placeholder="Race Track Name, City" type="text" />
                                        </div>
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Description</span>
                                        <textarea className={textareaClass} name="description" placeholder="Provide a detailed overview of the race history and significance..." rows="4" />
                                    </label>
                                </div>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Race Date</span>
                                        <input className={inputClass} lang="en-US" name="raceDate" type="datetime-local" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Registration Deadline</span>
                                        <input className={inputClass} name="registrationDeadline" type="date" />
                                    </label>
                                </div>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Distance</span>
                                        <select className={selectClass} defaultValue="" name="distanceMeters" required>
                                            <option value="" disabled>Select Distance</option>
                                            {distanceOptions.map((distanceMeters) => (
                                                <option key={distanceMeters} value={distanceMeters}>{distanceMeters}m</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Max Horses</span>
                                        <input className={inputClass} defaultValue="10" name="maxHorses" type="number" />
                                    </label>
                                </div>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Tournament Image</span>
                                    <span className={fileControlClass}>
                                        <span className="inline-flex min-h-7 flex-none items-center rounded-md bg-[var(--admin-primary)] px-3 text-[0.76rem] font-[850] text-white">
                                            Choose File
                                        </span>
                                        <span className="min-w-0 truncate text-[0.86rem] font-semibold text-[#7d6661]">
                                            {tournamentImageName || 'No file chosen'}
                                        </span>
                                    </span>
                                    <input accept="image/*" className="sr-only" name="tournamentImage" onChange={handleTournamentImageChange} type="file" />
                                </label>

                                {tournamentImagePreview && (
                                    <img
                                        alt="Tournament preview"
                                        className="h-44 w-full rounded-md object-cover"
                                        src={tournamentImagePreview}
                                    />
                                )}
                            </section>

                            <section className={cardClass}>
                                <h2 className={cardTitleClass}>
                                    <FaTrophy aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                    <span>SECTION 2: PRIZE &amp; RULES</span>
                                </h2>

                                <div className={`${twoColumnClass} items-start`}>
                                    <div className="grid gap-2">
                                        <span className={labelClass}>Prize Pool ($)</span>

                                        <label className="grid min-h-9 grid-cols-[minmax(110px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                            <span className="pl-3 text-[0.72rem] font-[850] text-[#5b403c]">GOLD PRIZE:</span>
                                            <input aria-label="Gold prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" name="goldPrize" type="number" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>

                                        <label className="grid min-h-9 grid-cols-[minmax(110px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                            <span className="pl-3 text-[0.72rem] font-[850] text-[#5b403c]">SILVER PRIZE:</span>
                                            <input aria-label="Silver prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" name="silverPrize" type="number" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>

                                        <label className="grid min-h-9 grid-cols-[minmax(110px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                            <span className="pl-3 text-[0.72rem] font-[850] text-[#5b403c]">BRONZE PRIZE:</span>
                                            <input aria-label="Bronze prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" name="bronzePrize" type="number" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>
                                    </div>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Point Prediction (pts)</span>
                                        <select className={selectClass} defaultValue="" name="predictionPoints">
                                            <option value="" disabled>Select Point</option>
                                            <option value="10">10 pts</option>
                                            <option value="25">25 pts</option>
                                            <option value="50">50 pts</option>
                                        </select>
                                    </label>
                                </div>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Rules</span>
                                    <textarea className={textareaClass} name="rules" placeholder="Detail all eligibility, track rules, and disciplinary procedures..." rows="6" />
                                </label>
                            </section>

                            <section className={cardClass}>
                                <h2 className={cardTitleClass}>
                                    <FaUserTie aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                    <span>SECTION 3: ASSIGN REFEREE</span>
                                </h2>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Select Referee</span>
                                    <select className={selectClass} defaultValue="" disabled={isLoadingReferees || !!refereeError} name="referee">
                                        <option value="" disabled>
                                            {isLoadingReferees
                                                ? 'Loading referees...'
                                                : refereeError
                                                    ? 'Unable to load referees'
                                                    : 'Select Referee'}
                                        </option>
                                        {referees.map((referee) => (
                                            <option key={referee.refereeId} value={referee.refereeId}>
                                                {referee.fullName}{referee.email ? ` (${referee.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {refereeError && (
                                        <span className="text-[0.76rem] font-[700] text-[var(--admin-primary)]">
                                            {refereeError}
                                        </span>
                                    )}
                                </label>
                            </section>

                            {error && (
                                <div className="rounded-[var(--admin-radius)] border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-[0.85rem] font-semibold text-[var(--admin-primary)]">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-[18px] pt-0.5 max-[760px]:flex-col max-[760px]:items-stretch">
                                <Link className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]`} to="/admin/races">
                                    Cancel
                                </Link>

                                <div className="flex items-center justify-end gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
                                    <button className={`${actionButtonClass} bg-[#fffdfc] border border-[var(--admin-primary)] text-[var(--admin-primary)] hover:bg-[#fff0ed]`} disabled={isSaving} name="submitAction" type="submit" value="draft">
                                        {isSaving ? 'Saving...' : 'Save Draft'}
                                    </button>
                                    <button className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`} disabled={isSaving} name="submitAction" type="submit" value="publish">
                                        {isSaving ? 'Saving...' : 'Publish Tournament'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
        </AdminLayout>
    );
}

export default CreateTournament;
