// Shared constants, pure helpers and validation logic for the Create Tournament form.
// Extracted from the original single-file CreateTournament.jsx so the UI components
// (TournamentBasicInformation, TournamentPrizeRules, etc.) can share one source of truth.
// NOTE: every business rule below is copied verbatim from the previous implementation.
// Do not change thresholds/messages here without checking the backend DTO validation
// in AdminTournamentsController first.

import { parseCurrency } from '../../utils/currency';

export const locationOptions = [
    'Churchill Downs, Louisville, Kentucky',
    'Pimlico Race Course, Baltimore, Maryland',
    'Belmont Park, Elmont, New York',
    'Santa Anita Park, Arcadia, California',
];

export const distanceOptions = [1000, 1500, 2400];
export const maxDate = '2100-12-31';
export const maxPrizePool = 1000000000;
export const maxTournamentImageSize = 5 * 1024 * 1024;
export const allowedTournamentImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const allowedTournamentImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
export const tournamentImageAccept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export function readSeasonField(season, key) {
    const pascalKey = key[0].toUpperCase() + key.slice(1);

    return season?.[key] ?? season?.[pascalKey];
}

export function toDateOnly(value) {
    return value ? String(value).split('T')[0] : '';
}

export function findSeasonForRaceDate(seasons, raceDateValue) {
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

export function formatDateOnly(value) {
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

export function formatDateTimeLocal(value) {
    if (!value) {
        return '';
    }

    const [datePart, timePart = ''] = String(value).split('T');

    if (!datePart || !timePart) {
        return '';
    }

    const [hoursStr, minutesStr = '00'] = timePart.split(':');
    const date = new Date(`${datePart}T00:00:00`);

    return `${new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date)}, ${formatHourMinute(hoursStr, minutesStr)}`;
}

function formatHourMinute(hoursStr, minutesStr) {
    const hours = Number(hoursStr);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${minutesStr} ${period}`;
}

export function isDateYearInRange(dateValue) {
    const year = Number(String(dateValue || '').slice(0, 4));

    return Number.isInteger(year) && year >= 2000 && year <= 2100;
}

export function getTodayDateValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getCurrentDateTimeValue(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${getTodayDateValue(date)}T${hours}:${minutes}`;
}

export function isDateBeforeToday(dateValue) {
    return toDateOnly(dateValue) < getTodayDateValue();
}

export function isDateTimeBeforeNow(dateTimeValue) {
    const normalizedValue = String(dateTimeValue || '').slice(0, 16);

    return normalizedValue < getCurrentDateTimeValue();
}

// Suggests a Registration Deadline of "race day minus 1 day", clamped so it never
// lands before today. Only ever used to pre-fill the field, never to overwrite a
// value the admin already picked by hand.
export function suggestRegistrationDeadline(raceDateTimeValue) {
    const raceDateOnly = toDateOnly(raceDateTimeValue);

    if (!raceDateOnly) {
        return '';
    }

    const [year, month, day] = raceDateOnly.split('-').map(Number);

    if (!year || !month || !day) {
        return '';
    }

    const suggested = new Date(year, month - 1, day);

    suggested.setDate(suggested.getDate() - 1);

    const suggestedValue = getTodayDateValue(suggested);
    const today = getTodayDateValue();

    return suggestedValue < today ? today : suggestedValue;
}

export function validateTournamentImage(file) {
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

export function formatDistance(distanceMeters) {
    const numeric = Number(distanceMeters);

    if (!Number.isFinite(numeric) || numeric <= 0) {
        return '';
    }

    return `${new Intl.NumberFormat('en-US').format(numeric)} m`;
}

export function formatMoney(amount) {
    const numeric = Number(amount) || 0;

    return `$${new Intl.NumberFormat('en-US').format(numeric)}`;
}

/**
 * Validates the full form state and returns a map of fieldKey -> error message.
 * Field keys match the `data-field` ids used on inputs so the caller can focus/scroll
 * to the first invalid field. This mirrors the exact rules from the previous
 * `persistTournament` function - same order, same thresholds, same messages -
 * just collected into a map instead of returning on the first failure.
 */
export function validateTournamentForm(state, { seasons, seasonError, isLoadingSeasons, action }) {
    const errors = {};

    const name = (state.name || '').trim();
    const description = (state.description || '').trim();
    const location = (state.location || '').trim();
    const raceDateTime = state.raceDateValue;
    const [raceDate, raceStartTimeValue = ''] = String(raceDateTime || '').split('T');
    const raceStartTime = raceStartTimeValue.slice(0, 5);
    const registrationDeadline = state.registrationDeadlineValue;
    const distanceMeters = Number(state.distanceMeters || 0);
    const maxHorses = Number(state.maxHorses || 0);
    const goldPrize = parseCurrency(state.goldPrize);
    const silverPrize = parseCurrency(state.silverPrize);
    const bronzePrize = parseCurrency(state.bronzePrize);
    const prizePool = goldPrize + silverPrize + bronzePrize;
    const rules = (state.rules || '').trim();

    if (!name) {
        errors.name = 'Tournament name is required.';
    } else if (name.length < 3 || name.length > 200) {
        errors.name = 'Tournament name must be between 3 and 200 characters.';
    }

    if (description.length > 1000) {
        errors.description = 'Description cannot exceed 1,000 characters.';
    }

    if (location.length < 3 || location.length > 255) {
        errors.location = 'Please select a race track.';
    }

    if (!raceDateTime || !raceDate || !raceStartTime) {
        errors.raceDateValue = 'Race Date is required.';
    } else if (!isDateYearInRange(raceDate) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(raceStartTime)) {
        errors.raceDateValue = 'Race date must be between year 2000 and 2100 and use a valid HH:mm time.';
    } else if (isDateTimeBeforeNow(raceDateTime)) {
        errors.raceDateValue = 'Race Date cannot be in the past.';
    }

    if (!registrationDeadline) {
        errors.registrationDeadlineValue = 'Registration Deadline is required.';
    } else if (!isDateYearInRange(registrationDeadline)) {
        errors.registrationDeadlineValue = 'Registration deadline year must be between 2000 and 2100.';
    } else if (isDateBeforeToday(registrationDeadline)) {
        errors.registrationDeadlineValue = 'Registration Deadline cannot be in the past.';
    } else if (raceDate && raceDate <= registrationDeadline) {
        errors.registrationDeadlineValue = 'Race Date must be after Registration Deadline.';
    }

    if (!distanceOptions.includes(distanceMeters)) {
        errors.distanceMeters = 'Distance must be 1000, 1500, or 2400 meters.';
    }

    let raceSeason = null;

    if (!errors.raceDateValue && raceDate) {
        if (!seasonError && !isLoadingSeasons) {
            raceSeason = findSeasonForRaceDate(seasons, raceDate);

            if (!raceSeason) {
                errors.season = 'No active season matches the selected race date.';
            }
        }
    }

    if (action === 'publish' && raceSeason) {
        const raceSeasonStatus = readSeasonField(raceSeason, 'status');

        if (raceSeasonStatus !== 'Active') {
            errors.season = 'Only tournaments in an Active season can be published. Save as draft or activate the season first.';
        }
    }

    if (!Number.isInteger(maxHorses) || maxHorses < 2 || maxHorses > 20) {
        errors.maxHorses = 'Max horses must be an integer between 2 and 20.';
    }

    if (goldPrize <= 0 || silverPrize <= 0 || bronzePrize <= 0) {
        const prizeMessage = 'Gold, Silver, and Bronze prizes must all be greater than 0.';

        errors.goldPrize = errors.goldPrize || prizeMessage;
        errors.silverPrize = errors.silverPrize || prizeMessage;
        errors.bronzePrize = errors.bronzePrize || prizeMessage;
    }

    if (prizePool > maxPrizePool) {
        errors.goldPrize = errors.goldPrize || 'Prize pool cannot exceed 1,000,000,000.';
    }

    if (!errors.goldPrize && !errors.silverPrize && !errors.bronzePrize
        && !(goldPrize > silverPrize && silverPrize > bronzePrize)) {
        const orderMessage = 'Prize amounts must decrease by rank: Gold prize must be greater than Silver prize, and Silver prize must be greater than Bronze prize.';

        errors.goldPrize = orderMessage;
        errors.silverPrize = orderMessage;
        errors.bronzePrize = orderMessage;
    }

    if (rules.length > 10000) {
        errors.rules = 'Rules cannot exceed 10,000 characters.';
    }

    const imageError = validateTournamentImage(state.tournamentImageFile);

    if (imageError) {
        errors.tournamentImage = imageError;
    }

    return errors;
}
