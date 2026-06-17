import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaMapMarkerAlt,
    FaClipboardList,
    FaCheckSquare,
} from "react-icons/fa";

import RefereeLayout from "./RefereeLayout";

import {
    postRaceData,
} from "../../data/refereeMockData";

function AssignedPostRace() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] =
        useState("ALL");

    const filteredRaces = (() => {
        switch (activeTab) {
            case "VERIFIED":
                return postRaceData.filter(
                    race => race.verified
                );

            case "INQUIRY":
                return postRaceData.filter(
                    race => race.inquiry
                );

            case "APPEAL":
                return postRaceData.filter(
                    race => race.appeal
                );

            default:
                return postRaceData;
        }
    })();

    return (
        <RefereeLayout activeKey="assigned-races">

            <div className="p-8">

                <h1 className="text-5xl font-bold text-[#7d0000]">
                    Post-Race
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage race results and rule violations
                    for assigned races.
                </p>

                {/* TABS */}

                <div className="mt-8 flex gap-10 border-b">

                    <button
                        onClick={() =>
                            setActiveTab("ALL")
                        }
                        className={`pb-4 font-medium ${activeTab === "ALL"
                            ? "border-b-2 border-[#7d0000] text-[#7d0000]"
                            : ""
                            }`}
                    >
                        All Concluded
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab("VERIFIED")
                        }
                        className={`pb-4 font-medium ${activeTab === "VERIFIED"
                            ? "border-b-2 border-[#7d0000] text-[#7d0000]"
                            : ""
                            }`}
                    >
                        Verified Results
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab("INQUIRY")
                        }
                        className={`pb-4 font-medium ${activeTab === "INQUIRY"
                            ? "border-b-2 border-[#7d0000] text-[#7d0000]"
                            : ""
                            }`}
                    >
                        Pending Inquiries
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab("APPEAL")
                        }
                        className={`pb-4 font-medium ${activeTab === "APPEAL"
                            ? "border-b-2 border-[#7d0000] text-[#7d0000]"
                            : ""
                            }`}
                    >
                        Violation Appeals
                    </button>

                </div>

                {/* RACES */}

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {filteredRaces.map((race) => (

                        <div
                            key={race.id}
                            className="rounded-2xl border border-[#ead3cf] bg-white p-6"
                        >

                            <div className="flex justify-between">

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold
                                    ${race.status === "COMPLETE"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {race.status}
                                </span>

                                <span className="font-bold">
                                    {race.code}
                                </span>

                            </div>

                            <h2 className="mt-5 text-2xl font-semibold">
                                {race.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-gray-500">
                                <FaMapMarkerAlt />
                                {race.location}
                            </div>

                            <div className="my-5 border-t" />

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <div className="text-xs text-gray-400">
                                        WINNING TIME
                                    </div>

                                    <div className="font-bold">
                                        {race.winningTime}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-400">
                                        TRACK CONDITION
                                    </div>

                                    <div className="font-bold">
                                        {race.trackCondition}
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 border-t pt-4 flex items-center justify-between">

                                <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium">

                                    {race.violations > 0
                                        ? `${race.violations} Violation${race.violations > 1
                                            ? "s"
                                            : ""
                                        }`
                                        : "No Violations"}

                                </div>

                                <button className="font-semibold text-[#7d0000]">
                                    VIEW RESULTS →
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

                {/* ACTION CARDS */}

                <div className="mt-12 grid gap-6 lg:grid-cols-2">

                    <div
                        onClick={() =>
                            navigate(
                                "/referee/races/post-race/violations"
                            )
                        }
                        className="cursor-pointer rounded-2xl border border-[#ead3cf] bg-white p-8 hover:shadow-lg"
                    >

                        <div className="mb-5 inline-flex rounded-xl bg-[#7d0000] p-4 text-white">
                            <FaClipboardList size={24} />
                        </div>

                        <h2 className="text-3xl font-semibold">
                            Violation & Penalty Log
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Review jockey conduct and equipment compliance records from the finish line.
                        </p>

                    </div>

                    <div
                        onClick={() =>
                            navigate(
                                "/referee/races/post-race/final-results"
                            )
                        }
                        className="cursor-pointer rounded-2xl border border-[#ead3cf] bg-white p-8 hover:shadow-lg"
                    >

                        <div className="mb-5 inline-flex rounded-xl bg-[#7d0000] p-4 text-white">
                            <FaCheckSquare size={24} />
                        </div>

                        <h2 className="text-3xl font-semibold">
                            Final Result Certification
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Seal and certify official race results.
                        </p>

                    </div>

                </div>

            </div>

        </RefereeLayout>
    );
}

export default AssignedPostRace;