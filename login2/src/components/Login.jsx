import React from 'react';
import { Link } from 'react-router-dom';

import './Login.css';

import horseRacing from '../assets/horse-racing.jpg';
import icon from '../assets/icon.png';

import {
    FaEnvelope,
    FaEyeSlash,
    FaChevronDown
} from 'react-icons/fa';

const Login = () => {
    return (
        <div className="login-container">

            {/* LEFT SIDE */}
            <div className="hero-section">
                <img
                    src={horseRacing}
                    alt="Horse Racing"
                    className="hero-image"
                />

                <div className="overlay"></div>

                <div className="hero-content">
                    <h1>
                        Manage Horse Racing Tournaments Professionally
                    </h1>

                    <p>
                        The elite management platform for racing professionals.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="form-section">

                <div className="login-card">

                    {/* HEADER */}
                    <div className="card-header">

                        <div className="brand-logo">
                            <img
                                src={icon}
                                alt="Elite Racing League Logo"
                                className="logo-icon"
                            />

                            <h2>Elite Racing League</h2>
                        </div>

                        <p className="subtitle">
                            Horse Racing Tournament Management System
                        </p>
                    </div>

                    {/* FORM */}
                    <form className="login-form">

                        {/* ROLE */}
                        <div className="form-group">
                            <div className="select-wrapper">

                                <select defaultValue="">
                                    <option value="" disabled>
                                        Select Role
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

                        {/* EMAIL */}
                        <div className="form-group">

                            <label>Email Address</label>

                            <div className="input-wrapper">

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                />

                                <FaEnvelope className="input-icon" />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">

                            <div className="label-row">

                                <label>Password</label>

                                <a href="#" className="forgot-link">
                                    Forgot password
                                </a>
                            </div>

                            <div className="input-wrapper">

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                />

                                <FaEyeSlash className="input-icon" />
                            </div>
                        </div>

                        {/* REMEMBER */}
                        <div className="remember-row">
                            <input type="checkbox" id="remember" />

                            <label htmlFor="remember">
                                Remember me
                            </label>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            className="login-button"
                        >
                            Login
                        </button>

                        {/* REGISTER */}
                        <div className="register-prompt">

                            Don&apos;t have an account?{" "}

                            <Link
                                to="/register"
                                className="register-link"
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