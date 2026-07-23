import {
    FaCalendarAlt,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaMinus,
    FaPlus,
} from 'react-icons/fa';

import {
    distanceOptions,
    formatDateOnly,
    formatDateTimeLocal,
    formatDistance,
    locationOptions,
    readSeasonField,
} from './createTournamentHelpers';
import TournamentImageUpload from './TournamentImageUpload';
import TournamentSearchableSelect from './TournamentSearchableSelect';
import {
    cardClass,
    cardTitleClass,
    fieldClass,
    inputClass,
    labelClass,
    textareaClass,
    twoColumnClass,
} from './createTournamentStyles';

const raceTrackOptions = locationOptions.map((location) => ({ value: location, label: location }));

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <span className="text-[0.76rem] font-[700] text-[#c65a4f]" role="alert">{message}</span>;
}

function RequiredMark() {
    return <span aria-hidden="true" className="text-[#c65a4f]"> *</span>;
}

function TournamentBasicInformation({
    values,
    errors,
    touched,
    onChange,
    onBlur,
    todayDate,
    currentDateTime,
    isLoadingSeasons,
    seasonError,
    matchedSeason,
}) {
    const matchedSeasonStatus = readSeasonField(matchedSeason, 'status');
    const nameError = touched.name ? errors.name : '';
    const locationError = touched.location ? errors.location : '';
    const raceDateError = touched.raceDateValue ? errors.raceDateValue : '';
    const deadlineError = touched.registrationDeadlineValue ? errors.registrationDeadlineValue : '';
    const seasonBlockError = touched.raceDateValue ? errors.season : '';
    const distanceError = touched.distanceMeters ? errors.distanceMeters : '';
    const maxHorsesError = touched.maxHorses ? errors.maxHorses : '';
    const imageError = touched.tournamentImage ? errors.tournamentImage : '';

    const adjustMaxHorses = (delta) => {
        const current = Number(values.maxHorses) || 0;
        const next = Math.min(20, Math.max(2, current + delta));

        onChange('maxHorses', String(next));
        onBlur('maxHorses');
    };

    return (
        <section className={cardClass}>
            <h2 className={cardTitleClass}>
                <FaInfoCircle aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                <span>Tournament Information</span>
            </h2>

            <div className={fieldClass}>
                <div className="flex items-baseline justify-between gap-2">
                    <label className={labelClass} htmlFor="tournament-name">
                        Tournament Name<RequiredMark />
                    </label>
                    <span className="text-[0.7rem] font-semibold text-[#94a3b8]">{(values.name || '').length}/200</span>
                </div>
                <input
                    aria-invalid={!!nameError || undefined}
                    className={`${inputClass} ${nameError ? 'border-[#c65a4f]' : ''}`}
                    id="tournament-name"
                    maxLength={200}
                    onBlur={() => onBlur('name')}
                    onChange={(event) => onChange('name', event.target.value)}
                    placeholder="Enter tournament name"
                    type="text"
                    value={values.name}
                />
                <FieldError message={nameError} />
            </div>

            <div className={twoColumnClass}>
                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-location">
                        Race Track<RequiredMark />
                    </label>
                    <TournamentSearchableSelect
                        ariaLabel="Race track"
                        describedBy={locationError ? 'tournament-location-error' : undefined}
                        icon={FaMapMarkerAlt}
                        id="tournament-location"
                        invalid={!!locationError}
                        onChange={(value) => {
                            onChange('location', value);
                            onBlur('location');
                        }}
                        options={raceTrackOptions}
                        placeholder="Search race track..."
                        value={values.location}
                    />
                    {locationError && <span className="text-[0.76rem] font-[700] text-[#c65a4f]" id="tournament-location-error" role="alert">{locationError}</span>}
                </div>

                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-distance">
                        Distance<RequiredMark />
                    </label>
                    <select
                        aria-invalid={!!distanceError || undefined}
                        className={`${inputClass} ${distanceError ? 'border-[#c65a4f]' : ''}`}
                        id="tournament-distance"
                        onBlur={() => onBlur('distanceMeters')}
                        onChange={(event) => onChange('distanceMeters', event.target.value)}
                        value={values.distanceMeters}
                    >
                        <option disabled value="">Select Distance</option>
                        {distanceOptions.map((distanceMeters) => (
                            <option key={distanceMeters} value={distanceMeters}>{formatDistance(distanceMeters)}</option>
                        ))}
                    </select>
                    <FieldError message={distanceError} />
                </div>
            </div>

            <div className={twoColumnClass}>
                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-race-date">
                        Race Date<RequiredMark />
                    </label>
                    <input
                        aria-invalid={!!raceDateError || undefined}
                        className={`${inputClass} ${raceDateError ? 'border-[#c65a4f]' : ''}`}
                        id="tournament-race-date"
                        lang="en-US"
                        max="2100-12-31T23:59"
                        min={currentDateTime}
                        onBlur={() => onBlur('raceDateValue')}
                        onChange={(event) => onChange('raceDateValue', event.target.value)}
                        type="datetime-local"
                        value={values.raceDateValue}
                    />
                    {values.raceDateValue && !raceDateError && (
                        <span className="text-[0.76rem] font-semibold text-[var(--admin-muted)]">{formatDateTimeLocal(values.raceDateValue)}</span>
                    )}
                    <FieldError message={raceDateError} />
                </div>

                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-deadline">
                        Registration Deadline<RequiredMark />
                    </label>
                    <input
                        aria-invalid={!!deadlineError || undefined}
                        className={`${inputClass} ${deadlineError ? 'border-[#c65a4f]' : ''}`}
                        id="tournament-deadline"
                        max="2100-12-31"
                        min={todayDate}
                        onBlur={() => onBlur('registrationDeadlineValue')}
                        onChange={(event) => onChange('registrationDeadlineValue', event.target.value)}
                        type="date"
                        value={values.registrationDeadlineValue}
                    />
                    {values.registrationDeadlineValue && !deadlineError && (
                        <span className="text-[0.76rem] font-semibold text-[var(--admin-muted)]">{formatDateOnly(values.registrationDeadlineValue)}</span>
                    )}
                    <FieldError message={deadlineError} />
                </div>
            </div>

            <div className={twoColumnClass}>
                <div className={`rounded-md border px-3.5 py-2.5 ${seasonBlockError ? 'border-[#e3bcb7] bg-[#fdf3f2]' : 'border-[var(--admin-border)] bg-[#f8fbff]'}`} id="tournament-matched-season" tabIndex={-1}>
                    <div className="mb-1.5 flex items-center gap-2 text-[0.72rem] font-[850] uppercase text-[#5b403c]">
                        <FaCalendarAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                        <span>Matched Season</span>
                    </div>
                    {isLoadingSeasons ? (
                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-muted)]">Loading seasons...</p>
                    ) : seasonError ? (
                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-primary)]">{seasonError}</p>
                    ) : !values.raceDateValue ? (
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
                        <p className="m-0 text-[0.82rem] font-semibold text-[var(--admin-primary)]">No active season matches the selected race date.</p>
                    )}
                </div>

                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-max-horses">
                        Max Horses<RequiredMark />
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            aria-label="Decrease max horses"
                            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[#5b403c] hover:bg-[#f8fbf9] disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={Number(values.maxHorses) <= 2}
                            onClick={() => adjustMaxHorses(-1)}
                            type="button"
                        >
                            <FaMinus aria-hidden="true" className="h-3 w-3" />
                        </button>
                        <input
                            aria-invalid={!!maxHorsesError || undefined}
                            className={`${inputClass} text-center ${maxHorsesError ? 'border-[#c65a4f]' : ''}`}
                            id="tournament-max-horses"
                            max="20"
                            min="2"
                            onBlur={() => onBlur('maxHorses')}
                            onChange={(event) => onChange('maxHorses', event.target.value)}
                            step="1"
                            type="number"
                            value={values.maxHorses}
                        />
                        <button
                            aria-label="Increase max horses"
                            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] text-[#5b403c] hover:bg-[#f8fbf9] disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={Number(values.maxHorses) >= 20}
                            onClick={() => adjustMaxHorses(1)}
                            type="button"
                        >
                            <FaPlus aria-hidden="true" className="h-3 w-3" />
                        </button>
                    </div>
                    <span className="text-[0.72rem] font-semibold text-[#94a3b8]">Allowed range: 2-20 horses.</span>
                    <FieldError message={maxHorsesError} />
                </div>
            </div>

            <div className={twoColumnClass}>
                <div className={fieldClass}>
                    <div className="flex items-baseline justify-between gap-2">
                        <label className={labelClass} htmlFor="tournament-description">Description</label>
                        <span className="text-[0.7rem] font-semibold text-[#94a3b8]">{(values.description || '').length}/1000</span>
                    </div>
                    <textarea
                        className={textareaClass}
                        id="tournament-description"
                        maxLength={1000}
                        onChange={(event) => onChange('description', event.target.value)}
                        placeholder="Provide a detailed overview of the race history and significance..."
                        rows="3"
                        value={values.description}
                    />
                </div>

                <div className={fieldClass}>
                    <label className={labelClass} htmlFor="tournament-image">Tournament Image</label>
                    <TournamentImageUpload
                        errorMessage={imageError}
                        fileName={values.tournamentImageName}
                        id="tournament-image"
                        onFileRemoved={() => onChange('tournamentImageFile', null)}
                        onFileSelected={(file) => {
                            onChange('tournamentImageFile', file);
                            onBlur('tournamentImage');
                        }}
                        previewUrl={values.tournamentImagePreview}
                    />
                </div>
            </div>
        </section>
    );
}

export default TournamentBasicInformation;
