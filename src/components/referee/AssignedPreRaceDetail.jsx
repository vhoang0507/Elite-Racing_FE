import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaEllipsisV,
} from "react-icons/fa";

import RefereeLayout from "./RefereeLayout";

import {
    preRaceTournaments,
    inspectionRegistry,
} from "../../data/refereeMockData";

function AssignedPreRaceDetail() {
    const { raceId } = useParams();

    const race = preRaceTournaments.find(
        (r) => r.id === Number(raceId)
    );

    const [filter, setFilter] = useState("ALL");

    const filteredRegistry =
        filter === "ALL"
            ? inspectionRegistry
            : filter === "FLAGGED"
                ? inspectionRegistry.filter(
                    (horse) =>
                        horse.outcome === "PROHIBITED"
                )
                : inspectionRegistry.filter(
                    (horse) =>
                        horse.outcome === "PENDING"
                );

    const flaggedCount =
        inspectionRegistry.filter(
            (horse) =>
                horse.outcome === "PROHIBITED"
        ).length;

    const pendingCount =
        inspectionRegistry.filter(
            (horse) =>
                horse.outcome === "PENDING"
        ).length;

    return (
        <RefereeLayout activeKey="assigned-races">

            <div className="p-8">

                <h1 className="text-4xl font-bold text-[#7d0000]">
                    {race?.name}
                </h1>

                <p className="mt-2 text-gray-500">
                    {race?.location}
                </p>

                <div className="mt-8 overflow-hidden rounded-2xl border">

                    <div className="flex items-center justify-between border-b p-6">

                        <h2 className="text-3xl font-semibold">
                            Inspection Registry
                        </h2>

                        <div className="flex gap-2">

                            <button
                                onClick={() =>
                                    setFilter("ALL")
                                }
                                className={`rounded px-4 py-2 ${filter === "ALL"
                                    ? "bg-[#7d0000] text-white"
                                    : "border"
                                    }`}
                            >
                                ALL (40)
                            </button>

                            <button
                                onClick={() =>
                                    setFilter("FLAGGED")
                                }
                                className={`rounded px-4 py-2 ${filter === "FLAGGED"
                                    ? "bg-[#7d0000] text-white"
                                    : "border"
                                    }`}
                            >
                                FLAGGED ({flaggedCount})
                            </button>

                            <button
                                onClick={() =>
                                    setFilter("PENDING")
                                }
                                className={`rounded px-4 py-2 ${filter === "PENDING"
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
                            <tr>
                                <th className="p-4 text-left">
                                    HORSE
                                </th>
                                <th className="p-4 text-left">
                                    CHECKLIST
                                </th>
                                <th className="p-4 text-left">
                                    RULE REF
                                </th>
                                <th className="p-4 text-left">
                                    SEVERITY
                                </th>
                                <th className="p-4 text-left">
                                    VIOLATION
                                </th>
                                <th className="p-4 text-left">
                                    OUTCOME
                                </th>
                                <th className="p-4 text-left">
                                    ACTION
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredRegistry.map((horse) => (
                                <tr
                                    key={horse.id}
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        <div className="font-bold">
                                            {horse.horseName}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {horse.registration}
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

                                    <td className="p-4">
                                        {horse.violation}
                                    </td>

                                    <td className="p-4">
                                        {horse.outcome}
                                    </td>

                                    <td className="p-4">
                                        <FaEllipsisV />
                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </RefereeLayout>
    );
}

export default AssignedPreRaceDetail;