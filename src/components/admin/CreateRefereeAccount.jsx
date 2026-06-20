import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
} from 'react-router-dom';

import {
    FaShieldAlt,
    FaUserPlus,
    FaUsers,
} from 'react-icons/fa';

import { adminApi } from '../../api/adminApi';

import AdminLayout from './AdminLayout';

const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    licenseNo: '',
    experienceYears: '',
    status: 'Active',
    password: '',
    confirmPassword: '',
};

const userStatusOptions = ['Active', 'Inactive'];

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-5 px-11 py-8 max-[780px]:px-5';
const breadcrumbClass = 'flex items-center gap-2 text-[0.74rem] font-bold uppercase text-[#765c58]';
const cardClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_12px_30px_rgba(91,26,19,0.05)]';
const cardHeaderClass = 'flex min-h-[58px] items-center justify-between gap-4 px-5 pt-5 max-[780px]:items-start';
const sectionTitleClass = 'm-0 flex items-center gap-2 text-[1rem] font-black text-[var(--admin-primary-dark)]';
const rolePillClass = 'rounded-full bg-[#fff0ed] px-3 py-1.5 text-[0.76rem] font-black text-[var(--admin-primary-dark)]';
const formGridClass = 'grid grid-cols-2 gap-x-5 gap-y-4 px-5 pb-5 pt-3 max-[820px]:grid-cols-1';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.76rem] font-black text-[#5b403c]';
const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.9rem] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#9b8580] focus:border-[#c6897e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(134,7,7,0.08)]';
const selectClass = `${inputClass} cursor-pointer`;
const actionsClass = 'flex items-center justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4 max-[640px]:flex-col max-[640px]:items-stretch';
const secondaryButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-6 text-[0.82rem] font-bold text-[var(--admin-primary-dark)] hover:bg-[#fff0ed]';
const primaryButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--admin-primary)] px-6 text-[0.82rem] font-bold text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70';
const tableHeadClass = 'border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-3 text-left text-[0.68rem] uppercase text-[#765c58]';
const tableCellClass = 'border-b border-[var(--admin-border)] px-5 py-3.5 align-middle text-[0.86rem] text-[var(--admin-ink)]';
const statusBadgeClass = 'inline-flex min-h-6 items-center rounded border border-[#9fdcb9] bg-[#e8f7ee] px-2.5 text-[0.66rem] font-black uppercase text-[#16864f]';

