import { useNavigate } from 'react-router-dom';
import {
    FaClipboardCheck,
    FaCheckCircle,
    FaGavel,
    FaTrophy,
    FaFileAlt,
    FaArrowRight,
} from 'react-icons/fa';

import RefereeLayout from './RefereeLayout';

function RefereeAssignedRace() {
    const navigate = useNavigate();

    return (
        <RefereeLayout
            activeKey="assigned-races"
            searchPlaceholder="Search records, horses, races..."
        >
            <div className="p-8">

                {/* HEADER */}
                <div className="mb-10">
                    <h1 className="text-5xl font-bold text-[#7d0000]">
                        Assigned Races
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Manage inspections, race results, and rule violations
                        for assigned races.
                    </p>
                </div>

                {/* CARDS */}
                <div className="grid gap-8 lg:grid-cols-2">

                    {/* PRE RACE */}
                    <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">

                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#faf5f4]">
                            <FaClipboardCheck
                                size={24}
                                className="text-[#7d0000]"
                            />
                        </div>

                        <h2 className="text-4xl font-bold text-[#2b1b1b]">
                            Pre-Race Inspection
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Execute essential technical inspections,
                            driver briefing verifications, and grid alignment
                            compliance. Ensure all safety protocols are met
                            before the green flag.
                        </p>

                        <div className="mt-8 space-y-4">

                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-gray-500" />
                                <span>Weight & Drug Test</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-gray-500" />
                                <span>Medical Clearances</span>
                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate('/referee/races/pre-race')
                            }
                            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl border border-[#7d0000] py-4 font-semibold text-[#7d0000] transition hover:bg-[#7d0000] hover:text-white"
                        >
                            Access Info & Reports
                            <FaArrowRight />
                        </button>

                    </div>

                    {/* POST RACE */}
                    <div className="rounded-2xl border border-[#ead3cf] bg-white p-8">

                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#faf5f4]">
                            <FaClipboardCheck
                                size={24}
                                className="text-[#7d0000]"
                            />
                        </div>

                        <h2 className="text-4xl font-bold text-[#2b1b1b]">
                            Post-Race
                        </h2>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Finalize official results, process stewards'
                            inquiries, and file violation reports.
                            Certify the podium and manage the formal
                            reporting pipeline.
                        </p>

                        <div className="mt-8 space-y-4">

                            <div className="flex items-center gap-3">
                                <FaGavel className="text-gray-500" />
                                <span>Violation & Penalty Log</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaTrophy className="text-gray-500" />
                                <span>Final Result Certification</span>
                            </div>



                        </div>

                        <button
                            onClick={() =>
                                navigate('/referee/races/post-race')
                            }
                            className="mt-10 flex w-full items-center justify-center gap-3 rounded-xl border border-[#7d0000] py-4 font-semibold text-[#7d0000] transition hover:bg-[#7d0000] hover:text-white"
                        >
                            Access Results & Reports
                            <FaArrowRight />
                        </button>

                    </div>

                </div>

            </div>
        </RefereeLayout>
    );
}

export default RefereeAssignedRace;