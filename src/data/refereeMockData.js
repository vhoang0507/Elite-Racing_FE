export const preRaceTournaments = [
    {
        id: 1,
        code: "R-04",
        status: "LIVE",
        name: "Dubai Series Cup - Race 04",
        location: "Meydan Racecourse, Dubai",
        time: "14:30 GST",
        distance: "1,500m (Dirt)",
    },
    {
        id: 2,
        code: "R-05",
        status: "PRE-RACE",
        name: "Emirates Champions Stakes",
        location: "Meydan Racecourse, Dubai",
        time: "15:15 GST",
        distance: "2,400m (Turf)",
    },
    {
        id: 3,
        code: "R-06",
        status: "SCHEDULED",
        name: "Desert Sprint Handicap",
        location: "Al Ain Racecourse, UAE",
        time: "16:00 GST",
        distance: "1,000m (Turf)",
    },
    {
        id: 4,
        code: "R-07",
        status: "PRE-RACE",
        name: "Arabian Derby Classic",
        location: "Abu Dhabi Racecourse, UAE",
        time: "17:30 GST",
        distance: "2,200m (Dirt)",
    },
    {
        id: 5,
        code: "R-08",
        status: "LIVE",
        name: "Golden Falcon Stakes",
        location: "Jebel Ali Racecourse",
        time: "18:00 GST",
        distance: "1,800m (Turf)",
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