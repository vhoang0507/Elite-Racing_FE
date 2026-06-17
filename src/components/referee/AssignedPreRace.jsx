import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import RefereeLayout from "./RefereeLayout";

import {
    preRaceTournaments,
} from "../../data/refereeMockData";

function AssignedPreRace() {
    const navigate = useNavigate();

    return (
        <RefereeLayout activeKey="assigned-races">

            <div className="p-8">

                <h1 className="text-5xl font-bold text-[#7d0000]">
                    Pre-Race Inspections
                </h1>

                <p className="mt-2 text-gray-600">
                    Select a race to manage inspections.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {preRaceTournaments.map((race) => (
                        <div
                            key={race.id}
                            onClick={() =>
                                navigate(
                                    `/referee/races/pre-race/${race.id}`
                                )
                            }
                            className="cursor-pointer rounded-2xl border border-[#ead3cf] bg-white p-6 transition hover:shadow-lg hover:border-[#7d0000]"
                        >
                            <div className="flex justify-between">

                                <span className="rounded-full bg-[#f7efee] px-3 py-1 text-xs font-semibold">
                                    {race.status}
                                </span>

                                <span className="font-bold">
                                    {race.code}
                                </span>

                            </div>

                            <h2 className="mt-5 text-2xl font-semibold">
                                {race.name}
                            </h2>

                            <div className="mt-3 flex items-center gap-2 text-gray-500">
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

            </div>

        </RefereeLayout>
    );
}

export default AssignedPreRace;