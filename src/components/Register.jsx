import React from 'react';
import { Link } from 'react-router-dom';

import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';

import {
    FaChevronDown,
    FaEyeSlash,
} from 'react-icons/fa';

const formGroupClass = 'mb-5';
const labelClass = 'mb-2.5 block text-[0.9rem] font-extrabold text-[#1f3b57]';
const controlClass = 'h-[54px] w-full rounded-[10px] border border-[#e8caca] bg-white px-4 text-base outline-none focus:border-[#8B0000]';
const iconClass = 'absolute right-4 top-1/2 -translate-y-1/2 text-[#666]';

const Register = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f5f5f5] font-['Segoe_UI',sans-serif] max-[1024px]:h-auto max-[1024px]:min-h-screen max-[1024px]:flex-col max-[1024px]:overflow-auto">
            <div className="flex h-screen w-[58%] items-start justify-center overflow-y-auto bg-white px-[50px] py-[60px] max-[1024px]:min-h-screen max-[1024px]:w-full max-[1024px]:px-6 max-[1024px]:py-[30px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar]:w-2">
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

                    <h1 className="mb-4 text-[4rem] leading-[1.05] text-[#1f3b57] max-[1024px]:text-5xl">
                        Create Account
                    </h1>

                    <p className="mb-8 text-[1.15rem] leading-[1.6] text-[#555]">
                        Join the elite management platform for professional horse racing.
                    </p>

                    <form>
                        <div className={formGroupClass}>
                            <label className={labelClass}>ACCOUNT TYPE</label>

                            <div className="relative">
                                <select className={`${controlClass} appearance-none pr-[46px]`} defaultValue="">
                                    <option value="" disabled>
                                        Select your primary role
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
                            <label className={labelClass}>FULL NAME</label>

                            <input
                                className={controlClass}
                                type="text"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="flex gap-4 max-[1024px]:flex-col">
                            <div className={`${formGroupClass} flex-1`}>
                                <label className={labelClass}>EMAIL ADDRESS</label>

                                <input
                                    className={controlClass}
                                    type="email"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className={`${formGroupClass} flex-1`}>
                                <label className={labelClass}>PHONE NUMBER</label>

                                <input
                                    className={controlClass}
                                    type="text"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <a href="#" className="mb-5 inline-block text-[0.95rem] font-bold text-[#8B0000] no-underline">
                            Verify your email
                        </a>

                        <div className={formGroupClass}>
                            <label className={labelClass}>PASSWORD</label>

                            <div className="relative">
                                <input
                                    className={`${controlClass} pr-[46px]`}
                                    type="password"
                                    placeholder="Create a secure password"
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
                            />
                        </div>

                        <div className="mb-6 flex items-start gap-2.5 text-[0.92rem]">
                            <input className="mt-1 h-4 w-4" type="checkbox" id="terms" />

                            <label htmlFor="terms">
                                I agree to the{' '}
                                <a className="text-[#8B0000] no-underline" href="#">Terms of Service</a> and{' '}
                                <a className="text-[#8B0000] no-underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="mb-[22px] h-[54px] w-full cursor-pointer rounded-[10px] bg-[#a30000] text-base font-bold text-white"
                        >
                            Register Account
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

                <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />

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
