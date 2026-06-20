import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";
import { resolveFileUrl } from "../../../../api/uploadApi";

export default function MyHorses() {
    const [horses, setHorses] = useState([]);

    useEffect(() => {
        let mounted = true;
        ownerApi.getHorses({ pageSize: 2 })
            .then((res) => { if (mounted) setHorses(res.items || []); })
            .catch(() => { });
        return () => { mounted = false; };
    }, []);

    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>My Horses</h3>
                <button style={styles.viewAll}>View All</button>
            </div>

            <div style={styles.list}>
                {horses.length === 0 && <p style={{ color: '#705f5b', fontSize: '13px' }}>No horses yet</p>}
                {horses.map((horse) => (
                    <div key={horse.horseId} style={styles.card}>
                        {horse.imageUrl && (
                            <img src={resolveFileUrl(horse.imageUrl)} alt={horse.horseName} style={{ width: "100px", height: "70px", borderRadius: "8px", objectFit: "cover" }} />
                        )}
                        <div style={styles.info}>
                            <span style={styles.breed}>{horse.breedName || `Breed #${horse.breedId}`}</span>
                            <p style={styles.name}>{horse.horseName}</p>
                            <div style={styles.tags}>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: horse.healthStatus === "Healthy" ? "#dff7e9" : "#f5e1df",
                                    color: horse.healthStatus === "Healthy" ? "#118548" : "#860707",
                                }}>
                                    {horse.healthStatus}
                                </span>
                                <span style={styles.tag}>{horse.age} yrs</span>
                                <span style={styles.tag}>{horse.weightKg}kg</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fffefd", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    viewAll: { background: "none", border: "none", color: "#860707", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { display: "flex", gap: "12px", alignItems: "center", padding: "10px", borderRadius: "8px", border: "1px solid #edcfc9" },
    info: { display: "flex", flexDirection: "column", gap: "4px" },
    breed: { fontSize: "11px", color: "#705f5b", fontWeight: "600", textTransform: "uppercase" },
    name: { margin: 0, fontWeight: "bold", fontSize: "15px", color: "#2d2020" },
    tags: { display: "flex", gap: "6px", flexWrap: "wrap" },
    statusBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" },
    tag: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", backgroundColor: "#fff3ef", color: "#705f5b" },
};
