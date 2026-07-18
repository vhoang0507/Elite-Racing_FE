import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { ownerApi } from "../../../../api/ownerApi";
import { handleOwnerAccessError } from "../../../../api/handleOwnerAccessError";
import { resolveFileUrl } from "../../../../api/uploadApi";
import { getCompactPaginationItems } from "../../../../utils/pagination";

const healthColor = {
    Healthy: { bg: "#e8f7ee", color: "#16864f" },
    Injured: { bg: "#f3e1df", color: "#a4392f" },
    UnderTraining: { bg: "#faf2e0", color: "#8a6209" },
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

            {/* Cards */}
            {loading ? (
                <p style={{ textAlign: "center", color: "#999" }}>Loading...</p>
            ) : horses.length === 0 ? (
                <div style={styles.emptyBox}>No horses found</div>
            ) : (
                <div style={styles.grid}>
                    {horses.map((horse, i) => (
                        <article key={horse.horseId ?? i} style={styles.card}>
                            <div style={styles.cardImgWrap}>
                                <img
                                    src={horse.imageUrl ? resolveFileUrl(horse.imageUrl) : "/Horse1.jpg"}
                                    alt={horse.horseName}
                                    style={styles.cardImg}
                                />
                                <span style={{
                                    ...styles.cardStatusBadge,
                                    backgroundColor: horse.isActive ? "#e8f7ee" : "#f3e1df",
                                    color: horse.isActive ? "#16864f" : "#a4392f",
                                }}>
                                    {horse.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </div>

                            <div style={styles.cardBody}>
                                <div>
                                    <strong style={styles.cardName}>{horse.horseName}</strong>
                                    <span style={styles.cardBreed}>{horse.breedName}</span>
                                </div>

                                <div style={styles.cardInfoGrid}>
                                    <span>Age</span>
                                    <span style={styles.cardInfoValue}>{horse.age} years</span>
                                    <span>Height</span>
                                    <span style={styles.cardInfoValue}>{horse.heightCm ? `${horse.heightCm} cm` : "-"}</span>
                                    <span>Weight</span>
                                    <span style={styles.cardInfoValue}>{horse.weightKg} kg</span>
                                </div>

                                <div style={styles.cardFooter}>
                                    <span style={{ ...styles.badge, ...(healthColor[horse.healthStatus] ?? {}) }}>
                                        {horse.healthStatus}
                                    </span>
                                    <div style={styles.cardActions}>
                                        <button
                                            title="View"
                                            onClick={() => navigate(`/owner/horses/${horse.horseId}`)}
                                            style={styles.iconBtn}
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            title="Edit"
                                            onClick={() => navigate(`/owner/horses/${horse.horseId}/edit`)}
                                            style={{ ...styles.iconBtn, color: "#16305c" }}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            title="Delete"
                                            onClick={() => handleDeleteHorse(horse.horseId)}
                                            style={{ ...styles.iconBtn, color: "#a4392f" }}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div style={styles.pagination}>
                <span style={styles.pageInfo}>
                    Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} horses
                </span>
                <div style={styles.pages}>
                    {getCompactPaginationItems(totalPages, page).map(pageItem => (
                        typeof pageItem === "number" ? (
                            <button
                                key={pageItem}
                                onClick={() => setPage(pageItem)}
                                style={{ ...styles.pageBtn, ...(pageItem === page ? styles.activePage : {}) }}
                            >
                                {pageItem}
                            </button>
                        ) : (
                            <span key={pageItem} style={{ ...styles.pageBtn, ...styles.pageEllipsis }}>...</span>
                        )
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
    wrapper: { backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #ded2ad", boxShadow: "0 8px 22px rgba(15,23,42,0.06)" },
    filterBar: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
    search: { padding: "8px 14px", borderRadius: "999px", border: "1px solid #ded2ad", fontSize: "13px", flex: 1 },
    select: { padding: "8px 14px", borderRadius: "999px", border: "1px solid #ded2ad", fontSize: "13px", cursor: "pointer" },
    filterBtn: { padding: "8px 18px", borderRadius: "999px", border: "0", fontSize: "13px", fontWeight: "700", cursor: "pointer", backgroundColor: "#16305c", color: "#fff" },
    emptyBox: { textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: "14px", fontWeight: 600 },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "18px",
    },
    card: {
        display: "flex",
        flexDirection: "column",
        borderRadius: "14px",
        border: "1px solid #ded2ad",
        backgroundColor: "#fff",
        overflow: "hidden",
        boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
        transition: "box-shadow 0.2s",
    },
    cardImgWrap: { position: "relative", aspectRatio: "4 / 3" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    cardStatusBadge: {
        position: "absolute", top: "10px", right: "10px",
        padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
        boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
    },
    cardBody: { display: "flex", flexDirection: "column", gap: "12px", padding: "14px 16px" },
    cardName: { display: "block", fontSize: "1rem", color: "#1b2333" },
    cardBreed: { display: "block", marginTop: "2px", fontSize: "0.78rem", fontWeight: 600, color: "#6b6456" },
    cardInfoGrid: {
        display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "4px", columnGap: "8px",
        fontSize: "0.78rem", fontWeight: 600, color: "#6b6456",
    },
    cardInfoValue: { color: "#1b2333", fontWeight: 700, textAlign: "right" },
    cardFooter: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid #f0ece0", paddingTop: "10px",
    },
    cardActions: { display: "flex", alignItems: "center" },
    badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "15px", marginLeft: "2px", color: "#64748b" },
    toggleBtn: { border: "none", borderRadius: "999px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
    pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
    pageInfo: { fontSize: "13px", color: "#6b6456", fontWeight: "600" },
    pages: { display: "flex", gap: "6px" },
    pageBtn: { width: "32px", height: "32px", borderRadius: "999px", border: "1px solid #ded2ad", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: "#16305c" },
    pageEllipsis: { color: "#6b6456", cursor: "default", display: "inline-flex", alignItems: "center", justifyContent: "center" },
    activePage: { backgroundColor: "#16305c", color: "#fff", border: "1px solid #16305c", fontWeight: "700" },
};
