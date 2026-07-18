import { useState } from 'react';
import { FaLock } from 'react-icons/fa';

import { changePassword } from '../../api/authApi';
import Toast from './Toast';
import { useToast } from './useToast';

const emptyPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function ChangePasswordCard() {
    const [form, setForm] = useState(emptyPasswordForm);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
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
            showToast(validationMessage, 'error');
            return;
        }

        setSaving(true);

        try {
            const response = await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            setForm(emptyPasswordForm);
            showToast(response?.message || 'Password changed successfully.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to change password.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[var(--admin-surface-strong)] text-[var(--admin-primary)]">
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
                        className="rounded-full bg-[var(--admin-primary)] px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-[var(--admin-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="w-full rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--admin-primary)]"
            />
        </label>
    );
}

export default ChangePasswordCard;