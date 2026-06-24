import React, { useState } from 'react';
import {
    Link,
    useNavigate,
} from 'react-router-dom';

import { register } from '../api/authApi';
import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';

import {
    FaChevronDown,
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
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Password confirmation does not match.');
            return;
        }

        if (!termsAccepted) {
            setError('Please accept the terms before creating an account.');
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
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page flex h-screen max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <div className="flex h-screen w-[58%] items-start justify-center overflow-y-auto bg-[rgba(255,254,253,0.92)] px-[50px] py-[60px] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:px-6 max-[1024px]:py-[30px] [&::-webkit-scrollbar-thumb]:rounded-[8px] [&::-webkit-scrollbar-thumb]:bg-[#d9c2bd] [&::-webkit-scrollbar]:w-2">
                <div className="w-full max-w-[520px]">
                    <div className="mb-8 flex items-center gap-3">
                        <img
                            src={icon}
                            alt="Elite Racing League Logo"
                            className="h-12 w-12 object-contain"
                        />

                        <h2 className="text-[2.2rem] font-extrabold italic text-[#8B0000]">
                            Elite Racing League
                        </h2>
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
                                    <option value="RaceReferee">Referee</option>
                                    <option value="Jockey">Jockey</option>
                                    <option value="Spectator">Spectator</option>
                                    <option value="HorseOwner">Horse Owner</option>
                                </select>

                                <FaChevronDown className={iconClass} />
                            </div>
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
                            className="mb-5 inline-block text-[0.95rem] font-bold text-[#8B0000] no-underline"
                        >
                            Verify your email
                        </Link>

                        <div className={formGroupClass}>
                            <label className={labelClass}>PASSWORD</label>

                            <div className="relative">
                                <input
                                    className={`${controlClass} pr-[46px]`}
                                    type="password"
                                    placeholder="Create a secure password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />

                                <FaEyeSlash className={iconClass} />
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
                                <a className="text-[#8B0000] no-underline" href="#">Terms of Service</a> and{' '}
                                <a className="text-[#8B0000] no-underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-[10px] border border-[#f0b4b4] bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-[#8B0000]">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mb-[22px] h-[52px] w-full cursor-pointer rounded-[8px] bg-[#a30000] text-base font-bold text-white shadow-[0_12px_24px_rgba(139,0,0,0.16)]"
                        >
                            {isSubmitting ? 'Creating account...' : 'Register Account'}
                        </button>

                        <div className="flex justify-between gap-5 text-[0.95rem] max-[1024px]:flex-col max-[1024px]:gap-3">
                            <a className="font-bold text-[#8B0000] no-underline" href="#">
                                &larr; Back to Home
                            </a>

                            <span>
                                Already have an account?{' '}

                                <Link className="font-bold text-[#8B0000] no-underline" to="/">
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
