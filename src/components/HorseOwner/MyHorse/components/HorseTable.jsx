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

function HealthCertificateCell({ url }) {
    if (!url) {
        return <span style={styles.certMissing}>Not uploaded</span>;
    }

    const resolvedUrl = resolveFileUrl(url);

    return (
        <a href={resolvedUrl} target="_blank" rel="noreferrer" style={styles.certLink}>
            <img src={resolvedUrl} alt="Health certificate" style={styles.certThumb} />
            <span>View</span>
        </a>
    );
}

function DetailItem({ label, value }) {
    return (
        <div style={styles.detailItem}>
            <small style={styles.detailLabel}>{label}</small>
            <strong style={styles.detailValue}>{value || "-"}</strong>
        </div>
    );
}

export default function HorseTable() {
    const navigate = useNavigate();
    const [horses, setHorses] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedHorse, setSelectedHorse] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
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
            setTotal(res.totalCount ?? res.length ?? 0);
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

    const handleViewDetail = async (horse) => {
        setSelectedHorse(horse);
        setDetailLoading(true);
        setDetailError("");

        try {
            const detail = await ownerApi.getHorseDetail(horse.horseId);
            setSelectedHorse({ ...horse, ...detail });
        } catch (err) {
            if (!handleOwnerAccessError(err, navigate)) {
                setDetailError(err.message || "Failed to load horse detail");
            }
        } finally {
            setDetailLoading(false);
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
                            {["Horse Name", "Breed", "Age", "Height", "Weight", "Health Status", "Health Certificate", "Status", "Action"].map(h => (
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
                                    <HealthCertificateCell url={horse.healthCertificateImageUrl} />
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
                                    <button onClick={() => handleViewDetail(horse)} style={styles.iconBtn} type="button" aria-label={`View ${horse.horseName}`}>
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(horse)}
                                        style={{
                                            ...styles.toggleBtn,
                                            backgroundColor: horse.isActive ? "#f8d7da" : "#d4edda",
                                            color: horse.isActive ? "#721c24" : "#155724",
                                        }}
                                    >
                                        {horse.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {horses.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ textAlign: "center", padding: "24px", color: "#999" }}>
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

            {selectedHorse && (
                <div style={styles.modalOverlay} onClick={() => setSelectedHorse(null)}>
                    <section style={styles.detailModal} onClick={(event) => event.stopPropagation()}>
                        <div style={styles.detailHeader}>
                            <div>
                                <h3 style={styles.detailTitle}>{selectedHorse.horseName}</h3>
                                <p style={styles.detailSubtitle}>{selectedHorse.breedName || `Breed #${selectedHorse.breedId || "-"}`}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedHorse(null)} style={styles.closeBtn}>x</button>
                        </div>

                        {detailLoading && <p style={styles.detailNotice}>Loading horse detail...</p>}
                        {detailError && <p style={{ ...styles.detailNotice, color: "#721c24" }}>{detailError}</p>}

                        <div style={styles.detailBody}>
                            <div>
                                <img
                                    src={selectedHorse.imageUrl ? resolveFileUrl(selectedHorse.imageUrl) : "/Horse1.jpg"}
                                    alt={selectedHorse.horseName}
                                    style={styles.detailImage}
                                />
                                <div style={styles.detailCertificate}>
                                    <small style={styles.detailLabel}>HEALTH CERTIFICATE</small>
                                    <HealthCertificateCell url={selectedHorse.healthCertificateImageUrl} />
                                </div>
                            </div>

                            <div style={styles.detailGrid}>
                                <DetailItem label="Age" value={selectedHorse.age ? `${selectedHorse.age} yrs` : "-"} />
                                <DetailItem label="Height" value={selectedHorse.heightCm ? `${selectedHorse.heightCm} cm` : "-"} />
                                <DetailItem label="Weight" value={selectedHorse.weightKg ? `${selectedHorse.weightKg} kg` : "-"} />
                                <DetailItem label="Health Status" value={selectedHorse.healthStatus} />
                                <DetailItem label="Status" value={selectedHorse.isActive ? "Active" : "Inactive"} />
                                <DetailItem label="In Race Count" value={selectedHorse.inRaceCount} />
                                <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
                                    <small style={styles.detailLabel}>ACHIEVEMENT SUMMARY</small>
                                    <p style={styles.detailParagraph}>{selectedHorse.achievementSummary || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
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
    certLink: { display: "inline-flex", alignItems: "center", gap: "8px", color: "#8B0000", fontSize: "12px", fontWeight: "700", textDecoration: "none" },
    certThumb: { width: "44px", height: "32px", borderRadius: "6px", border: "1px solid #ead3cf", objectFit: "cover", backgroundColor: "#fff8f6" },
    certMissing: { display: "inline-flex", padding: "3px 9px", borderRadius: "999px", backgroundColor: "#f4ecea", color: "#705f5b", fontSize: "11px", fontWeight: "700" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", color: "#8B0000", fontSize: "12px", fontWeight: "700", marginRight: "4px" },
    toggleBtn: { border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
    pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
    pageInfo: { fontSize: "13px", color: "#999" },
    pages: { display: "flex", gap: "6px" },
    pageBtn: { width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" },
    activePage: { backgroundColor: "#8B0000", color: "#fff", border: "none" },
    modalOverlay: { position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: "24px", backgroundColor: "rgba(37,18,14,0.45)" },
    detailModal: { width: "min(760px, 100%)", maxHeight: "90vh", overflowY: "auto", borderRadius: "12px", border: "1px solid #ead3cf", backgroundColor: "#fffefd", boxShadow: "0 24px 70px rgba(37,18,14,0.28)" },
    detailHeader: { display: "flex", justifyContent: "space-between", gap: "12px", padding: "18px 20px", borderBottom: "1px solid #ead3cf", backgroundColor: "#fff4f1" },
    detailTitle: { margin: 0, color: "#610000", fontSize: "20px" },
    detailSubtitle: { margin: "4px 0 0", color: "#705f5b", fontSize: "13px", fontWeight: "700" },
    closeBtn: { width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #ead3cf", backgroundColor: "#fffdfc", color: "#610000", cursor: "pointer", fontWeight: "800" },
    detailNotice: { margin: "14px 20px 0", color: "#705f5b", fontSize: "13px", fontWeight: "700" },
    detailBody: { display: "grid", gridTemplateColumns: "220px 1fr", gap: "18px", padding: "20px" },
    detailImage: { width: "100%", height: "170px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#fff8f6" },
    detailCertificate: { marginTop: "12px", padding: "12px", borderRadius: "8px", border: "1px solid #ead3cf", backgroundColor: "#fff8f6" },
    detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
    detailItem: { borderRadius: "8px", border: "1px solid #ead3cf", backgroundColor: "#fff8f6", padding: "12px" },
    detailLabel: { display: "block", color: "#765c58", fontSize: "10px", fontWeight: "800" },
    detailValue: { display: "block", marginTop: "4px", color: "#2d2020", fontSize: "13px" },
    detailParagraph: { margin: "6px 0 0", color: "#5f4b47", fontSize: "13px", fontWeight: "600", lineHeight: 1.5 },
};
