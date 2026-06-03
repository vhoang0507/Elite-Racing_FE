import React from 'react';
import { Link } from 'react-router-dom';

import './Register.css';

import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';

import {
    FaChevronDown,
    FaEyeSlash
} from 'react-icons/fa';

const Register = () => {
    return (
        <div className="register-container">

            {/* LEFT SIDE FORM */}
            <div className="register-form-section">

                <div className="register-card">

                    {/* LOGO */}
                    <div className="brand-logo">

                        <img
                            src={icon}
                            alt="Elite Racing League Logo"
                            className="logo-icon"
                        />

                        <h2>Elite Racing League</h2>
                    </div>

                    {/* HEADING */}
                    <h1>Create Account</h1>

                    <p className="subtitle">
                        Join the elite management platform for professional horse racing.
                    </p>

                    {/* FORM */}
                    <form className="register-form">

                        {/* ACCOUNT TYPE */}
                        <div className="form-group">

                            <label>ACCOUNT TYPE</label>

                            <div className="select-wrapper">

                                <select defaultValue="">
                                    <option value="" disabled>
                                        Select your primary role
                                    </option>

                                    <option value="referee">
                                        Referee
                                    </option>

                                    <option value="jockey">
                                        Jockey
                                    </option>

                                    <option value="spectator">
                                        Spectator
                                    </option>

                                    <option value="horse-owner">
                                        Horse Owner
                                    </option>
                                </select>

                                <FaChevronDown className="input-icon" />
                            </div>
                        </div>

                        {/* FULL NAME */}
                        <div className="form-group">

                            <label>FULL NAME</label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* EMAIL + PHONE */}
                        <div className="double-row">

                            <div className="form-group">

                                <label>EMAIL ADDRESS</label>

                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className="form-group">

                                <label>PHONE NUMBER</label>

                                <input
                                    type="text"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* VERIFY */}
                        <a href="#" className="verify-link">
                            Verify your email
                        </a>

                        {/* PASSWORD */}
                        <div className="form-group">

                            <label>PASSWORD</label>

                            <div className="input-wrapper">

                                <input
                                    type="password"
                                    placeholder="Create a secure password"
                                />

                                <FaEyeSlash className="input-icon" />
                            </div>

                            <div className="password-strength">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>

                            <p className="password-hint">
                                Must be at least 8 characters
                            </p>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="form-group">

                            <label>CONFIRM PASSWORD</label>

                            <input
                                type="password"
                                placeholder="Confirm your password"
                            />
                        </div>

                        {/* TERMS */}
                        <div className="terms-row">

                            <input type="checkbox" id="terms" />

                            <label htmlFor="terms">
                                I agree to the{" "}
                                <a href="#">Terms of Service</a> and{" "}
                                <a href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            className="register-button"
                        >
                            Register Account
                        </button>

                        {/* FOOTER */}
                        <div className="bottom-links">

                            <a href="#">
                                ← Back to Home
                            </a>

                            <span>
                                Already have an account?{" "}

                                <Link to="/">
                                    Log in
                                </Link>
                            </span>

                        </div>

                    </form>
                </div>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <div className="register-hero-section">

                <img
                    src={horseRacing}
                    alt="Horse Racing"
                    className="hero-image"
                />

                <div className="overlay"></div>

                <div className="hero-content">

                    <h1>
                        Command the Track.
                    </h1>

                    <p>
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