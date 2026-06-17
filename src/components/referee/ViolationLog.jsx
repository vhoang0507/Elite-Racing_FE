import { useState } from "react";

import {
    FaGavel,
    FaEye,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaUser,
    FaFlag,
} from "react-icons/fa";

import RefereeLayout from "./RefereeLayout";

import {
    violationStats,
    violationIncidents,
} from "../../data/refereeMockData";

function ViolationLog() {
    const [selected, setSelected] = useState(
        violationIncidents[0]
    );

    return (
        <RefereeLayout activeKey="assigned-races">
            <div className="p-8">

                <h1 className="text-5xl font-bold text-[#7d0000]">
                    Violation & Penalty Log
                </h1>

                <p className="mt-2 text-gray-600">
                    Review violations, investigations,
                    penalties and steward actions.
                </p>

                {/* STATS */}

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-2xl border bg-white p-5">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">
                                TOTAL VIOLATIONS
                            </span>
                            <FaGavel />
                        </div>

                        <h2 className="mt-3 text-4xl font-bold">
                            {violationStats.totalViolations}
                        </h2>
                    </div>

                    <div className="rounded-2xl border bg-white p-5">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">
                                UNDER INVESTIGATION
                            </span>
                            <FaEye />
                        </div>

                        <h2 className="mt-3 text-4xl font-bold">
                            {violationStats.investigations}
                        </h2>
                    </div>

                    <div className="rounded-2xl border bg-white p-5">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">
                                PENALTIES ISSUED
                            </span>
                            <FaClipboardCheck />
                        </div>

                        <h2 className="mt-3 text-4xl font-bold">
                            {violationStats.penaltiesIssued}
                        </h2>
                    </div>

                    <div className="rounded-2xl border bg-white p-5">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">
                                APPEALS PENDING
                            </span>
                            <FaExclamationTriangle />
                        </div>

                        <h2 className="mt-3 text-4xl font-bold">
                            {violationStats.appealsPending}
                        </h2>
                    </div>

                </div>

                {/* CONTENT */}

                <div className="mt-8 grid grid-cols-12 gap-6">

                    {/* LEFT */}

                    <div className="col-span-12 xl:col-span-8">

                        <div className="rounded-2xl border bg-white">

                            <div className="border-b p-5">
                                <h2 className="text-2xl font-semibold">
                                    Recent Incidents
                                </h2>
                            </div>

                            {violationIncidents.map(
                                (incident) => (
                                    <div
                                        key={incident.id}
                                        onClick={() =>
                                            setSelected(
                                                incident
                                            )
                                        }
                                        className={`cursor-pointer border-b p-5 hover:bg-gray-50 ${selected.id ===
                                            incident.id
                                            ? "bg-red-50"
                                            : ""
                                            }`}
                                    >
                                        <div className="flex justify-between">

                                            <div>

                                                <div className="flex gap-2">

                                                    <span className="rounded bg-red-700 px-2 py-1 text-xs text-white">
                                                        {
                                                            incident.severity
                                                        }
                                                    </span>

                                                    <span className="text-xs text-gray-500">
                                                        {
                                                            incident.id
                                                        }
                                                    </span>

                                                </div>

                                                <h3 className="mt-2 text-lg font-semibold">
                                                    {
                                                        incident.title
                                                    }
                                                </h3>

                                                <p className="mt-1 text-gray-600">
                                                    {
                                                        incident.description
                                                    }
                                                </p>

                                            </div>

                                            <span className="text-sm text-gray-400">
                                                {
                                                    incident.time
                                                }
                                            </span>

                                        </div>
                                    </div>
                                )
                            )}

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="col-span-12 xl:col-span-4">

                        <div className="rounded-2xl border bg-white p-6 sticky top-6">

                            <h2 className="text-2xl font-bold">
                                Incident Details
                            </h2>

                            <div className="mt-6 space-y-4">

                                <div>
                                    <div className="text-xs text-gray-500">
                                        INCIDENT
                                    </div>

                                    <div className="font-semibold">
                                        {
                                            selected.title
                                        }
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">
                                        REFERENCE
                                    </div>

                                    <div>
                                        {selected.id}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaUser />

                                    {selected.jockey}
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaFlag />

                                    {selected.race}
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">
                                        STATUS
                                    </div>

                                    <div className="font-semibold text-[#7d0000]">
                                        {
                                            selected.status
                                        }
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">
                                        DESCRIPTION
                                    </div>

                                    <p className="mt-2 text-gray-600">
                                        {
                                            selected.description
                                        }
                                    </p>
                                </div>

                            </div>

                            <div className="mt-8 flex flex-col gap-3">

                                <button className="rounded-xl bg-[#7d0000] px-4 py-3 text-white">
                                    Issue Penalty
                                </button>

                                <button className="rounded-xl border px-4 py-3">
                                    Request Review
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </RefereeLayout>
    );
}

export default ViolationLog;