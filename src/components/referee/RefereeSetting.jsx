import { useState } from 'react';
import {
    FaCamera,
    FaLock,
    FaUser,
} from 'react-icons/fa';

import RefereeLayout from './RefereeLayout';

function RefereeSetting() {
    const [formData, setFormData] = useState({
        fullName: 'Ethan Crawford',
        email: 'm.thorne@erf.org',
        phone: '+1 (555) 924-1182',
        license: 'REF-9928-TX',
        experience: '10+ Years (Senior Level)',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <RefereeLayout
            activeKey="settings"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="min-h-screen bg-[#faf8f8] p-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-[#7d0000]">
                        Settings
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage referee account preferences, security,
                        notifications, and system appearance.
                    </p>
                </div>

                <div className="grid grid-cols-[220px_1fr] gap-6 max-lg:grid-cols-1">

                    {/* SIDEBAR */}
                    <div className="h-fit rounded-2xl border border-[#ead3cf] bg-white p-3">

                        <button
                            className="mb-2 flex w-full items-center gap-3 rounded-xl bg-[#f6dfdb] px-4 py-3 text-left font-semibold text-[#7d0000]"
                        >
                            <FaUser />
                            Profile Settings
                        </button>

                        <button
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <FaLock />
                            Account Security
                        </button>

                    </div>

                    {/* CONTENT */}
                    <div className="space-y-6">

                        {/* PROFILE CARD */}
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">

                            <h2 className="mb-8 border-l-4 border-[#7d0000] pl-4 text-2xl font-bold text-[#2b1b1b]">
                                Profile Settings
                            </h2>

                            {/* PROFILE HEADER */}
                            <div className="mb-8 flex items-center gap-5">

                                <div className="relative">

                                    <img
                                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
                                        alt="Profile"
                                        className="h-24 w-24 rounded-full object-cover"
                                    />

                                    <button
                                        className="absolute bottom-0 right-0 rounded-full bg-[#7d0000] p-2 text-white"
                                    >
                                        <FaCamera size={12} />
                                    </button>

                                </div>

                                <div>
                                    <h3 className="text-4xl font-bold text-[#7d0000]">
                                        Ethan Crawford
                                    </h3>

                                    <p className="text-gray-600">
                                        Update your public information and
                                        license details.
                                    </p>

                                    <button
                                        className="mt-2 font-semibold text-[#7d0000]"
                                    >
                                        Change Profile Photo
                                    </button>
                                </div>

                            </div>

                            <hr className="mb-8 border-[#ead3cf]" />

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                <div className="grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#ead3cf] px-4 py-3 outline-none focus:border-[#7d0000]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#ead3cf] px-4 py-3 outline-none focus:border-[#7d0000]"
                                        />
                                    </div>

                                </div>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#ead3cf] px-4 py-3 outline-none focus:border-[#7d0000]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                                            License Number
                                        </label>

                                        <input
                                            type="text"
                                            name="license"
                                            value={formData.license}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#ead3cf] bg-[#faf5f4] px-4 py-3 outline-none"
                                        />
                                    </div>

                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-600">
                                        Official Experience
                                    </label>

                                    <select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[#ead3cf] px-4 py-3 outline-none focus:border-[#7d0000]"
                                    >
                                        <option>
                                            1-3 Years (Junior Level)
                                        </option>

                                        <option>
                                            4-9 Years (Professional Level)
                                        </option>

                                        <option>
                                            10+ Years (Senior Level)
                                        </option>
                                    </select>
                                </div>

                                <hr className="border-[#ead3cf]" />

                                <div className="flex justify-end gap-4">

                                    <button
                                        type="button"
                                        className="rounded-xl border border-[#caa13a] px-8 py-3 font-semibold text-[#9c7b20]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#7d0000] px-8 py-3 font-semibold text-white"
                                    >
                                        Save Changes
                                    </button>

                                </div>

                            </form>
                        </div>

                        {/* SECURITY CARD */}
                        <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">

                            <h2 className="mb-8 border-l-4 border-[#7d0000] pl-4 text-2xl font-bold text-[#2b1b1b]">
                                Account Security
                            </h2>

                            <div className="flex justify-center">

                                <button
                                    className="rounded-xl border border-[#7d0000] px-8 py-3 font-semibold text-[#7d0000]"
                                >
                                    Update Password
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">

                    <span className="font-bold text-[#7d0000]">
                        Elite Racing League
                    </span>

                    <div className="flex gap-6">
                        <span>Terms of Service</span>
                        <span>Privacy Policy</span>
                        <span>Contact Support</span>
                        <span>Racing Rules</span>
                    </div>

                </div>

            </div>
        </RefereeLayout>
    );
}

export default RefereeSetting;