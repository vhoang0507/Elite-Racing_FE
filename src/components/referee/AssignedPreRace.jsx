import { useState } from "react";
import {
    FaMapMarkerAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaEllipsisV,
} from "react-icons/fa";

import RefereeLayout from "./RefereeLayout";

import {
    preRaceTournaments,
    inspectionRegistry,
} from "../../data/refereeMockData";

function AssignedPreRace() {
    const [selectedRace, setSelectedRace] =
        useState(preRaceTournaments[0]);

    const [filter, setFilter] = useState("ALL");

    const filteredRegistry =
        filter === "ALL"
            ? inspectionRegistry
            : filter === "FLAGGED"
                ? inspectionRegistry.filter(
                    (horse) => horse.outcome === "PROHIBITED"
                )
                : inspectionRegistry.filter(
                    (horse) => horse.outcome === "PENDING"
                );

    const flaggedCount = inspectionRegistry.filter(
        (horse) => horse.outcome === "PROHIBITED"
    ).length;

    const pendingCount = inspectionRegistry.filter(
        (horse) => horse.outcome === "PENDING"
    ).length;

    return (
        <RefereeLayout activeKey="assigned-races">

            <div className="p-8">

                <h1 className="text-5xl font-bold text-[#7d0000]">
                    Pre-Race Inspections
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage inspections and rule violations
                    for assigned races.
                </p>

                {/* CARDS */}

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {preRaceTournaments.map((race) => (
                        <div
                            key={race.id}
                            onClick={() =>
                                setSelectedRace(race)
                            }
                            className={`cursor-pointer rounded-2xl border p-6 transition
                            ${selectedRace.id === race.id
                                    ? "border-[#7d0000] shadow-md"
                                    : "border-[#ead3cf]"
                                }`}
                        >
                            <div className="flex justify-between">

                                <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                    {race.status}
                                </span>

                                <span className="font-bold">
                                    {race.code}
                                </span>

                            </div>

                            <h2 className="mt-5 text-3xl font-semibold">
                                {race.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-gray-500">
                                <FaMapMarkerAlt />
                                {race.location}
                            </div>

                            <div className="mt-6 border-t pt-4">

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <div className="text-xs text-gray-400">
                                            TIME
                                        </div>

                                        <div className="font-semibold">
                                            {race.time}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-400">
                                            DISTANCE
                                        </div>

                                        <div className="font-semibold">
                                            {race.distance}
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}
                </div>

                {/* REGISTRY */}

                <div className="mt-10 overflow-hidden rounded-2xl border">

                    <div className="flex items-center justify-between border-b p-6">

                        <h2 className="text-3xl font-semibold">
                            Inspection Registry
                        </h2>

                        <div className="flex gap-2">

                            <button
                                onClick={() => setFilter("ALL")}
                                className={`rounded px-4 py-2 font-semibold ${filter === "ALL"
                                    ? "bg-[#7d0000] text-white"
                                    : "border"
                                    }`}
                            >
                                ALL ({inspectionRegistry.length})
                            </button>

                            <button
                                onClick={() => setFilter("FLAGGED")}
                                className={`rounded px-4 py-2 font-semibold ${filter === "FLAGGED"
                                    ? "bg-[#7d0000] text-white"
                                    : "border"
                                    }`}
                            >
                                FLAGGED ({flaggedCount})
                            </button>

                            <button
                                onClick={() => setFilter("PENDING")}
                                className={`rounded px-4 py-2 font-semibold ${filter === "PENDING"
                                    ? "bg-[#7d0000] text-white"
                                    : "border"
                                    }`}
                            >
                                PENDING ({pendingCount})
                            </button>

                        </div>

                    </div>

                    <table className="w-full">

                        <thead className="bg-[#faf6f5]">
                            <tr className="text-left">

                                <th className="p-4">
                                    HORSE
                                </th>

                                <th className="p-4">
                                    CHECKLIST
                                </th>

                                <th className="p-4">
                                    RULE REF
                                </th>

                                <th className="p-4">
                                    SEVERITY
                                </th>

                                <th className="p-4">
                                    VIOLATION DETAILS
                                </th>

                                <th className="p-4">
                                    OUTCOME
                                </th>

                                <th className="p-4">
                                    ACTION
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {filteredRegistry.map(
                                (horse) => (
                                    <tr
                                        key={horse.id}
                                        className="border-t"
                                    >
                                        <td className="p-4">

                                            <div className="font-bold">
                                                {
                                                    horse.horseName
                                                }
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                {
                                                    horse.registration
                                                }
                                            </div>

                                        </td>

                                        <td className="p-4">

                                            <div className="flex gap-1">

                                                {horse.checklist.map(
                                                    (
                                                        item,
                                                        idx
                                                    ) =>
                                                        item ? (
                                                            <FaCheckCircle
                                                                key={
                                                                    idx
                                                                }
                                                                className="text-green-600"
                                                            />
                                                        ) : (
                                                            <FaTimesCircle
                                                                key={
                                                                    idx
                                                                }
                                                                className="text-red-600"
                                                            />
                                                        )
                                                )}

                                            </div>

                                        </td>

                                        <td className="p-4">
                                            {horse.ruleRef}
                                        </td>

                                        <td className="p-4">
                                            {horse.severity}
                                        </td>

                                        <td className="p-4 max-w-xs">
                                            {
                                                horse.violation
                                            }
                                        </td>

                                        <td className="p-4">

                                            <span
                                                className={`font-semibold ${horse.outcome ===
                                                    "ALLOWED"
                                                    ? "text-green-600"
                                                    : horse.outcome ===
                                                        "PROHIBITED"
                                                        ? "text-red-600"
                                                        : "text-yellow-600"
                                                    }`}
                                            >
                                                {
                                                    horse.outcome
                                                }
                                            </span>

                                        </td>

                                        <td className="p-4">
                                            <FaEllipsisV />
                                        </td>
                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                    <div className="border-t p-4 text-sm text-gray-500">
                        Showing {filteredRegistry.length} of {inspectionRegistry.length} entries
                    </div>

                </div>

            </div>

        </RefereeLayout>
    );
}

export default AssignedPreRace;