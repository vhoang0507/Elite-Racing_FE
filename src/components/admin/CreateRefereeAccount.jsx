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
import {
    confirmAdminAction,
    showAdminSuccess,
    showAdminError,
} from '../../utils/adminFeedback';

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
const fullNameRegex = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u;
const phoneDisplayRegex = /^\+?[0-9\s().-]+$/;
const licenseRegex = /^[A-Z0-9][A-Z0-9./-]{2,99}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const pageShellClass = 'grid min-h-[calc(100vh-64px)] content-start gap-5 px-11 py-8 max-[780px]:px-5';
const breadcrumbClass = 'flex items-center gap-2 text-[0.74rem] font-bold uppercase text-[#64748b]';
const cardClass = 'overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_12px_30px_rgba(15,23,42,0.05)]';
const cardHeaderClass = 'flex min-h-[58px] items-center justify-between gap-4 px-5 pt-5 max-[780px]:items-start';
const sectionTitleClass = 'm-0 flex items-center gap-2 text-[1rem] font-black text-[var(--admin-primary-dark)]';
const rolePillClass = 'rounded-full bg-[#e8f7ef] px-3 py-1.5 text-[0.76rem] font-black text-[var(--admin-primary-dark)]';
const formGridClass = 'grid grid-cols-2 gap-x-5 gap-y-4 px-5 pb-5 pt-3 max-[820px]:grid-cols-1';
const fieldClass = 'grid gap-1.5';
const labelClass = 'text-[0.76rem] font-black text-[#5b403c]';
const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[var(--admin-border)] bg-[#fffdfc] px-3 text-[0.9rem] text-[var(--admin-ink)] outline-0 transition-all duration-200 placeholder:text-[#94a3b8] focus:border-[#0b7f5a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';
const selectClass = `${inputClass} cursor-pointer`;
const actionsClass = 'flex items-center justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4 max-[640px]:flex-col max-[640px]:items-stretch';
const secondaryButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border border-[var(--admin-border)] bg-white px-6 text-[0.82rem] font-bold text-[var(--admin-primary-dark)] transition-colors hover:border-[var(--admin-gold)]';
const primaryButtonClass = 'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--admin-primary)] px-6 text-[0.82rem] font-bold text-white hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-70';
const tableHeadClass = 'border-b border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-3 text-left text-[0.68rem] uppercase text-[#64748b]';
const tableCellClass = 'border-b border-[var(--admin-border)] px-5 py-3.5 align-middle text-[0.86rem] text-[var(--admin-ink)]';
const statusBadgeClass = 'inline-flex min-h-6 items-center rounded-full bg-[#e8f7ee] px-2.5 text-[0.66rem] font-black uppercase text-[#16864f]';

const formatClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

const sortPendingFirst = (items, getStatus) => [...items].sort((current, next) => {
    const currentRank = formatClass(getStatus(current)) === 'pending' ? 0 : 1;
    const nextRank = formatClass(getStatus(next)) === 'pending' ? 0 : 1;

    return currentRank - nextRank;
});

const normalizeWhitespace = (value) => String(value || '').trim().replace(/\s+/g, ' ');

function getRefereeValidationError(form) {
    const fullName = normalizeWhitespace(form.fullName);
    const email = String(form.email || '').trim();
    const phone = String(form.phone || '').trim();
    const licenseNo = String(form.licenseNo || '').trim();
    const experienceYears = String(form.experienceYears || '').trim();
    const password = String(form.password || '');

    if (fullName.length < 2 || fullName.length > 150) {
        return 'Full name must be between 2 and 150 characters.';
    }

    if (!fullNameRegex.test(fullName)) {
        return 'Full name can only contain letters, spaces, apostrophes, dots, and hyphens.';
    }

    if (!email || email.length > 255) {
        return 'Email is required and cannot exceed 255 characters.';
    }

    if (phone) {
        const digitCount = phone.replace(/\D/g, '').length;

        if (!phoneDisplayRegex.test(phone) || digitCount < 9 || digitCount > 15) {
            return 'Phone must contain 9 to 15 digits and may only use +, spaces, dots, parentheses, or hyphens.';
        }
    }

    if (licenseNo && !licenseRegex.test(licenseNo.toUpperCase())) {
        return 'License number must be 3 to 100 characters and contain only letters, numbers, dots, slashes, or hyphens.';
    }

    if (experienceYears && (!/^\d+$/.test(experienceYears) || Number(experienceYears) > 60)) {
        return 'Experience years must be an integer between 0 and 60.';
    }

    if (!userStatusOptions.includes(form.status)) {
        return 'Status must be Active or Inactive.';
    }

    if (password.length < 8 || password.length > 72) {
        return 'Password must be between 8 and 72 characters.';
    }

    if (/\s/.test(password)) {
        return 'Password cannot contain spaces.';
    }

    if (!strongPasswordRegex.test(password)) {
        return 'Password must include uppercase, lowercase, number, and special character.';
    }

    if (password !== form.confirmPassword) {
        return 'Confirm password does not match.';
    }

    return null;
}

function CreateRefereeAccount() {
    const [form, setForm] = useState(initialForm);
    const [referees, setReferees] = useState([]);
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
                    showAdminError(err.message || 'Failed to load active referees.');
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
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = getRefereeValidationError(form);

        if (validationError) {
            showAdminError(validationError);
            return;
        }

        const confirmed = await confirmAdminAction({
            title: 'Create referee account',
            message: `Are you sure you want to create an account for "${form.fullName.trim() || form.email.trim()}"?`,
            confirmLabel: 'Create',
        });

        if (!confirmed) {
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
            showAdminSuccess('Referee account created successfully.', 'Created');
        } catch (err) {
            showAdminError(err.message || 'Failed to create referee account.');
        } finally {
            setIsSaving(false);
        }
    };

    const sortedReferees = sortPendingFirst(referees, (referee) => referee.status);

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
                    <h1 className="page-title">
                        Create Referee Account
                    </h1>
                    <p className="page-subtitle">
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
                            <input className={inputClass} maxLength={150} minLength={2} name="fullName" onChange={handleChange} placeholder="Nguyen Van Referee" required type="text" value={form.fullName} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Email *</span>
                            <input className={inputClass} maxLength={255} name="email" onChange={handleChange} placeholder="referee01@example.com" required type="email" value={form.email} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Phone</span>
                            <input className={inputClass} maxLength={30} name="phone" onChange={handleChange} placeholder="0900000001" type="tel" value={form.phone} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>License No</span>
                            <input className={inputClass} maxLength={100} minLength={3} name="licenseNo" onChange={handleChange} placeholder="REF-001" type="text" value={form.licenseNo} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Experience Years</span>
                            <input className={inputClass} max="60" min="0" name="experienceYears" onChange={handleChange} placeholder="3" step="1" type="number" value={form.experienceYears} />
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
                            <input className={inputClass} maxLength={72} minLength={8} name="password" onChange={handleChange} required type="password" value={form.password} />
                        </label>

                        <label className={fieldClass}>
                            <span className={labelClass}>Confirm Password *</span>
                            <input className={inputClass} maxLength={72} minLength={8} name="confirmPassword" onChange={handleChange} required type="password" value={form.confirmPassword} />
                        </label>
                    </div>

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
                        <span className="rounded-full bg-[#e8f7ef] px-3 py-1.5 text-[0.76rem] font-bold text-[#64748b]">
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
                                ) : sortedReferees.map((referee) => (
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
