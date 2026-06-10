import {
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import {
    FaCalendarAlt,
    FaDollarSign,
    FaGavel,
    FaHorseHead,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaTrophy,
    FaUserTie,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';

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
const twoColumnClass = 'grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1';
const fourColumnClass = 'grid grid-cols-4 gap-3.5 max-[1080px]:grid-cols-2 max-[760px]:grid-cols-1';
const iconClass = 'pointer-events-none absolute top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#9b7771]';
const actionButtonClass = 'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md px-[18px] text-[0.78rem] font-[850] no-underline max-[760px]:w-full';

function CreateTournament() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const persistTournament = async (form, shouldPublish = false) => {
        const formData = new FormData(form);
        setError('');

        // Validation
        const name = formData.get('name')?.trim();
        const startDate = formData.get('startDate');
        const endDate = formData.get('endDate');
        const maxHorses = Number(formData.get('maxHorses') || 0);

        if (!name) {
            setError('Tournament name is required.');
            return;
        }
        if (!startDate) {
            setError('Start date is required.');
            return;
        }
        if (!endDate) {
            setError('End date (Final Registration Date) is required.');
            return;
        }
        if (startDate >= endDate) {
            setError('Start date must be before end date.');
            return;
        }
        if (maxHorses <= 0) {
            setError('Max horses must be greater than 0.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await adminApi.createTournament({
                name: name,
                className: formData.get('breed'),
                location: formData.get('location'),
                city: formData.get('location'),
                startDate: startDate,
                endDate: endDate,
                maxHorses: formData.get('maxHorses'),
                goldPrize: formData.get('goldPrize'),
                silverPrize: formData.get('silverPrize'),
                bronzePrize: formData.get('bronzePrize'),
                minWeight: formData.get('minWeight'),
                maxWeight: formData.get('maxWeight'),
                minAge: formData.get('minAge'),
                maxAge: formData.get('maxAge'),
                rules: formData.get('rules'),
            });

            // If publishing, approve the tournament to move from Draft → OpenRegistration
            if (shouldPublish && response?.id) {
                await adminApi.updateTournamentStatus(response.id, 'OpenRegistration');
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
        persistTournament(event.currentTarget, true);
    };

    const handleSaveDraft = (event) => {
        persistTournament(event.currentTarget.form, false);
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
                                        <input className={inputClass} name="startDate" type="date" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Registration Deadline</span>
                                        <input className={inputClass} name="endDate" type="date" />
                                    </label>
                                </div>

                                <div className={twoColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Distance</span>
                                        <input className={inputClass} name="distance" type="text" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Max Horses</span>
                                        <input className={inputClass} defaultValue="20" name="maxHorses" type="number" />
                                    </label>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <h2 className={cardTitleClass}>
                                    <FaHorseHead aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                    <span>SECTION 2: HORSE CONDITIONS</span>
                                </h2>

                                <label className={`${fieldClass} w-[min(310px,100%)] max-[760px]:w-full`}>
                                    <span className={labelClass}>Horse Breed</span>
                                    <input className={inputClass} name="breed" type="text" />
                                </label>

                                <div className={fourColumnClass}>
                                    <label className={fieldClass}>
                                        <span className={labelClass}>Max Weight (kg)</span>
                                        <input className={inputClass} defaultValue="650" name="maxWeight" type="number" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Min Weight (kg)</span>
                                        <input className={inputClass} defaultValue="450" name="minWeight" type="number" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Max Horse Age (yrs)</span>
                                        <input className={inputClass} defaultValue="8" name="maxAge" type="number" />
                                    </label>

                                    <label className={fieldClass}>
                                        <span className={labelClass}>Min Horse Age (yrs)</span>
                                        <input className={inputClass} defaultValue="3" name="minAge" type="number" />
                                    </label>
                                </div>
                            </section>

                            <section className={cardClass}>
                                <h2 className={cardTitleClass}>
                                    <FaTrophy aria-hidden="true" className="flex-none text-[var(--admin-primary)]" />
                                    <span>SECTION 3: PRIZE &amp; RULES</span>
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
                                    <span>SECTION 4: ASSIGN REFEREE</span>
                                </h2>

                                <label className={fieldClass}>
                                    <span className={labelClass}>Select Referee</span>
                                    <select className={selectClass} defaultValue="" name="referee">
                                        <option value="" disabled></option>
                                        <option value="marcus-crawford">Marcus Crawford</option>
                                        <option value="sarah-jenkins">Sarah Jenkins</option>
                                        <option value="minh-tran">Minh Tran</option>
                                    </select>
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
                                    <button className={`${actionButtonClass} border border-[var(--admin-border)] bg-[#fffdfc] text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]`} disabled={isSaving} onClick={handleSaveDraft} type="button">
                                        <FaGavel aria-hidden="true" />
                                        <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                                    </button>
                                    <button className={`${actionButtonClass} bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)]`} disabled={isSaving} type="submit">
                                        {isSaving ? 'Saving...' : 'Publish Tournament'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <footer className="mt-11 flex items-center justify-between gap-6 text-[var(--admin-primary-dark)] max-[760px]:mt-6 max-[760px]:flex-col max-[760px]:items-stretch">
                            <strong className="text-[0.95rem] font-black">Elite Racing League</strong>
                            <nav aria-label="Footer links" className="flex flex-wrap justify-end gap-7 max-[760px]:justify-start">
                                <a className="text-[0.74rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Terms of Service</a>
                                <a className="text-[0.74rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Privacy Policy</a>
                                <a className="text-[0.74rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Contact Support</a>
                                <a className="text-[0.74rem] font-extrabold text-[#5c4642] no-underline hover:text-[var(--admin-primary)]" href="#">Racing Rules</a>
                            </nav>
                        </footer>
                    </div>
                </section>
        </AdminLayout>
    );
}

export default CreateTournament;
