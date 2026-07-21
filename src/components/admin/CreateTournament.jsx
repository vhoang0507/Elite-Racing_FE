import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    FaCalendarAlt,
    FaDollarSign,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaTrophy,
    FaUserTie,
} from 'react-icons/fa';

import { apiRequest } from '../../api/httpClient';
import {
    handleCurrencyInputChange,
    parseCurrency,
} from '../../utils/currency';
import {
    confirmAdminAction,
    queueAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';

const pageShellClass = 'grid min-h-[calc(100vh-64px)] w-full max-w-full content-start gap-[22px] overflow-x-hidden px-11 py-[34px] max-[760px]:px-5 max-[760px]:py-7';
const wrapClass = 'grid w-full max-w-[960px] min-w-0 mx-auto gap-[18px]';
const formClass = 'grid min-w-0 gap-5';
const cardClass = 'grid w-full min-w-0 max-w-full gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-[22px] max-[760px]:p-[18px]';
const cardTitleClass = 'm-0 flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5 text-[0.9rem] font-black text-[var(--admin-ink)]';
const fieldClass = 'grid min-w-0 gap-[7px]';
const labelClass = 'text-[0.76rem] font-[750] text-[#5b403c]';
const controlBaseClass = 'w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#94a3b8] focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
const inputClass = `${controlBaseClass} h-10 px-3`;
const selectClass = `${controlBaseClass} h-10 px-3`;
const textareaClass = `${controlBaseClass} min-h-[88px] resize-y px-3 py-3 leading-[1.45]`;
const fileControlClass = `${controlBaseClass} flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2`;
const twoColumnClass = 'grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3.5 max-[760px]:grid-cols-1';
const iconClass = 'pointer-events-none absolute top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#9b7771]';
const actionButtonClass = 'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-full px-[18px] text-[0.78rem] font-[850] no-underline transition-colors max-[760px]:w-full';
const locationOptions = [
    'Churchill Downs, Louisville, Kentucky',
    'Pimlico Race Course, Baltimore, Maryland',
    'Belmont Park, Elmont, New York',
    'Santa Anita Park, Arcadia, California',
];
const distanceOptions = [1000, 1500, 2400];
const maxDate = '2100-12-31';
const maxPrizePool = 1000000000;
const maxTournamentImageSize = 5 * 1024 * 1024;
const allowedTournamentImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedTournamentImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const tournamentImageAccept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

function readSeasonField(season, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return season?.[key] ?? season?.[pascalKey];
}

function toDateOnly(value) {
    return value ? String(value).split('T')[0] : '';
}

function findSeasonForRaceDate(seasons, raceDateValue) {
    const raceDate = toDateOnly(raceDateValue);

    if (!raceDate) {
        return null;
    }

    return seasons.find((season) => {
        const startDate = toDateOnly(readSeasonField(season, 'startDate'));
        const endDate = toDateOnly(readSeasonField(season, 'endDate'));

        return startDate && endDate && raceDate >= startDate && raceDate <= endDate;
    }) || null;
}

function formatDateOnly(value) {
    const date = toDateOnly(value);

    if (!date) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
}

function isDateYearInRange(dateValue) {
    const year = Number(String(dateValue || '').slice(0, 4));

    return Number.isInteger(year) && year >= 2000 && year <= 2100;
}

function getTodayDateValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCurrentDateTimeValue(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${getTodayDateValue(date)}T${hours}:${minutes}`;
}

function isDateBeforeToday(dateValue) {
    return toDateOnly(dateValue) < getTodayDateValue();
}

function isDateTimeBeforeNow(dateTimeValue) {
    const normalizedValue = String(dateTimeValue || '').slice(0, 16);

    return normalizedValue < getCurrentDateTimeValue();
}

function validateTournamentImage(file) {
    if (!(typeof File !== 'undefined' && file instanceof File) || file.size === 0) {
        return null;
    }

    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = allowedTournamentImageExtensions.some((extension) => lowerName.endsWith(extension));

    if (!hasAllowedExtension || !allowedTournamentImageTypes.includes(file.type)) {
        return 'Tournament image must be a JPG, JPEG, PNG, or WEBP file.';
    }

    if (file.size > maxTournamentImageSize) {
        return 'Tournament image must be 5MB or smaller.';
    }

    return null;
}

function CreateTournament() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [referees, setReferees] = useState([]);
    const [isLoadingReferees, setIsLoadingReferees] = useState(true);
    const [refereeError, setRefereeError] = useState('');
    const [tournamentImageName, setTournamentImageName] = useState('');
    const [tournamentImagePreview, setTournamentImagePreview] = useState('');
    const [raceDateValue, setRaceDateValue] = useState('');
    const [seasons, setSeasons] = useState([]);
    const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
    const [seasonError, setSeasonError] = useState('');

    const matchedSeason = findSeasonForRaceDate(seasons, raceDateValue);
    const matchedSeasonStatus = readSeasonField(matchedSeason, 'status');
    const todayDate = getTodayDateValue();
    const currentDateTime = getCurrentDateTimeValue();

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

    useEffect(() => {
        let isMounted = true;

        const loadSeasons = async () => {
            try {
                const data = await apiRequest('/admin/seasons');

                if (isMounted) {
                    setSeasons(Array.isArray(data) ? data : []);
                    setSeasonError('');
                }
            } catch (err) {
                if (isMounted) {
                    setSeasons([]);
                    setSeasonError(err.message || 'Failed to load seasons.');
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSeasons(false);
                }
            }
        };

        loadSeasons();

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

        // Validation
        const name = formData.get('name')?.trim();
        const raceDateTime = formData.get('raceDate');
        const [raceDate, raceStartTimeValue = ''] = String(raceDateTime || '').split('T');
        const raceStartTime = raceStartTimeValue.slice(0, 5);
        const registrationDeadline = formData.get('registrationDeadline');
        const distanceMeters = Number(formData.get('distanceMeters') || 0);
        const maxHorses = Number(formData.get('maxHorses') || 0);
        const goldPrize = parseCurrency(formData.get('goldPrize'));
        const silverPrize = parseCurrency(formData.get('silverPrize'));
        const bronzePrize = parseCurrency(formData.get('bronzePrize'));
        const prizePool = goldPrize + silverPrize + bronzePrize;
        const description = String(formData.get('description') || '').trim();
        const location = String(formData.get('location') || '').trim();
        const rules = String(formData.get('rules') || '').trim();
        const tournamentImage = formData.get('tournamentImage');

        if (!name) {
            showAdminError('Tournament name is required.');
            return;
        }
        if (name.length < 3 || name.length > 200) {
            showAdminError('Tournament name must be between 3 and 200 characters.');
            return;
        }
        if (description.length > 1000) {
            showAdminError('Description cannot exceed 1,000 characters.');
            return;
        }
        if (location.length < 3 || location.length > 255) {
            showAdminError('Location must be between 3 and 255 characters.');
            return;
        }
        if (!raceDateTime || !raceDate || !raceStartTime) {
            showAdminError('Race Date is required.');
            return;
        }
        if (!isDateYearInRange(raceDate) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raceStartTime)) {
            showAdminError('Race date must be between year 2000 and 2100 and use a valid HH:mm time.');
            return;
        }
        if (isDateTimeBeforeNow(raceDateTime)) {
            showAdminError('Race Date cannot be in the past.');
            return;
        }
        if (!registrationDeadline) {
            showAdminError('Registration Deadline is required.');
            return;
        }
        if (!isDateYearInRange(registrationDeadline)) {
            showAdminError('Registration deadline year must be between 2000 and 2100.');
            return;
        }
        if (isDateBeforeToday(registrationDeadline)) {
            showAdminError('Registration Deadline cannot be in the past.');
            return;
        }
        if (raceDate <= registrationDeadline) {
            showAdminError('Race Date must be after Registration Deadline.');
            return;
        }
        if (!distanceOptions.includes(distanceMeters)) {
            showAdminError('Distance must be 1000, 1500, or 2400 meters.');
            return;
        }
        if (!seasonError && !isLoadingSeasons && !findSeasonForRaceDate(seasons, raceDate)) {
            showAdminError('Race Date must belong to a configured season.');
            return;
        }
        if (action === 'publish') {
            const raceSeason = findSeasonForRaceDate(seasons, raceDate);
            const raceSeasonStatus = readSeasonField(raceSeason, 'status');

            if (raceSeason && raceSeasonStatus !== 'Active') {
                showAdminError('Only tournaments in an Active season can be published. Save as draft or activate the season first.');
                return;
            }
        }
        if (!Number.isInteger(maxHorses) || maxHorses < 2 || maxHorses > 20) {
            showAdminError('Max horses must be an integer between 2 and 20.');
            return;
        }
        if (goldPrize <= 0 || silverPrize <= 0 || bronzePrize <= 0) {
            showAdminError('Gold, Silver, and Bronze prizes must all be greater than 0.');
            return;
        }
        if (prizePool > maxPrizePool) {
            showAdminError('Prize pool cannot exceed 1,000,000,000.');
            return;
        }
        if (!(goldPrize > silverPrize && silverPrize > bronzePrize)) {
            showAdminError('Prize amounts must decrease by rank: Gold prize must be greater than Silver prize, and Silver prize must be greater than Bronze prize.');
            return;
        }
        if (rules.length > 10000) {
            showAdminError('Rules cannot exceed 10,000 characters.');
            return;
        }

        const imageError = validateTournamentImage(tournamentImage);

        if (imageError) {
            showAdminError(imageError);
            return;
        }

        setIsSaving(true);
        try {
            const payload = new FormData();

            payload.append('TournamentName', name);
            payload.append('Description', description);
            payload.append('Location', location);
            payload.append('RaceDate', raceDate);
            payload.append('RaceStartTime', raceStartTime);
            payload.append('RegistrationDeadline', registrationDeadline);
            payload.append('DistanceMeters', String(distanceMeters));
            payload.append('MaxHorses', String(maxHorses));
            payload.append('GoldPrize', String(goldPrize));
            payload.append('SilverPrize', String(silverPrize));
            payload.append('BronzePrize', String(bronzePrize));
            payload.append('PrizePool', String(prizePool));
            payload.append('Rules', rules);

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

            queueAdminSuccess(
                action === 'publish' ? 'Tournament published successfully.' : 'Tournament draft saved successfully.',
                action === 'publish' ? 'Published' : 'Saved'
            );
            navigate('/admin/races');
        } catch (err) {
            showAdminError(err.message || 'Failed to create tournament. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const submitter = event.nativeEvent.submitter;
        const action = submitter ? submitter.value : 'publish';
        const confirmed = await confirmAdminAction({
            title: action === 'publish' ? 'Publish tournament' : 'Save tournament draft',
            message: action === 'publish'
                ? 'Are you sure you want to publish this tournament?'
                : 'Are you sure you want to save this tournament as a draft?',
            confirmLabel: action === 'publish' ? 'Publish' : 'Save Draft',
        });

        if (!confirmed) {
            return;
        }

        persistTournament(form, action);
    };

    return (
        <AdminLayout activeKey="races">
                <section className={pageShellClass}>
                    <div className={wrapClass}>
                        <div>
                            <h1 className="page-title">
                                Create Tournament
                            </h1>
                            <p className="page-subtitle">
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
                                    <input className={inputClass} maxLength={200} minLength={3} name="name" placeholder="e.g. The Prestige Cup 2024" required type="text" />
                                </label>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Location</span>
                                        <div className="relative flex min-h-10 items-center">
                                            <FaMapMarkerAlt aria-hidden="true" className={`${iconClass} left-3`} />
                                            <select className={`${controlBaseClass} h-10 py-0 pl-9 pr-3`} defaultValue="" name="location" required>
                                                <option value="" disabled>Select Race Track</option>
                                                {locationOptions.map((location) => (
                                                    <option key={location} value={location}>{location}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Description</span>
                                        <textarea className={textareaClass} maxLength={1000} name="description" placeholder="Provide a detailed overview of the race history and significance..." rows="4" />
                                    </label>
                                </div>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Race Date</span>
                                        <input className={inputClass} lang="en-US" max={`${maxDate}T23:59`} min={currentDateTime} name="raceDate" onChange={(event) => setRaceDateValue(event.target.value)} type="datetime-local" value={raceDateValue} />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Registration Deadline</span>
                                        <input className={inputClass} max={maxDate} min={todayDate} name="registrationDeadline" type="date" />
                                    </label>
                                </div>

                                <div className="rounded-md border border-[var(--admin-border)] bg-[#f8fbff] px-4 py-3">
                                    <div className="mb-2 flex items-center gap-2 text-[0.76rem] font-[850] uppercase text-[#5b403c]">
                                        <FaCalendarAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                                        <span>Matched Season</span>
                                    </div>
                                    {isLoadingSeasons ? (
                                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-muted)]">Loading seasons...</p>
                                    ) : seasonError ? (
                                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-primary)]">{seasonError}</p>
                                    ) : !raceDateValue ? (
                                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-muted)]">Select a race date to match a season.</p>
                                    ) : matchedSeason ? (
                                        <div className="flex flex-wrap items-center gap-2 text-[0.82rem] font-bold text-[var(--admin-ink)]">
                                            <span>{readSeasonField(matchedSeason, 'seasonName')}</span>
                                            <span className="rounded-full bg-[#e8f7ef] px-2.5 py-1 text-[0.68rem] font-black text-[var(--admin-primary)]">{matchedSeasonStatus}</span>
                                            <span className="text-[var(--admin-muted)]">
                                                {formatDateOnly(readSeasonField(matchedSeason, 'startDate'))} - {formatDateOnly(readSeasonField(matchedSeason, 'endDate'))}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-primary)]">No season covers this race date.</p>
                                    )}
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
                                        <input className={inputClass} defaultValue="10" max="20" min="2" name="maxHorses" required step="1" type="number" />
                                    </label>
                                </div>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Tournament Image</span>
                                    <span className={fileControlClass}>
                                        <span className="inline-flex min-h-7 flex-none items-center rounded-full bg-[var(--admin-primary)] px-3 text-[0.76rem] font-[850] text-white">
                                            Choose File
                                        </span>
                                        <span className="min-w-0 truncate text-[0.86rem] font-semibold text-[#7d6661]">
                                            {tournamentImageName || 'No file chosen'}
                                        </span>
                                    </span>
                                    <input accept={tournamentImageAccept} className="sr-only" name="tournamentImage" onChange={handleTournamentImageChange} type="file" />
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
                                            <input aria-label="Gold prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" inputMode="numeric" name="goldPrize" onChange={handleCurrencyInputChange} type="text" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>

                                        <label className="grid min-h-9 grid-cols-[minmax(110px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                            <span className="pl-3 text-[0.72rem] font-[850] text-[#5b403c]">SILVER PRIZE:</span>
                                            <input aria-label="Silver prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" inputMode="numeric" name="silverPrize" onChange={handleCurrencyInputChange} type="text" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>

                                        <label className="grid min-h-9 grid-cols-[minmax(110px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border border-[var(--admin-border)] bg-[#fffdfc]">
                                            <span className="pl-3 text-[0.72rem] font-[850] text-[#5b403c]">BRONZE PRIZE:</span>
                                            <input aria-label="Bronze prize" className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none" inputMode="numeric" name="bronzePrize" onChange={handleCurrencyInputChange} type="text" />
                                            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
                                        </label>
                                    </div>

                                    
                                </div>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Rules</span>
                                    <textarea className={textareaClass} maxLength={10000} name="rules" placeholder="Detail all eligibility, track rules, and disciplinary procedures..." rows="6" />
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

                            <div className="flex items-center justify-between gap-[18px] pt-0.5 max-[760px]:flex-col max-[760px]:items-stretch">
                                <Link className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#e8f7ef]`} to="/admin/races">
                                    Cancel
                                </Link>

                                <div className="flex items-center justify-end gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
                                    <button className={`${actionButtonClass} bg-[#fffdfc] border border-[var(--admin-primary)] text-[var(--admin-primary)] hover:bg-[#e8f7ef]`} disabled={isSaving} name="submitAction" type="submit" value="draft">
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
