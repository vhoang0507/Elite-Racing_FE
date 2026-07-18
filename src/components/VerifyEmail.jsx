import React, { useEffect, useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import {
    resendVerificationOtp,
    verifyEmail,
} from '../api/authApi';
import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';
import Toast from './shared/Toast';
import { useToast } from './shared/useToast';

const formGroupClass = 'mb-5';
const labelClass = 'mb-2.5 block text-[0.9rem] font-extrabold text-[#1f3b57]';
const controlClass = 'auth-control h-[52px] w-full rounded-[8px] border bg-white px-4 text-base outline-none';
const OTP_CODE_LENGTH = 6;

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (location.state?.message) {
            showToast(location.state.message, 'success');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCodeChange = (event) => {
        setCode(event.target.value.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (code.length !== OTP_CODE_LENGTH) {
            showToast(`Please enter the ${OTP_CODE_LENGTH}-digit OTP code.`, 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await verifyEmail({
                Email: email,
                Code: code,
            });

            navigate('/login', {
                state: {
                    message: response?.message || response?.Message || 'Email verified successfully. You can log in now.',
                },
            });
        } catch (err) {
            showToast(err.message || 'Email verification failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            const response = await resendVerificationOtp({
                Email: email,
            });

            showToast(response?.message || response?.Message || 'A new OTP has been sent.', 'success');
        } catch (err) {
            showToast(err.message || 'Could not resend OTP. Please try again.', 'error');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-page flex h-screen max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div className="flex h-screen w-[58%] items-center justify-center overflow-y-auto bg-[rgba(255,254,253,0.92)] px-[50px] py-[60px] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:px-6 max-[1024px]:py-[30px]">
                <div className="w-full max-w-[520px]">
                    <div className="mb-8 flex items-center gap-3">
                        <img
                            src={icon}
                            alt="Elite Racing League Logo"
                            className="h-12 w-12 object-contain"
                        />

                        <h2 className="text-[2.2rem] font-extrabold italic text-[#0b7f5a]">
                            Elite Racing League
                        </h2>
                    </div>

                    <h1 className="mb-4 text-[3.25rem] leading-[1.05] text-[#1f3b57] max-[1024px]:text-[2.5rem]">
                        Verify Email
                    </h1>

                    <p className="mb-8 text-[1.15rem] leading-[1.6] text-[#555]">
                        Enter the OTP sent to your email address.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={formGroupClass}>
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

                        <div className={formGroupClass}>
                            <label className={labelClass}>OTP CODE</label>

                            <input
                                className={`${controlClass} text-center text-[1.25rem] font-bold tracking-normal`}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="000000"
                                value={code}
                                onChange={handleCodeChange}
                                maxLength={OTP_CODE_LENGTH}
                                minLength={OTP_CODE_LENGTH}
                                pattern={`\\d{${OTP_CODE_LENGTH}}`}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mb-4 h-[52px] w-full cursor-pointer rounded-[8px] bg-[#0b7f5a] text-base font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.16)]"
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <button
                            type="button"
                            disabled={isResending || !email}
                            onClick={handleResend}
                            className="mb-[22px] h-[52px] w-full cursor-pointer rounded-[8px] border border-[#0b7f5a] bg-white text-base font-bold text-[#0b7f5a]"
                        >
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </button>

                        <div className="text-center text-[0.95rem]">
                            <Link className="font-bold text-[#0b7f5a] no-underline" to="/login">
                                Back to Login
                            </Link>
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
                        Secure your account.
                    </h1>

                    <p className="text-[1.15rem] leading-[1.7]">
                        Confirm your email before accessing the racing platform.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
