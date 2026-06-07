import { useEffect, useState } from "react";
import { ownerApi } from "../../../../api/ownerApi";

const healthColor = {
    Healthy: { bg: "#dff7e9", color: "#118548" },
    Injured: { bg: "#f5e1df", color: "#860707" },
    Training: { bg: "#fff3cd", color: "#856404" },
};

export default function HorseTable() {
    const [horses, setHorses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const pageSize = 5;

    const fetchHorses = (p = page, s = search) => {
        ownerApi.getHorses({ page: p, pageSize, search: s || undefined })
            .then((res) => {
                setHorses(res.items || []);
                setTotalPages(res.totalPages || 1);
                setTotalItems(res.totalItems || 0);
            })
            .catch(() => {});
    };

    useEffect(() => { fetchHorses(); }, [page]);

    const handleSearch = () => { setPage(1); fetchHorses(1, search); };

    return (
        <div style={styles.wrapper}>
            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <input
                    placeholder="Search horse name..."
                    style={styles.search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button style={styles.filterBtn} onClick={handleSearch}>Filter</button>
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
                    {horses.length === 0 && (
                        <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#705f5b' }}>No horses found</td></tr>
                    )}
                    {horses.map((horse) => (
                        <tr key={horse.horseId} style={styles.tr}>
                            <td style={styles.td}>
                                <div style={styles.horseName}>
                                    {horse.imageUrl && <img src={horse.imageUrl} alt={horse.horseName} style={styles.horseImg} />}
                                    <span style={{ fontWeight: 'bold' }}>{horse.horseName}</span>
                                </div>
                            </td>
                            <td style={styles.td}>{horse.breedName}</td>
                            <td style={styles.td}>{horse.age}y</td>
                            <td style={styles.td}>{horse.heightCm} cm</td>
                            <td style={styles.td}>{horse.weightKg} kg</td>
                            <td style={styles.td}>
                                <span style={{ ...styles.badge, ...(healthColor[horse.healthStatus] || { bg: '#f5f5f5', color: '#555' }) }}>
                                    {horse.healthStatus}
                                </span>
                            </td>
                            <td style={styles.td}>
                                <span style={{ ...styles.badge, backgroundColor: horse.isActive ? '#dff7e9' : '#f5e1df', color: horse.isActive ? '#118548' : '#860707' }}>
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
                <span style={styles.pageInfo}>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} horses</span>
                <div style={styles.pages}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} style={{ ...styles.pageBtn, ...(n === page ? styles.activePage : {}) }} onClick={() => setPage(n)}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: { backgroundColor: "#fffefd", borderRadius: "12px", padding: "20px", border: "1px solid #edcfc9" },
    filterBar: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
    search: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #edcfc9", fontSize: "13px", flex: 1 },
    filterBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #edcfc9", fontSize: "13px", cursor: "pointer", backgroundColor: "#fffefd" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", color: "#705f5b", fontWeight: "600", textTransform: "uppercase", borderBottom: "1px solid #edcfc9" },
    tr: { borderBottom: "1px solid #f5f0ee" },
    td: { padding: "12px", fontSize: "14px", color: "#2d2020" },
    horseName: { display: "flex", alignItems: "center", gap: "10px" },
    horseImg: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" },
    badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "4px" },
    pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
    pageInfo: { fontSize: "13px", color: "#705f5b" },
    pages: { display: "flex", gap: "6px" },
    pageBtn: { width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #edcfc9", background: "#fffefd", cursor: "pointer", fontSize: "13px" },
    activePage: { backgroundColor: "#860707", color: "#fff", border: "none" },
};
