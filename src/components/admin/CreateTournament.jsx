import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../../api/httpClient';
import { parseCurrency } from '../../utils/currency';
import {
    confirmAdminAction,
    queueAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';

import AdminLayout from './AdminLayout';
import TournamentBasicInformation from './TournamentBasicInformation';
import TournamentPrizeRules from './TournamentPrizeRules';
import TournamentRefereeAssignment from './TournamentRefereeAssignment';
import TournamentFormActions from './TournamentFormActions';
import {
    findSeasonForRaceDate,
    getCurrentDateTimeValue,
    getTodayDateValue,
    suggestRegistrationDeadline,
    validateTournamentForm,
} from './createTournamentHelpers';
import { formClass, pageShellClass, wrapClass } from './createTournamentStyles';

const initialValues = {
    name: '',
    description: '',
    location: '',
    raceDateValue: '',
    registrationDeadlineValue: '',
    distanceMeters: '',
    maxHorses: '10',
    goldPrize: '',
    silverPrize: '',
    bronzePrize: '',
    rules: '',
    referee: '',
    tournamentImageFile: null,
    tournamentImageName: '',
    tournamentImagePreview: '',
};

// Order controls which field we scroll/focus first when validation fails.
const FIELD_PRIORITY_ORDER = [
    'name', 'location', 'raceDateValue', 'registrationDeadlineValue', 'season',
    'distanceMeters', 'maxHorses', 'goldPrize', 'silverPrize', 'bronzePrize',
    'rules', 'tournamentImage', 'description',
];

const FIELD_ID_MAP = {
    name: 'tournament-name',
    description: 'tournament-description',
    location: 'tournament-location',
    raceDateValue: 'tournament-race-date',
    registrationDeadlineValue: 'tournament-deadline',
    season: 'tournament-matched-season',
    distanceMeters: 'tournament-distance',
    maxHorses: 'tournament-max-horses',
    goldPrize: 'tournament-gold-prize',
    silverPrize: 'tournament-silver-prize',
    bronzePrize: 'tournament-bronze-prize',
    rules: 'tournament-rules',
    tournamentImage: 'tournament-image',
};

const ALL_TOUCHED = Object.keys(FIELD_ID_MAP).reduce((acc, key) => ({ ...acc, [key]: true }), {});

function CreateTournament() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});
    const [deadlineTouchedManually, setDeadlineTouchedManually] = useState(false);

    const [referees, setReferees] = useState([]);
    const [isLoadingReferees, setIsLoadingReferees] = useState(true);
    const [refereeError, setRefereeError] = useState('');

    const [seasons, setSeasons] = useState([]);
    const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
    const [seasonError, setSeasonError] = useState('');

    const todayDate = getTodayDateValue();
    const currentDateTime = getCurrentDateTimeValue();
    const matchedSeason = useMemo(
        () => findSeasonForRaceDate(seasons, values.raceDateValue),
        [seasons, values.raceDateValue]
    );

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
        if (values.tournamentImagePreview) {
            URL.revokeObjectURL(values.tournamentImagePreview);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.tournamentImagePreview]);

    // Auto-suggest Registration Deadline = race day - 1, unless the admin already
    // picked a deadline by hand (never override a manual choice).
    useEffect(() => {
        if (deadlineTouchedManually) {
            return;
        }

        const suggested = suggestRegistrationDeadline(values.raceDateValue);

        if (suggested) {
            setValues((prev) => ({ ...prev, registrationDeadlineValue: suggested }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.raceDateValue, deadlineTouchedManually]);

    const handleChange = (field, value) => {
        if (field === 'registrationDeadlineValue') {
            setDeadlineTouchedManually(true);
        }

        if (field === 'tournamentImageFile') {
            setValues((prev) => {
                if (prev.tournamentImagePreview) {
                    URL.revokeObjectURL(prev.tournamentImagePreview);
                }

                return {
                    ...prev,
                    tournamentImageFile: value,
                    tournamentImageName: value ? value.name : '',
                    tournamentImagePreview: value ? URL.createObjectURL(value) : '',
                };
            });
            setIsDirty(true);

            return;
        }

        setValues((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const draftErrors = useMemo(
        () => validateTournamentForm(values, { seasons, seasonError, isLoadingSeasons, action: 'draft' }),
        [values, seasons, seasonError, isLoadingSeasons]
    );
    const publishErrors = useMemo(
        () => validateTournamentForm(values, { seasons, seasonError, isLoadingSeasons, action: 'publish' }),
        [values, seasons, seasonError, isLoadingSeasons]
    );
    const isPublishReady = Object.keys(publishErrors).length === 0;

    const focusFirstError = (errors) => {
        const firstKey = FIELD_PRIORITY_ORDER.find((key) => errors[key]);
        const targetId = FIELD_ID_MAP[firstKey];
        const element = targetId ? document.getElementById(targetId) : null;

        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus?.();

        return errors[firstKey] || Object.values(errors)[0];
    };

    const submitTournament = async (action) => {
        const errors = action === 'publish' ? publishErrors : draftErrors;

        if (Object.keys(errors).length > 0) {
            setTouched(ALL_TOUCHED);
            const firstMessage = focusFirstError(errors);

            showAdminError(firstMessage);

            return;
        }

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

        setIsSaving(true);
        try {
            const goldPrize = parseCurrency(values.goldPrize);
            const silverPrize = parseCurrency(values.silverPrize);
            const bronzePrize = parseCurrency(values.bronzePrize);
            const prizePool = goldPrize + silverPrize + bronzePrize;
            const [raceDate, raceStartTimeValue = ''] = String(values.raceDateValue || '').split('T');
            const raceStartTime = raceStartTimeValue.slice(0, 5);

            const payload = new FormData();

            payload.append('TournamentName', values.name.trim());
            payload.append('Description', values.description.trim());
            payload.append('Location', values.location.trim());
            payload.append('RaceDate', raceDate);
            payload.append('RaceStartTime', raceStartTime);
            payload.append('RegistrationDeadline', values.registrationDeadlineValue);
            payload.append('DistanceMeters', String(values.distanceMeters));
            payload.append('MaxHorses', String(values.maxHorses));
            payload.append('GoldPrize', String(goldPrize));
            payload.append('SilverPrize', String(silverPrize));
            payload.append('BronzePrize', String(bronzePrize));
            payload.append('PrizePool', String(prizePool));
            payload.append('Rules', values.rules.trim());

            if (values.tournamentImageFile) {
                payload.append('TournamentImage', values.tournamentImageFile);
            }

            const createdTournament = await apiRequest('/admin/tournaments', {
                method: 'POST',
                body: payload,
            });

            if (values.referee && createdTournament?.tournamentId) {
                await apiRequest(`/admin/tournaments/${createdTournament.tournamentId}/assign-referee`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        RefereeId: Number(values.referee),
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
            setIsDirty(false);
            navigate('/admin/races');
        } catch (err) {
            showAdminError(err.message || 'Failed to create tournament. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = async () => {
        if (isDirty) {
            const confirmed = await confirmAdminAction({
                title: 'Leave without saving?',
                message: 'You have unsaved changes. Are you sure you want to leave?',
                confirmLabel: 'Leave',
                cancelLabel: 'Stay',
                tone: 'danger',
            });

            if (!confirmed) {
                return;
            }
        }

        navigate('/admin/races');
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

                    <div className={formClass}>
                        <TournamentBasicInformation
                            currentDateTime={currentDateTime}
                            errors={draftErrors}
                            isLoadingSeasons={isLoadingSeasons}
                            matchedSeason={matchedSeason}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            seasonError={seasonError}
                            todayDate={todayDate}
                            touched={touched}
                            values={values}
                        />

                        <TournamentPrizeRules
                            errors={draftErrors}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            touched={touched}
                            values={values}
                        />

                        <TournamentRefereeAssignment
                            isLoadingReferees={isLoadingReferees}
                            onChange={(value) => handleChange('referee', value)}
                            referee={values.referee}
                            refereeError={refereeError}
                            referees={referees}
                        />

                        <TournamentFormActions
                            isPublishReady={isPublishReady}
                            isSaving={isSaving}
                            onCancel={handleCancel}
                            onPublish={() => submitTournament('publish')}
                            onSaveDraft={() => submitTournament('draft')}
                        />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

export default CreateTournament;
