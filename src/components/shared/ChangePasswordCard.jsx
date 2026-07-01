import { useState } from 'react';
import { FaLock } from 'react-icons/fa';

import { changePassword } from '../../api/authApi';

const emptyPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function ChangePasswordCard() {
    const [form, setForm] = useState(emptyPasswordForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError('');
        setSuccess('');
    };

    const validate = () => {
        if (!form.currentPassword) {
            return 'Please enter your current password.';
        }

        if (!form.newPassword) {
            return 'Please enter your new password.';
        }

        if (form.newPassword.length < 6) {
            return 'New password must have at least 6 characters.';
        }

        if (form.newPassword !== form.confirmPassword) {
            return 'Confirm password does not match.';
        }

        if (form.currentPassword === form.newPassword) {
            return 'New password must be different from current password.';
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validate();

        if (validationMessage) {
            setError(validationMessage);
            setSuccess('');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            setForm(emptyPasswordForm);
            setSuccess(response?.message || 'Password changed successfully.');
        } catch (err) {
            setError(err.message || 'Failed to change password.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-[#e8f7ef] text-[var(--admin-primary)]">
                    <FaLock />
                </div>

                <div>
                    <h2 className="m-0 text-[1.45rem] font-bold text-[var(--admin-ink)]">
                        Change Password
                    </h2>

                    <p className="m-0 mt-1 text-sm text-[var(--admin-muted)]">
                        Update your account password securely.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                        {success}
                    </div>
                )}

                <PasswordInput
                    label="Current Password"
                    value={form.currentPassword}
                    onChange={(value) => handleChange('currentPassword', value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <PasswordInput
                        label="New Password"
                        value={form.newPassword}
                        onChange={(value) => handleChange('newPassword', value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={(value) => handleChange('confirmPassword', value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-[var(--admin-primary)] px-6 py-3 font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </form>
        </section>
    );
}

function PasswordInput({
    label,
    value,
    onChange,
    placeholder,
    autoComplete,
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-semibold text-gray-600">
                {label}
            </span>

            <input
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="w-full rounded-md border border-[var(--admin-border)] bg-white px-4 py-3 outline-none focus:border-[var(--admin-primary)]"
            />
        </label>
    );
}

export default ChangePasswordCard;