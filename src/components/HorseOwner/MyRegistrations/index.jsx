import { useState, useRef } from "react";
import HorseOwnerLayout from "../HorseOwnerLayout";
import OpenTournaments from "./components/OpenTournaments";
import PendingRegistrations from "./components/PendingRegistrations";
import ApprovedRegistrations from "./components/ApprovedRegistrations";
import RegistrationJourney from "./components/RegistrationJourney";

export default function MyRegistrations() {
    const [journeyId, setJourneyId] = useState(null);
    const journeyRef = useRef(null);

    const handleViewStatus = (registrationId) => {
        setJourneyId(registrationId);
        setTimeout(() => {
            journeyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    return (
        <HorseOwnerLayout activeKey="registrations">
            <section className="grid gap-7 px-11 py-9 max-[980px]:px-5 max-[980px]:py-7">
                <div>
                    <h2 className="m-0 text-[1.8rem] text-[var(--admin-primary-dark)]">Registration Central</h2>
                    <p className="m-0 mt-1 text-[0.85rem] text-[var(--admin-muted)]">
                        Manage your horse entries for the season's most prestigious equine events.
                    </p>
                </div>

                <OpenTournaments />
                <PendingRegistrations onViewStatus={handleViewStatus} />
                <ApprovedRegistrations onViewStatus={handleViewStatus} />
                <div ref={journeyRef}>
                    <RegistrationJourney registrationId={journeyId} />
                </div>
            </section>
        </HorseOwnerLayout>
    );
}
