import { useMemo } from 'react';

import { FaUserTie } from 'react-icons/fa';

import TournamentSearchableSelect from './TournamentSearchableSelect';
import { cardClass, cardTitleClass, fieldClass, labelClass } from './createTournamentStyles';

function TournamentRefereeAssignment({
    referee,
    onChange,
    referees,
    isLoadingReferees,
    refereeError,
}) {
    const refereeOptions = useMemo(
        () => referees.map((item) => ({
            value: item.refereeId,
            label: item.fullName,
            sublabel: item.email,
        })),
        [referees]
    );

    const selectedReferee = referees.find((item) => String(item.refereeId) === String(referee));

    return (
        <section className={cardClass}>
            <h2 className={cardTitleClass}>
                <FaUserTie aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                <span>Referee Assignment</span>
            </h2>

            <div className={fieldClass}>
                <label className={labelClass} htmlFor="tournament-referee">Select Referee</label>
                <TournamentSearchableSelect
                    ariaLabel="Referee"
                    disabled={isLoadingReferees || !!refereeError}
                    emptyMessage="No active referees found."
                    errorMessage={refereeError}
                    id="tournament-referee"
                    loading={isLoadingReferees}
                    loadingLabel="Loading referees..."
                    onChange={onChange}
                    options={refereeOptions}
                    placeholder="Search referee by name or email..."
                    value={referee}
                />
                {refereeError && (
                    <span className="text-[0.76rem] font-[700] text-[var(--admin-primary)]" role="alert">{refereeError}</span>
                )}
                <span className="text-[0.72rem] font-semibold text-[#94a3b8]">Optional - can be assigned later from Race Management.</span>
            </div>

            {selectedReferee && (
                <div className="grid gap-1 rounded-md border border-[var(--admin-border)] bg-[#f8fbff] px-3.5 py-3">
                    <span className="text-[0.86rem] font-[850] text-[var(--admin-ink)]">{selectedReferee.fullName}</span>
                    {selectedReferee.email && (
                        <span className="text-[0.78rem] font-semibold text-[var(--admin-muted)]">{selectedReferee.email}</span>
                    )}
                </div>
            )}
        </section>
    );
}

export default TournamentRefereeAssignment;
