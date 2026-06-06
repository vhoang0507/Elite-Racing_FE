import { useState } from 'react';
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaRulerHorizontal,
    FaClock,
} from 'react-icons/fa';

import RefereeLayout from './RefereeLayout';

function RefereeAssignedRace() {
    const [activeTab, setActiveTab] = useState('inspection');

    const horses = [
        {
            id: 1,
            name: 'Galactic Steed',
            jockey: 'Sebastian Reid',
            breed: 'THOROUGHBRED',
            health: 'HEALTHY',
            status: 'PENDING',
        },
        {
            id: 2,
            name: 'Desert Rose',
            jockey: 'Elena Moretti',
            breed: 'ARABIAN PUREBRED',
            health: 'RESTING',
            status: 'PASSED',
        },
        {
            id: 3,
            name: 'Thunderbolt',
            jockey: 'Marcus Thorne',
            breed: 'THOROUGHBRED',
            health: 'HEALTHY',
            status: 'PENDING',
        },
    ];

    const results = [
        {
            rank: 1,
            horse: 'Galactic Steed',
            jockey: 'Sarah Jenkins',
            time: '132.45',
            score: '100',
        },
        {
            rank: 2,
            horse: 'Midnight Shadow',
            jockey: 'Marcus Aurelius',
            time: '132.98',
            score: '90',
        },
        {
            rank: 3,
            horse: 'Desert Rose',
            jockey: 'Elena Jane',
            time: '133.40',
            score: '80',
        },
        {
            rank: 4,
            horse: 'Thunderbolt',
            jockey: 'Lee Sang',
            time: '134.12',
            score: '70',
        },
    ];

    return (
        <RefereeLayout
            activeKey="assigned-races"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-[#7d0000]">
                        Assigned Races
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage inspections, race results, and rule violations for assigned races.
                    </p>
                </div>

                {/* Race Info */}
                <div className="mb-8 flex items-start justify-between">

                    <div>
                        <h2 className="text-5xl font-bold text-[#7d0000]">
                            Race 04 — Diamond Stakes
                        </h2>

                        <div className="mt-4 flex flex-wrap gap-6 text-gray-600">

                            <div className="flex items-center gap-2">
                                <FaCalendarAlt />
                                Oct 24, 2025
                            </div>

                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt />
                                Track A, Dubai
                            </div>

                            <div className="flex items-center gap-2">
                                <FaRulerHorizontal />
                                2400m
                            </div>

                        </div>
                    </div>

                    <button className="rounded-xl border border-[#8b0000] px-6 py-3 font-semibold text-[#8b0000]">
                        Referee Ready
                    </button>

                </div>

                {/* Tabs */}
                <div className="mb-10 flex gap-10 border-b">

                    <button
                        onClick={() => setActiveTab('inspection')}
                        className={`pb-4 font-semibold ${activeTab === 'inspection'
                            ? 'border-b-2 border-[#8b0000] text-[#8b0000]'
                            : ''
                            }`}
                    >
                        Pre-race Inspection
                    </button>

                    <button
                        onClick={() => setActiveTab('results')}
                        className={`pb-4 font-semibold ${activeTab === 'results'
                            ? 'border-b-2 border-[#8b0000] text-[#8b0000]'
                            : ''
                            }`}
                    >
                        Results
                    </button>

                    <button
                        onClick={() => setActiveTab('violations')}
                        className="pb-4 font-semibold"
                    >
                        Violations
                    </button>

                    <button
                        onClick={() => setActiveTab('report')}
                        className="pb-4 font-semibold"
                    >
                        Report
                    </button>

                </div>

                {/* INSPECTION TAB */}
                {activeTab === 'inspection' && (
                    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">

                        {/* Horse List */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-2xl font-bold">
                                    Horses to Inspect (3)
                                </h3>

                                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold">
                                    3 TOTAL
                                </span>
                            </div>

                            <div className="space-y-4">
                                {horses.map((horse) => (
                                    <div
                                        key={horse.id}
                                        className="rounded-2xl border bg-white p-5"
                                    >
                                        <div className="flex justify-between">

                                            <div>
                                                <h4 className="text-2xl font-bold">
                                                    {horse.name}
                                                </h4>

                                                <p className="mt-2 text-gray-600">
                                                    Jockey: {horse.jockey}
                                                </p>

                                                <p className="mt-3 text-sm font-semibold text-gray-400">
                                                    {horse.breed}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-right">

                                                <span className="block rounded bg-yellow-100 px-2 py-1 text-xs">
                                                    {horse.health}
                                                </span>

                                                <span className="block rounded bg-red-100 px-2 py-1 text-xs">
                                                    {horse.status}
                                                </span>

                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inspection Form */}
                        <div className="rounded-3xl border bg-white p-8">

                            <h3 className="text-4xl font-bold text-[#7d0000]">
                                Inspection Detail — Galactic Steed
                            </h3>

                            <p className="mt-2 text-gray-500">
                                Verify vitals and compliance for Race 04 entrance.
                            </p>

                            <div className="mt-8">
                                <label className="font-semibold">
                                    Physical Condition
                                </label>

                                <div className="mt-4 flex gap-10">
                                    <label>
                                        <input type="radio" name="condition" />
                                        <span className="ml-2">Passed</span>
                                    </label>

                                    <label>
                                        <input type="radio" name="condition" />
                                        <span className="ml-2">Pending Confirmation</span>
                                    </label>

                                    <label>
                                        <input type="radio" name="condition" />
                                        <span className="ml-2">Failed</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-10">
                                <label className="font-semibold">
                                    Inspection Notes
                                </label>

                                <textarea
                                    rows="8"
                                    className="mt-3 w-full rounded-2xl border p-4"
                                    placeholder="Enter detailed observation notes..."
                                />
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t pt-6">

                                <div className="flex items-center gap-2 text-gray-500">
                                    <FaClock />
                                    Last checked 2 mins ago
                                </div>

                                <div className="flex gap-4">

                                    <button className="rounded-xl border px-8 py-3">
                                        Save
                                    </button>

                                    <button className="rounded-xl bg-[#8b0000] px-8 py-3 text-white">
                                        Save & Next
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && (
                    <div>

                        <h3 className="mb-8 text-4xl font-bold text-[#7d0000]">
                            Enter & verify results
                        </h3>

                        <div className="overflow-hidden rounded-3xl border bg-white">

                            <table className="w-full">

                                <thead className="bg-[#faf5f4]">
                                    <tr>
                                        <th className="p-6 text-left">RANK</th>
                                        <th className="p-6 text-left">HORSE</th>
                                        <th className="p-6 text-left">FINISH TIME (S)</th>
                                        <th className="p-6 text-left">SCORE</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {results.map((item) => (
                                        <tr key={item.rank} className="border-t">

                                            <td className="p-6">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 font-bold">
                                                    {item.rank}
                                                </div>
                                            </td>

                                            <td className="p-6">
                                                <div className="font-bold">
                                                    {item.horse}
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    Jockey: {item.jockey}
                                                </div>
                                            </td>

                                            <td className="p-6">
                                                <input
                                                    defaultValue={item.time}
                                                    className="rounded-xl border px-4 py-3"
                                                />
                                            </td>

                                            <td className="p-6">
                                                <input
                                                    defaultValue={item.score}
                                                    className="rounded-xl border px-4 py-3"
                                                />
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

                {/* Placeholder Tabs */}
                {activeTab === 'violations' && (
                    <div className="rounded-2xl border bg-white p-10">
                        <h2 className="text-3xl font-bold">
                            Violations
                        </h2>
                        <p className="mt-3 text-gray-500">
                            Waiting for final design.
                        </p>
                    </div>
                )}

                {activeTab === 'report' && (
                    <div className="rounded-2xl border bg-white p-10">
                        <h2 className="text-3xl font-bold">
                            Report
                        </h2>
                        <p className="mt-3 text-gray-500">
                            Waiting for final design.
                        </p>
                    </div>
                )}

            </div>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;