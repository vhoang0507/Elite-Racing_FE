const horses = [
    { name: "Desert Thunder", img: "/Horse1.jpg", breed: "Arabian", age: "5y", height: "155 cm", weight: "520 kg", health: "Healthy", status: "ACTIVE" },
    { name: "Shadow Flame", img: "/Horse2.jpg", breed: "Thoroughbred", age: "4y", height: "170 cm", weight: "495 kg", health: "Injured", status: "INACTIVE" },
    { name: "Silver Arrow", img: "/Horse1.jpg", breed: "Mustang", age: "6y", height: "160 cm", weight: "510 kg", health: "Training", status: "ACTIVE" },
    { name: "Storm King", img: "/Horse2.jpg", breed: "Thoroughbred", age: "3y", height: "172 cm", weight: "486 kg", health: "Healthy", status: "ACTIVE" },
    { name: "Royal Highness", img: "/Horse1.jpg", breed: "Andalusian", age: "7y", height: "160 cm", weight: "540 kg", health: "Healthy", status: "ACTIVE" },
];

const healthColor = {
    Healthy: { bg: "#d4edda", color: "#155724" },
    Injured: { bg: "#f8d7da", color: "#721c24" },
    Training: { bg: "#fff3cd", color: "#856404" },
};

const statusColor = {
    ACTIVE: { bg: "#d4edda", color: "#155724" },
    INACTIVE: { bg: "#f8d7da", color: "#721c24" },
};

export default function HorseTable() {
    return (
        <div style={styles.wrapper}>
            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <input placeholder="Search horse name..." style={styles.search} />
                <select style={styles.select}><option>All Breeds</option></select>
                <select style={styles.select}><option>Health Status</option></select>
                <button style={styles.filterBtn}>Filter</button>
                <select style={styles.select}><option>Sort by: Name</option></select>
            </div>

            {/* Table */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Horse Name", "Breed", "Age", "Height", "Weight", "Health Status", "Status", "Action"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {horses.map((horse, i) => (
                        <tr key={i} style={styles.tr}>
                            <td style={styles.td}>
                                <div style={styles.horseName}>
                                    <img src={horse.img} alt={horse.name} style={styles.horseImg} />
                                    <span>{horse.name}</span>
                                </div>
                            </td>
                            <td style={styles.td}>{horse.breed}</td>
                            <td style={styles.td}>{horse.age}</td>
                            <td style={styles.td}>{horse.height}</td>
                            <td style={styles.td}>{horse.weight}</td>
                            <td style={styles.td}>
                                <span style={{ ...styles.badge, ...healthColor[horse.health] }}>
                                    {horse.health}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <span style={{ ...styles.badge, ...statusColor[horse.status] }}>
                                    {horse.status}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <button style={styles.iconBtn}>👁</button>
                                <button style={styles.iconBtn}>✏️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div style={styles.pagination}>
                <span style={styles.pageInfo}>Showing 1 to 5 of 12 horses</span>
                <div style={styles.pages}>
                    {[1, 2, 3, 4].map(n => (
                        <button key={n} style={{ ...styles.pageBtn, ...(n === 1 ? styles.activePage : {}) }}>
                            {n}
                        </button>
                    ))}
                    <button style={styles.pageBtn}>›</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    filterBar: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
    search: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", flex: 1 },
    select: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", cursor: "pointer" },
    filterBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", cursor: "pointer", backgroundColor: "#fff" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#999", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #eee" },
    tr: { borderBottom: "1px solid #f5f5f5" },
    td: { padding: "12px", fontSize: "14px" },
    horseName: { display: "flex", alignItems: "center", gap: "10px" },
    horseImg: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" },
    badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "4px" },
    pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
    pageInfo: { fontSize: "13px", color: "#999" },
    pages: { display: "flex", gap: "6px" },
    pageBtn: { width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" },
    activePage: { backgroundColor: "#8B0000", color: "#fff", border: "none" },
};