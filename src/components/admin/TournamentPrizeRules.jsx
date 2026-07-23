import { useState } from 'react';

import { FaChevronDown, FaDollarSign, FaTrophy } from 'react-icons/fa';

import { formatCurrencyAmount, parseCurrency } from '../../utils/currency';
import { formatMoney } from './createTournamentHelpers';
import {
    cardClass,
    cardTitleButtonClass,
    fieldClass,
    labelClass,
    textareaClass,
    threeColumnClass,
} from './createTournamentStyles';

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <span className="text-[0.76rem] font-[700] text-[#c65a4f]" role="alert">{message}</span>;
}

function PrizeInput({ id, label, value, onChange, onBlur, invalid }) {
    return (
        <label
            className={`grid min-h-9 grid-cols-[minmax(80px,auto)_minmax(0,1fr)_28px] items-center overflow-hidden rounded-md border bg-[#fffdfc] ${invalid ? 'border-[#c65a4f]' : 'border-[var(--admin-border)]'}`}
            htmlFor={id}
        >
            <span className="pl-3 text-[0.7rem] font-[850] text-[#5b403c]">{label}</span>
            <input
                aria-invalid={invalid || undefined}
                aria-label={label}
                className="h-[34px] w-full min-w-0 border-0 bg-transparent px-2 text-[var(--admin-ink)] outline-0 focus:shadow-none"
                id={id}
                inputMode="numeric"
                onBlur={onBlur}
                onChange={onChange}
                type="text"
                value={value}
            />
            <FaDollarSign aria-hidden="true" className="justify-self-center text-[#5b403c]" />
        </label>
    );
}

function TournamentPrizeRules({ values, errors, touched, onChange, onBlur }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const totalPrizePool = parseCurrency(values.goldPrize) + parseCurrency(values.silverPrize) + parseCurrency(values.bronzePrize);
    const prizeError = (touched.goldPrize || touched.silverPrize || touched.bronzePrize)
        ? (errors.goldPrize || errors.silverPrize || errors.bronzePrize)
        : '';
    const rulesError = touched.rules ? errors.rules : '';

    const handlePrizeChange = (field) => (event) => {
        onChange(field, formatCurrencyAmount(event.target.value));
    };

    const handlePrizeBlur = (field) => () => {
        onBlur('goldPrize');
        onBlur('silverPrize');
        onBlur('bronzePrize');
        void field;
    };

    const handleRulesInput = (event) => {
        onChange('rules', event.target.value);
        event.target.style.height = 'auto';
        event.target.style.height = `${event.target.scrollHeight}px`;
    };

    return (
        <section className={cardClass}>
            <button
                aria-expanded={isExpanded}
                className={cardTitleButtonClass}
                onClick={() => setIsExpanded((prev) => !prev)}
                type="button"
            >
                <span className="flex items-center gap-2">
                    <FaTrophy aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                    <span>Prize &amp; Rules</span>
                </span>
                <FaChevronDown aria-hidden="true" className={`h-3.5 w-3.5 text-[#9b7771] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
                <>
                    <div className="grid gap-2">
                        <span className={labelClass}>Prize Pool ($)<span aria-hidden="true" className="text-[#c65a4f]"> *</span></span>

                        <div className={threeColumnClass}>
                            <PrizeInput
                                id="tournament-gold-prize"
                                invalid={!!prizeError}
                                label="GOLD"
                                onBlur={handlePrizeBlur('goldPrize')}
                                onChange={handlePrizeChange('goldPrize')}
                                value={values.goldPrize}
                            />
                            <PrizeInput
                                id="tournament-silver-prize"
                                invalid={!!prizeError}
                                label="SILVER"
                                onBlur={handlePrizeBlur('silverPrize')}
                                onChange={handlePrizeChange('silverPrize')}
                                value={values.silverPrize}
                            />
                            <PrizeInput
                                id="tournament-bronze-prize"
                                invalid={!!prizeError}
                                label="BRONZE"
                                onBlur={handlePrizeBlur('bronzePrize')}
                                onChange={handlePrizeChange('bronzePrize')}
                                value={values.bronzePrize}
                            />
                        </div>

                        <FieldError message={prizeError} />

                        <p className="m-0 text-[0.86rem] font-[850] text-[var(--admin-ink)]">
                            Total Prize Pool: <span className="text-[var(--admin-primary)]">{formatMoney(totalPrizePool)}</span>
                        </p>
                    </div>

                    <div className={fieldClass}>
                        <div className="flex items-baseline justify-between gap-2">
                            <label className={labelClass} htmlFor="tournament-rules">Rules</label>
                            <span className="text-[0.7rem] font-semibold text-[#94a3b8]">{(values.rules || '').length}/10000</span>
                        </div>
                        <textarea
                            className={`${textareaClass} ${rulesError ? 'border-[#c65a4f]' : ''}`}
                            id="tournament-rules"
                            maxLength={10000}
                            onBlur={() => onBlur('rules')}
                            onInput={handleRulesInput}
                            placeholder="Enter eligibility, race and disciplinary rules."
                            rows="3"
                            value={values.rules}
                        />
                        <FieldError message={rulesError} />
                    </div>
                </>
            )}
        </section>
    );
}

export default TournamentPrizeRules;
