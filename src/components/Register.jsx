import React, { useState } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import { register } from '../api/authApi';
import horseRacing from '../assets/horse-racing.jpg';
import Toast from './shared/Toast';
import { useToast } from './shared/useToast';

import {
    FaChevronDown,
    FaEye,
    FaEyeSlash,
} from 'react-icons/fa';

const formGroupClass = 'mb-5';
const labelClass = 'mb-2.5 block text-[0.9rem] font-extrabold text-[#1f3b57]';
const controlClass = 'auth-control h-[52px] w-full rounded-[8px] border bg-white px-4 text-base outline-none';
const iconClass = 'absolute right-4 top-1/2 -translate-y-1/2 text-[#666]';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            showToast('Password confirmation does not match.', 'error');
            return;
        }

        if (!termsAccepted) {
            showToast('Please accept the terms before creating an account.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                FullName: fullName,
                Email: email,
                Phone: phone || null,
                Password: password,
                ConfirmPassword: confirmPassword,
                Role: role,
            });

            navigate('/verify-email', {
                state: {
                    email: response?.email || response?.Email || email,
                    message: response?.message || response?.Message,
                    otpDemo: response?.otpDemo || response?.OtpDemo,
                },
            });
        } catch (err) {
            showToast(err.message || 'Registration failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page flex h-screen max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div className="flex h-screen w-[58%] items-start justify-center overflow-y-auto bg-[rgba(255,254,253,0.92)] px-[50px] py-[60px] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:px-6 max-[1024px]:py-[30px] [&::-webkit-scrollbar-thumb]:rounded-[8px] [&::-webkit-scrollbar-thumb]:bg-[#a7b7ca] [&::-webkit-scrollbar]:w-2">
                <div className="w-full max-w-[520px]">
                    <div className="mb-8 flex justify-center">
                        <img
                            src="/elite-racing-league-logo.png"
                            alt="Elite Racing League"
                            className="h-28 w-auto object-contain"
                        />
                    </div>

                    <h1 className="mb-4 text-[3.25rem] leading-[1.05] text-[#1f3b57] max-[1024px]:text-[2.5rem]">
                        Create Account
                    </h1>

                    <p className="mb-8 text-[1.15rem] leading-[1.6] text-[#555]">
                        Join the elite management platform for professional horse racing.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={formGroupClass}>
                            <label className={labelClass}>ACCOUNT TYPE</label>

                            <div className="relative">
                                <select
                                    className={`${controlClass} appearance-none pr-[46px]`}
                                    value={role}
                                    onChange={(event) => setRole(event.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Select your primary role
                                    </option>
                                    <option value="Jockey">Jockey</option>
                                    <option value="Spectator">Spectator</option>
                                    <option value="HorseOwner">Horse Owner</option>
                                </select>

                                <FaChevronDown className={iconClass} />
                            </div>

                            <p className="mt-2 text-[0.85rem] text-[#6b7280]">
                                Referee accounts are created by administrators.
                            </p>
                        </div>

                        <div className={formGroupClass}>
                            <label className={labelClass}>FULL NAME</label>

                            <input
                                className={controlClass}
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-4 max-[1024px]:flex-col">
                            <div className={`${formGroupClass} flex-1`}>
                                <label className={labelClass}>EMAIL ADDRESS</label>

                                <input
                                    className={controlClass}
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>

                            <div className={`${formGroupClass} flex-1`}>
                                <label className={labelClass}>PHONE NUMBER</label>

                                <input
                                    className={controlClass}
                                    type="text"
                                    placeholder="+1 (555) 000-0000"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                />
                            </div>
                        </div>

                        <Link
                            to="/verify-email"
                            state={{ email }}
                            className="mb-5 inline-block text-[0.95rem] font-bold text-[#0b7f5a] no-underline"
                        >
                            Verify your email
                        </Link>

                        <div className={formGroupClass}>
                            <label className={labelClass}>PASSWORD</label>

                            <div className="relative">
                                <input
                                    className={`${controlClass} pr-[46px]`}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a secure password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className={`${iconClass} border-0 bg-transparent p-0 cursor-pointer`}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>

                            <div className="mt-2.5 flex gap-1.5">
                                <div className="h-1 flex-1 rounded bg-[#ddd]" />
                                <div className="h-1 flex-1 rounded bg-[#ddd]" />
                                <div className="h-1 flex-1 rounded bg-[#ddd]" />
                                <div className="h-1 flex-1 rounded bg-[#ddd]" />
                            </div>

                            <p className="mt-2 text-[0.92rem] text-[#555]">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div className={formGroupClass}>
                            <label className={labelClass}>CONFIRM PASSWORD</label>

                            <input
                                className={controlClass}
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6 flex items-start gap-2.5 text-[0.92rem]">
                            <input
                                className="mt-1 h-4 w-4"
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(event) => setTermsAccepted(event.target.checked)}
                            />

                            <label htmlFor="terms">
                                I agree to the{' '}
                                <a className="text-[#0b7f5a] no-underline" href="#">Terms of Service</a> and{' '}
                                <a className="text-[#0b7f5a] no-underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mb-[22px] h-[52px] w-full cursor-pointer rounded-[8px] bg-[#0b7f5a] text-base font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.16)]"
                        >
                            {isSubmitting ? 'Creating account...' : 'Register Account'}
                        </button>

                        <div className="flex justify-between gap-5 text-[0.95rem] max-[1024px]:flex-col max-[1024px]:gap-3">
                            <Link className="font-bold text-[#0b7f5a] no-underline" to="/">
                                &larr; Back to Home
                            </Link>

                            <span>
                                Already have an account?{' '}

                                <Link className="font-bold text-[#0b7f5a] no-underline" to="/">
                                    Log in
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>

            <div className="relative h-screen w-[42%] flex-shrink-0 overflow-hidden max-[1024px]:hidden">
                <img
                    src={horseRacing}
                    alt="Horse Racing"
                    className="absolute inset-0 block h-full w-full object-cover object-center"
                />

                <div className="auth-hero-overlay absolute inset-0" />

                <div className="absolute bottom-[60px] left-[50px] z-[2] max-w-[420px] text-white">
                    <h1 className="mb-[18px] text-[3.2rem] font-extrabold leading-[1.1]">
                        Command the Track.
                    </h1>

                    <p className="text-[1.15rem] leading-[1.7]">
                        Join the definitive management platform trusted by top
                        owners, jockeys, and referees to analyze performance
                        and dominate the racing circuit.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
