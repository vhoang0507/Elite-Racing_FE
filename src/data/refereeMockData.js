export const preRaceTournaments = [
    {
        id: 1,
        code: "R-04",
        status: "LIVE",
        name: "Dubai Series Cup - Race 04",
        location: "Meydan Racecourse, Dubai",
        time: "14:30 GST",
        distance: "1,500m",
    },
    {
        id: 2,
        code: "R-05",
        status: "PRE-RACE",
        name: "Emirates Champions Stakes",
        location: "Meydan Racecourse, Dubai",
        time: "15:15 GST",
        distance: "2,400m",
    },
    {
        id: 3,
        code: "R-06",
        status: "SCHEDULED",
        name: "Desert Sprint Handicap",
        location: "Al Ain Racecourse, UAE",
        time: "16:00 GST",
        distance: "1,000m",
    },
    {
        id: 4,
        code: "R-07",
        status: "PRE-RACE",
        name: "Arabian Derby Classic",
        location: "Abu Dhabi Racecourse, UAE",
        time: "17:30 GST",
        distance: "2,200m",
    },
    {
        id: 5,
        code: "R-08",
        status: "LIVE",
        name: "Golden Falcon Stakes",
        location: "Jebel Ali Racecourse",
        time: "18:00 GST",
        distance: "1,800m",
    },
];

export const inspectionRegistry = Array.from(
    { length: 40 },
    (_, index) => {
        const id = index + 1;

        const statuses = ["ALLOWED", "PROHIBITED", "PENDING"];

        const outcome = statuses[index % 3];

        return {
            id,

            horseName: `Horse ${id}`,

            registration: `#REG-2024-${String(id).padStart(
                4,
                "0"
            )}`,

            owner: `Owner ${id}`,

            ruleRef:
                outcome === "ALLOWED"
                    ? "N/A"
                    : `Rule ${id}.${id}`,

            severity:
                outcome === "PROHIBITED"
                    ? "HIGH"
                    : outcome === "PENDING"
                        ? "MEDIUM"
                        : "-",

            violation:
                outcome === "ALLOWED"
                    ? "Full compliance with technical and health standards."
                    : outcome === "PROHIBITED"
                        ? `Violation detected for Horse ${id}.`
                        : "Awaiting referee confirmation.",

            outcome,

            checklist: [
                true,
                true,
                outcome !== "PROHIBITED",
                true,
            ],
        };
    }
);

export const postRaceData = [
    {
        id: 1,
        code: "R-04",
        name: "Dubai Series Cup – Race 04",
        location: "Meydan Racecourse, Dubai",
        status: "COMPLETE",
        winningTime: "2:14.42",
        trackCondition: "Good to Firm",
        violations: 2,
        verified: true,
        inquiry: false,
        appeal: false,
    },

    {
        id: 2,
        code: "R-05",
        name: "Emirates Champions Stakes",
        location: "Meydan Racecourse, Dubai",
        status: "RESULTS PENDING",
        winningTime: "1:58.30",
        trackCondition: "Standard (Dirt)",
        violations: 0,
        verified: false,
        inquiry: true,
        appeal: false,
    },

    {
        id: 3,
        code: "R-06",
        name: "Desert Sprint Handicap",
        location: "Meydan Racecourse, Dubai",
        status: "COMPLETE",
        winningTime: "1:02.11",
        trackCondition: "Yielding",
        violations: 1,
        verified: true,
        inquiry: false,
        appeal: true,
    },

    {
        id: 4,
        code: "R-07",
        name: "Dubai Gold Cup",
        location: "Meydan Racecourse, Dubai",
        status: "COMPLETE",
        winningTime: "3:21.05",
        trackCondition: "Fast (Dirt)",
        violations: 0,
        verified: true,
        inquiry: false,
        appeal: false,
    },

    {
        id: 5,
        code: "R-08",
        name: "Arabian Derby Classic",
        location: "Abu Dhabi Racecourse, UAE",
        status: "RESULTS PENDING",
        winningTime: "2:05.88",
        trackCondition: "Good",
        violations: 3,
        verified: false,
        inquiry: true,
        appeal: true,
    },
];
export const violationStats = {
    totalViolations: 142,
    investigations: 8,
    penaltiesIssued: 124,
    appealsPending: 3,
};

export const violationIncidents = [
    {
        id: "IVR-2024-081",
        severity: "SEVERE",
        title: "Dangerous Interference - Turn 4",
        description:
            "Incident involving jockey M. Ross and P. Henderson during the final furlong.",
        jockey: "Marcus Ross",
        race: "Royal Ascot - Race 5",
        status: "ACTION REQUIRED",
        time: "14 mins ago",
    },

    {
        id: "IVR-2024-080",
        severity: "MODERATE",
        title: "Excessive Whip Use",
        description:
            "Automated flag triggered at the 200m mark.",
        jockey: "Sarah Jenkins",
        race: "Race 04",
        status: "LOGGED",
        time: "1 hr ago",
    },

    {
        id: "IVR-2024-079",
        severity: "MINOR",
        title: "Incorrect Weight Declaration",
        description:
            "Post-race scale variance detected.",
        jockey: "Lee Sang",
        race: "Race 06",
        status: "LOGGED",
        time: "2 hrs ago",
    },

    {
        id: "IVR-2024-078",
        severity: "SEVERE",
        title: "Illegal Substance Detected",
        description:
            "Sample positive for prohibited substance.",
        jockey: "Helena Vance",
        race: "Race 03",
        status: "ACTION REQUIRED",
        time: "4 hrs ago",
    },

    {
        id: "IVR-2024-077",
        severity: "MODERATE",
        title: "Late To Paddock",
        description:
            "Entry arrived after official paddock call.",
        jockey: "Marcus Ross",
        race: "Race 05",
        status: "LOGGED",
        time: "6 hrs ago",
    },
];