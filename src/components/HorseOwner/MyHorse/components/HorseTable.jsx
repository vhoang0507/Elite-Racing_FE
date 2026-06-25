import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import { resolveFileUrl } from "../../../../api/uploadApi";

const healthColor = {
    Healthy: { bg: "#d4edda", color: "#155724" },
    Injured: { bg: "#f8d7da", color: "#721c24" },
    UnderTraining: { bg: "#fff3cd", color: "#856404" },
};

export default function HorseTable() {
    const navigate = useNavigate();
    const [horses, setHorses] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const [filters, setFilters] = useState({
        search: "", breedId: "", healthStatus: "", status: "", sortBy: "name",
    });

    const fetchHorses = async (f = filters, p = page) => {
        setLoading(true);
        try {
            const res = await ownerApi.getHorses({
                search: f.search || undefined,
                breedId: f.breedId || undefined,
                healthStatus: f.healthStatus || undefined,
                status: f.status || undefined,
                sortBy: f.sortBy || undefined,
                page: p,
                pageSize,
            });
            setHorses(res.items ?? res ?? []);
            setTotal(res.totalItems ?? res.totalCount ?? res.length ?? 0);
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                setHorses([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        ownerApi.getHorseBreeds().then(setBreeds).catch(() => { });
    }, []);

    useEffect(() => {
        fetchHorses(filters, page);
    }, [page]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFilter = () => {
        setPage(1);
        fetchHorses(filters, 1);
    };

    const handleToggleStatus = async (horse) => {
        try {
            await ownerApi.updateHorseStatus(horse.horseId, !horse.isActive);
            fetchHorses(filters, page);
        } catch (err) {
            handleOwnerAccessError(err, navigate);
        }
    };

    const handleDeleteHorse = async (horseId) => {
        if (!window.confirm("Are you sure you want to permanently delete this horse? This action cannot be undone.")) return;
        try {
            await ownerApi.deleteHorse(horseId);
            fetchHorses(filters, page);
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                alert(err.message || "Failed to delete horse.");
            }
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div style={styles.wrapper}>
            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search horse name..."
                    style={styles.search}
                />
                <select name="breedId" value={filters.breedId} onChange={handleFilterChange} style={styles.select}>
                    <option value="">All Breeds</option>
                    {breeds.map(b => (
                        <option key={b.breedId} value={b.breedId}>{b.breedName}</option>
                    ))}
                </select>
                <select name="healthStatus" value={filters.healthStatus} onChange={handleFilterChange} style={styles.select}>
                    <option value="">Health Status</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Injured">Injured</option>
                    <option value="UnderTraining">Under Training</option>
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} style={styles.select}>
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button onClick={handleFilter} style={styles.filterBtn}>Filter</button>
                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} style={styles.select}>
                    <option value="name">Sort by: Name</option>
                    <option value="age">Sort by: Age</option>
                    <option value="weight">Sort by: Weight</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>
            ) : (
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
                            <tr key={horse.horseId ?? i} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={styles.horseName}>
                                        <img
                                            src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : "/Horse1.jpg"}
                                            alt={horse.horseName}
                                            style={styles.horseImg}
                                        />
                                        <span>{horse.horseName}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{horse.breedName}</td>
                                <td style={styles.td}>{horse.age}y</td>
                                <td style={styles.td}>{horse.heightCm ? `${horse.heightCm} cm` : "-"}</td>
                                <td style={styles.td}>{horse.weightKg} kg</td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.badge, ...(healthColor[horse.healthStatus] ?? {}) }}>
                                        {horse.healthStatus}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: horse.isActive ? "#d4edda" : "#f8d7da",
                                        color: horse.isActive ? "#155724" : "#721c24",
                                    }}>
                                        {horse.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        title="View"
                                        onClick={() => navigate(`/owner/horses/${horse.horseId}`)}
                                        style={styles.iconBtn}
                                    >
                                        👁
                                    </button>
                                    <button
                                        title="Edit"
                                        onClick={() => navigate(`/owner/horses/${horse.horseId}/edit`)}
                                        style={{ ...styles.iconBtn, color: "#1a73e8" }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        title="Delete"
                                        onClick={() => handleDeleteHorse(horse.horseId)}
                                        style={{ ...styles.iconBtn, color: "#d32f2f" }}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {horses.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#999" }}>
                                    No horses found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            <div style={styles.pagination}>
                <span style={styles.pageInfo}>
                    Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} horses
                </span>
                <div style={styles.pages}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            style={{ ...styles.pageBtn, ...(n === page ? styles.activePage : {}) }}
                        >
                            {n}
                        </button>
                    ))}
                    {page < totalPages && (
                        <button onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>›</button>
                    )}
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
    toggleBtn: { border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
    pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
    pageInfo: { fontSize: "13px", color: "#999" },
    pages: { display: "flex", gap: "6px" },
    pageBtn: { width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" },
    activePage: { backgroundColor: "#8B0000", color: "#fff", border: "none" },
};