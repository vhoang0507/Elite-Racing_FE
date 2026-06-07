
const horses = [
    {
        name: "Shadow Dancer",
        breed: "THOROUGHBRED",
        status: "HEALTHY",
        age: "4 yrs",
        weight: "520kg",
        img: "/Horse1.jpg",
    },
    {
        name: "Gold Rush",
        breed: "ARABIAN",
        status: "INJURED",
        age: "5 yrs",
        weight: "540kg",
        img: "/Horse2.jpg",
    },
];

export default function MyHorses() {
    return (
        <section style={styles.section}>
            <div style={styles.header}>
                <h3 style={{ margin: 0 }}>My Horses</h3>
                <button style={styles.viewAll}>View All</button>
            </div>

            <div style={styles.list}>
                {horses.map((horse, i) => (
                    <div key={i} style={styles.card}>
                        <img
                            src={horse.img}
                            alt={horse.name}
                            style={{ width: "100px", height: "70px", borderRadius: "8px", objectFit: "cover" }}
                        />
                        <div style={styles.info}>
                            <span style={styles.breed}>{horse.breed}</span>
                            <p style={styles.name}>{horse.name}</p>
                            <div style={styles.tags}>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: horse.status === "HEALTHY" ? "#d4edda" : "#f8d7da",
                                    color: horse.status === "HEALTHY" ? "#155724" : "#721c24",
                                }}>
                                    {horse.status}
                                </span>
                                <span style={styles.tag}>{horse.age}</span>
                                <span style={styles.tag}>{horse.weight}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    viewAll: { background: "none", border: "none", color: "#8B0000", cursor: "pointer", fontSize: "13px" },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { display: "flex", gap: "12px", alignItems: "center", padding: "10px", borderRadius: "8px", border: "1px solid #f0f0f0" },
    info: { display: "flex", flexDirection: "column", gap: "4px" },
    breed: { fontSize: "11px", color: "#999", fontWeight: "600" },
    name: { margin: 0, fontWeight: "bold", fontSize: "15px" },
    tags: { display: "flex", gap: "6px", flexWrap: "wrap" },
    statusBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" },
    tag: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", backgroundColor: "#f5f5f5", color: "#555" },
};