import { useEffect, useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import { login } from '../api/authApi';
import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';
import { saveAuthSession } from '../utils/tokenStorage';
import Toast from './shared/Toast';
import { useToast } from './shared/useToast';

import {
    FaEnvelope,
    FaEye,
    FaEyeSlash,
} from 'react-icons/fa';

const controlClass = 'auth-control h-[52px] w-full rounded-[8px] border bg-white py-0 pl-4 pr-[46px] text-base outline-none transition-all duration-200';
const iconClass = 'absolute right-4 top-1/2 -translate-y-1/2 text-base text-[#777]';
const formGroupClass = 'mb-5';
const labelClass = 'mb-2.5 block w-full text-left text-[0.95rem] font-bold text-[#1f3b57]';

const roleDashboardRoutes = {
    Admin: '/admin/dashboard',
    Jockey: '/jockey/dashboard',
    RaceReferee: '/referee/dashboard',
    Spectator: '/spectator/dashboard',
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (location.state?.message) {
            showToast(location.state.message, 'success');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await login({
                Email: email,
                Password: password,
            });

            const token = response?.token || response?.Token;
            const user = response?.user || response?.User;
            const userRole = user?.role || user?.Role;

            if (!token || !user) {
                throw new Error('Login succeeded but the response did not include a token.');
            }

            saveAuthSession({
                token,
                user,
            }, remember);

            const nextStep = response?.nextStep || response?.NextStep;
            const userStatus = user?.status || user?.Status;

            if (userRole === 'HorseOwner') {
                if (nextStep === 'AddHorse' || userStatus === 'Pending') {
                    navigate('/owner/my-horse', { replace: true });
                    return;
                }

                navigate('/owner/dashboard', { replace: true });
                return;
            }

            if (userRole === 'RaceReferee' && (nextStep === 'WaitForActivation' || userStatus === 'Pending')) {
                navigate('/referee/settings', { replace: true });
                return;
            }

            // Redirect back to the page the user tried to visit before being sent to login
            const fromPath = location.state?.from?.pathname;
            if (fromPath && fromPath !== '/login') {
                navigate(fromPath, { replace: true });
                return;
            }

            const dashboardRoute = roleDashboardRoutes[userRole];

            if (dashboardRoute) {
                navigate(dashboardRoute, { replace: true });
                return;
            }

            showToast('Login successful. This role dashboard is not built in the frontend yet.', 'success');
        } catch (err) {
            showToast(err.message || 'Login failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page flex h-screen max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
            <div className="relative h-screen flex-1 overflow-hidden max-[1024px]:hidden">
                <img
                    src={horseRacing}
                    alt="Horse Racing"
                    className="absolute inset-0 block h-full w-full object-cover object-center"
                />

                <div className="auth-hero-overlay absolute inset-0" />

                <div className="absolute bottom-[60px] left-[60px] z-[2] max-w-[520px] text-white">
                    <h1 className="mb-6 text-[4.5rem] font-extrabold leading-[1.05] max-[1280px]:text-[3.5rem]">
                        Manage Horse Racing Tournaments Professionally
                    </h1>

                    <p className="text-[1.15rem] leading-[1.7] text-[rgba(255,255,255,0.92)]">
                        The elite management platform for racing professionals.
                    </p>
                </div>
            </div>

            <div className="flex h-screen w-[560px] min-w-[560px] items-center justify-center overflow-y-auto p-10 [scrollbar-width:none] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:min-w-full max-[1024px]:p-6 [&::-webkit-scrollbar]:w-0">
                <div className="auth-panel w-full max-w-[520px] rounded-[8px] p-10 max-[1024px]:max-w-full max-[1024px]:px-6 max-[1024px]:py-9">
                    <div className="mb-[34px] text-center">
                        <div className="mb-2.5 flex items-center justify-center gap-3.5">
                            <img
                                src={icon}
                                alt="Elite Racing League Logo"
                                className="h-[50px] w-[50px] object-contain"
                            />

                            <h2 className="m-0 text-[2rem] font-extrabold italic text-[#0b7f5a] max-[1024px]:text-[1.7rem]">
                                Elite Racing League
                            </h2>
                        </div>

                        <p className="mt-1.5 text-base leading-normal text-[#666]">
                            Horse Racing Tournament Management System
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={formGroupClass}>
                            <label className={labelClass}>Email Address</label>

                            <div className="relative">
                                <input
                                    className={controlClass}
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />

                                <FaEnvelope className={iconClass} />
                            </div>
                        </div>

                        <div className={formGroupClass}>
                            <div className="mb-2.5 flex items-center justify-between">
                                <label className="block text-left text-[0.95rem] font-bold text-[#1f3b57]">
                                    Password
                                </label>

                                <span className="text-[0.85rem] font-bold text-[#0b7f5a] opacity-50 cursor-not-allowed select-none">
                                    Forgot password
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    className={controlClass}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
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
                        </div>

                        <div className="mb-[26px] flex items-center gap-2.5 text-[0.95rem] text-[#444]">
                            <input
                                className="h-4 w-4"
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(event) => setRemember(event.target.checked)}
                            />

                            <label htmlFor="remember">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mb-6 h-[52px] w-full cursor-pointer rounded-[8px] bg-[#0b7f5a] text-base font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.16)] transition-colors duration-200 hover:bg-[#065f46]"
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="text-center text-[0.98rem] text-[#666]">
                            Don&apos;t have an account?{' '}

                            <Link
                                to="/register"
                                className="font-bold text-[#0b7f5a] no-underline"
                            >
                                Register here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
