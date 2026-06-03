import React from 'react';
import { Link } from 'react-router-dom';

import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';

import {
    FaEnvelope,
    FaEyeSlash,
    FaChevronDown,
} from 'react-icons/fa';

const controlClass = 'h-[54px] w-full rounded-[10px] border border-[#ecd1d1] bg-white py-0 pl-4 pr-[46px] text-base outline-none transition-all duration-200 focus:border-[#8B0000] focus:shadow-[0_0_0_3px_rgba(139,0,0,0.1)]';
const iconClass = 'absolute right-4 top-1/2 -translate-y-1/2 text-base text-[#777]';
const formGroupClass = 'mb-[22px]';
const labelClass = 'mb-2.5 block w-full text-left text-[0.95rem] font-bold text-[#1f3b57]';

const Login = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f4f4f4] font-['Segoe_UI',sans-serif] max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <div className="relative h-screen flex-1 overflow-hidden max-[1024px]:hidden">
                <img
                    src={horseRacing}
                    alt="Horse Racing"
                    className="absolute inset-0 block h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-[rgba(0,0,0,0.32)]" />

                <div className="absolute bottom-[60px] left-[60px] z-[2] max-w-[520px] text-white">
                    <h1 className="mb-6 text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[1.05]">
                        Manage Horse Racing Tournaments Professionally
                    </h1>

                    <p className="text-[1.15rem] leading-[1.7] text-[rgba(255,255,255,0.92)]">
                        The elite management platform for racing professionals.
                    </p>
                </div>
            </div>

            <div className="flex h-screen w-[560px] min-w-[560px] items-center justify-center overflow-y-auto bg-[#f4f4f4] p-10 [scrollbar-width:none] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:min-w-full max-[1024px]:p-6 [&::-webkit-scrollbar]:w-0">
                <div className="w-full max-w-[520px] rounded-[22px] bg-white p-12 shadow-[0_10px_35px_rgba(0,0,0,0.06)] max-[1024px]:max-w-full max-[1024px]:rounded-2xl max-[1024px]:px-6 max-[1024px]:py-9">
                    <div className="mb-[34px] text-center">
                        <div className="mb-2.5 flex items-center justify-center gap-3.5">
                            <img
                                src={icon}
                                alt="Elite Racing League Logo"
                                className="h-[50px] w-[50px] object-contain"
                            />

                            <h2 className="m-0 text-[2.2rem] font-extrabold italic text-[#8B0000] max-[1024px]:text-[1.8rem]">
                                Elite Racing League
                            </h2>
                        </div>

                        <p className="mt-1.5 text-base leading-normal text-[#666]">
                            Horse Racing Tournament Management System
                        </p>
                    </div>

                    <form>
                        <div className={formGroupClass}>
                            <div className="relative">
                                <select className={`${controlClass} appearance-none`} defaultValue="">
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="referee">Referee</option>
                                    <option value="jockey">Jockey</option>
                                    <option value="spectator">Spectator</option>
                                    <option value="horse-owner">Horse Owner</option>
                                </select>

                                <FaChevronDown className={iconClass} />
                            </div>
                        </div>

                        <div className={formGroupClass}>
                            <label className={labelClass}>Email Address</label>

                            <div className="relative">
                                <input
                                    className={controlClass}
                                    type="email"
                                    placeholder="Enter your email"
                                />

                                <FaEnvelope className={iconClass} />
                            </div>
                        </div>

                        <div className={formGroupClass}>
                            <div className="mb-2.5 flex items-center justify-between">
                                <label className="block text-left text-[0.95rem] font-bold text-[#1f3b57]">
                                    Password
                                </label>

                                <a href="#" className="text-[0.85rem] font-bold text-[#8B0000] no-underline transition-opacity duration-200 hover:opacity-80">
                                    Forgot password
                                </a>
                            </div>

                            <div className="relative">
                                <input
                                    className={controlClass}
                                    type="password"
                                    placeholder="Enter your password"
                                />

                                <FaEyeSlash className={iconClass} />
                            </div>
                        </div>

                        <div className="mb-[26px] flex items-center gap-2.5 text-[0.95rem] text-[#444]">
                            <input className="h-4 w-4" type="checkbox" id="remember" />

                            <label htmlFor="remember">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="mb-6 h-[54px] w-full cursor-pointer rounded-[10px] bg-[#8B0000] text-base font-bold text-white transition-colors duration-200 hover:bg-[#700000]"
                        >
                            Login
                        </button>

                        <div className="text-center text-[0.98rem] text-[#666]">
                            Don&apos;t have an account?{' '}

                            <Link
                                to="/register"
                                className="font-bold text-[#8B0000] no-underline"
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