function CreateRefereeAccount() {
    const [form, setForm] = useState(initialForm);
    const [referees, setReferees] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        adminApi.getReferees()
            .then((payload) => {
                if (isMounted) {
                    setReferees(payload);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err.message || 'Failed to load active referees.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const clearForm = () => {
        setForm(initialForm);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (form.password !== form.confirmPassword) {
            setError('Confirm password does not match.');
            return;
        }

        setIsSaving(true);

        try {
            const created = await adminApi.createRefereeAccount({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                licenseNo: form.licenseNo.trim(),
                experienceYears: form.experienceYears,
                status: form.status,
                password: form.password,
                confirmPassword: form.confirmPassword,
            });

            setReferees((current) => [created, ...current]);
            setForm(initialForm);
            setSuccess('Referee account created successfully.');
        } catch (err) {
            setError(err.message || 'Failed to create referee account.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout activeKey="users">
            <section className={pageShellClass}>
                <nav aria-label="Breadcrumb" className={breadcrumbClass}>
                    <FaShieldAlt aria-hidden="true" className="text-[var(--admin-primary)]" />
                    <Link className="text-[var(--admin-primary-dark)] no-underline" to="/admin/users">
                        User Management
                    </Link>
                    <span>&gt;</span>
                    <span>Create Referee Account</span>
                </nav>

                <div>
                    <h1 className="m-0 text-[2rem] leading-[1.15] text-[var(--admin-primary-dark)] max-[780px]:text-[1.6rem]">
                        Create Referee Account
                    </h1>
                    <p className="mb-0 mt-1.5 text-[0.9rem] font-[650] text-[var(--admin-muted)]">
                        Create active referee accounts for tournament assignment.
                    </p>
                </div>

                <form className={cardClass} onSubmit={handleSubmit}>
                    <div className={cardHeaderClass}>
                        <h2 className={sectionTitleClass}>
                            <FaUserPlus aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Referee Information</span>
                        </h2>
                        <span className={rolePillClass}>Role: RaceReferee</span>
                    </div>

                    <div className={formGridClass}>
                        <label className={fieldClass}>
                            <span className={labelClass}>Full Name *</span>
                            <input className={inputClass} name="fullName" onChange={handleChange} placeholder="Nguyen Van Referee" required type="text" value={form.fullName} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Email *</span>
                            <input className={inputClass} name="email" onChange={handleChange} placeholder="referee01@example.com" required type="email" value={form.email} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Phone</span>
                            <input className={inputClass} name="phone" onChange={handleChange} placeholder="0900000001" type="tel" value={form.phone} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>License No</span>
                            <input className={inputClass} name="licenseNo" onChange={handleChange} placeholder="REF-001" type="text" value={form.licenseNo} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Experience Years</span>
                            <input className={inputClass} min="0" name="experienceYears" onChange={handleChange} placeholder="3" type="number" value={form.experienceYears} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Status</span>
                            <select className={selectClass} name="status" onChange={handleChange} value={form.status}>
                                {userStatusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Password *</span>
                            <input className={inputClass} minLength={6} name="password" onChange={handleChange} required type="password" value={form.password} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Confirm Password *</span>
                            <input className={inputClass} minLength={6} name="confirmPassword" onChange={handleChange} required type="password" value={form.confirmPassword} />
                        </label>
                    </div>

                    {(error || success) && (
                        <div className={`mx-5 mb-4 rounded-md border px-4 py-3 text-[0.84rem] font-semibold ${error ? 'border-[#f0b4b4] bg-[#fff3f3] text-[var(--admin-primary)]' : 'border-[#b9e5c5] bg-[#f1fff5] text-[#1d6b35]'}`}>
                            {error || success}
                        </div>
                    )}

                    <div className={actionsClass}>
                        <button className={secondaryButtonClass} onClick={clearForm} type="button">
                            Clear
                        </button>
                        <button className={primaryButtonClass} disabled={isSaving} type="submit">
                            {isSaving ? 'Creating...' : 'Create Referee'}
                        </button>
                    </div>
                </form>

                <section className={cardClass}>
                    <div className="flex min-h-[58px] items-center gap-3 px-5 pt-5">
                        <h2 className={sectionTitleClass}>
                            <FaUsers aria-hidden="true" className="text-[var(--admin-primary)]" />
                            <span>Active Referees</span>
                        </h2>
                        <span className="rounded-full bg-[#fff0ed] px-3 py-1.5 text-[0.76rem] font-bold text-[#765c58]">
                            {referees.length} referee(s)
                        </span>
                    </div>

                    <div className="overflow-x-auto px-5 pb-5 pt-3">
                        <table className="w-full min-w-[820px] border-collapse overflow-hidden rounded-md border border-[var(--admin-border)]">
                            <thead>
                                <tr>
                                    {['Referee Name', 'Email', 'Phone', 'License', 'Experience', 'Status'].map((heading) => (
                                        <th className={tableHeadClass} key={heading}>{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td className={tableCellClass} colSpan={6}>Loading active referees...</td>
                                    </tr>
                                ) : referees.length === 0 ? (
                                    <tr>
                                        <td className={tableCellClass} colSpan={6}>No active referees found.</td>
                                    </tr>
                                ) : referees.map((referee) => (
                                    <tr key={referee.refereeId || referee.email}>
                                        <td className={tableCellClass}>
                                            <strong>{referee.fullName}</strong>
                                        </td>
                                        <td className={tableCellClass}>{referee.email}</td>
                                        <td className={tableCellClass}>{referee.phone || '-'}</td>
                                        <td className={tableCellClass}>{referee.licenseNo || '-'}</td>
                                        <td className={tableCellClass}>{Number(referee.experienceYears || 0)} years</td>
                                        <td className={tableCellClass}>
                                            <span className={statusBadgeClass}>{referee.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </AdminLayout>
    );
}

export default CreateRefereeAccount;
