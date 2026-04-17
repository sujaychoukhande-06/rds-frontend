"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPOLOGIES = ["ICU","Ward","OT","Emergency","Outpatient","Diagnostic","Laboratory","Pharmacy","Administrative","Support","NICU","PICU","CCU","HDU","Isolation","Other"];
const CRITICALITIES = ["Critical","High","Medium","Low","Ancillary"];

const CRITICALITY_COLOR = {
  Critical: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
  High:     { bg: "#fff7ed", text: "#ea580c", border: "#fdba74" },
  Medium:   { bg: "#fefce8", text: "#ca8a04", border: "#fde047" },
  Low:      { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  Ancillary:{ bg: "#f0f9ff", text: "#0369a1", border: "#7dd3fc" },
};

export default function RecordsPage({ onBack }) {
  const [rows,         setRows]         = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [department,   setDepartment]   = useState("");
  const [typology,     setTypology]     = useState("");
  const [criticality,  setCriticality]  = useState("");
  const [page,         setPage]         = useState(1);
  const [departments,  setDepartments]  = useState([]);
  const [deleting,     setDeleting]     = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);
  const [toast,        setToast]        = useState(null);
  const LIMIT = 10;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)      params.search       = search;
      if (department)  params.department   = department;
      if (typology)    params.roomTypology = typology;
      if (criticality) params.criticalityLevel = criticality;
      const res = await axios.get(`${API}/data`, { params });
      setRows(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  }, [search, department, typology, criticality, page]);

  // Fetch filter options (departments) from backend
  useEffect(() => {
    axios.get(`${API}/filter-options`).then(r => {
      setDepartments(r.data.departments || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchData, 350);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this record permanently?")) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/data/${id}`);
      showToast("Record deleted");
      fetchData();
    } catch { showToast("Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  const clearFilters = () => {
    setSearch(""); setDepartment(""); setTypology(""); setCriticality(""); setPage(1);
  };
  const hasFilters = search || department || typology || criticality;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="records-page">

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 2 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by room name, code, project, department…"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,lineHeight:1 }}>×</button>
          )}
        </div>

        <select className="filter-select" value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="filter-select" value={typology} onChange={e => { setTypology(e.target.value); setPage(1); }}>
          <option value="">All Typologies</option>
          {TYPOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="filter-select" value={criticality} onChange={e => { setCriticality(e.target.value); setPage(1); }}>
          <option value="">All Criticalities</option>
          {CRITICALITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/excel`, "_blank")} style={{ marginLeft:"auto" }}>
          📊 Export All Excel
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/pdf`, "_blank")}>
          📄 Export All PDF
        </button>
      </div>

      {/* ── RESULTS COUNT ── */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <span style={{ fontSize:13,color:"#64748b" }}>
          {loading ? "Loading…" : `${total} room${total !== 1 ? "s" : ""} found`}
          {hasFilters && " (filtered)"}
        </span>
        <button className="btn btn-primary btn-sm" onClick={onBack}>+ New RDS</button>
      </div>

      {/* ── RECORDS TABLE ── */}
      {loading ? (
        <div className="records-loading">
          {[...Array(5)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height:64, borderRadius:10, marginBottom:8 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="records-empty">
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.9 }}>📋✨</div>
          <h3>No records found</h3>
          <p>{hasFilters ? "Try adjusting your filters." : "Submit your first Room Data Sheet to get started."}</p>
          {hasFilters
            ? <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear Filters</button>
            : <button className="btn btn-primary btn-sm" onClick={onBack}>+ New RDS</button>
          }
        </div>
      ) : (
        <div className="records-table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Department</th>
                <th>Typology</th>
                <th>Criticality</th>
                <th>Net Area</th>
                <th>Created</th>
                <th style={{ textAlign:"center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const d    = row.data || {};
                const crit = d.criticalityLevel || "";
                const cc   = CRITICALITY_COLOR[crit] || { bg:"#f8fafc", text:"#64748b", border:"#e2e8f0" };
                const isExpanded = expandedId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr className={`records-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}>
                      <td>
                        <div className="room-cell">
                          <div className="room-code-badge">{row.roomCode || "—"}</div>
                          <div>
                            <div className="room-name">{d.roomName || row.roomName || "Unnamed Room"}</div>
                            <div className="room-project">{d.project || row.project || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="dept-tag">{d.department || row.department || "—"}</span></td>
                      <td><span className="typology-tag">{d.roomTypology || "—"}</span></td>
                      <td>
                        {crit ? (
                          <span className="crit-badge" style={{ background: cc.bg, color: cc.text, borderColor: cc.border }}>
                            {crit}
                          </span>
                        ) : "—"}
                      </td>
                      <td>{d.netArea ? `${d.netArea} m²` : "—"}</td>
                      <td style={{ fontSize:12, color:"#94a3b8" }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN", { day:"numeric",month:"short",year:"numeric" }) : "—"}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="action-btns">
                          <a href={`${API}/export/excel/${row.id}`} target="_blank" rel="noreferrer"
                            className="action-btn" title="Download Excel" style={{ color:"#059669" }}>
                            📊
                          </a>
                          <a href={`${API}/export/pdf/${row.id}`} target="_blank" rel="noreferrer"
                            className="action-btn" title="Download PDF" style={{ color:"#2563eb" }}>
                            📄
                          </a>
                          <button
                            className="action-btn"
                            title="Delete"
                            style={{ color:"#dc2626" }}
                            disabled={deleting === row.id}
                            onClick={() => handleDelete(row.id)}
                          >
                            {deleting === row.id ? "…" : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${row.id}-exp`} className="expanded-row">
                        <td colSpan={7}>
                          <div className="expanded-detail">
                            <div className="detail-grid">
                              {[
                                ["Location",          d.location],
                                ["Infection Risk",    d.infectionRiskCategory],
                                ["Isolation Type",    d.isolationType],
                                ["Operational Hours", d.operationalHours],
                                ["Patient Capacity",  d.patientCapacity],
                                ["Staff Required",    d.staffRequirement],
                                ["Net Area",          d.netArea ? `${d.netArea} m²` : null],
                                ["Pressure Regime",   d.pressureRegime],
                                ["Submitted By",      row.submittedBy],
                                ["Status",            row.status],
                              ].filter(([,v]) => v != null && v !== "").map(([k,v]) => (
                                <div key={k} className="detail-item">
                                  <span className="detail-label">{k}</span>
                                  <span className="detail-value">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                            {d.roomFunction && (
                              <div style={{ marginTop:12, padding:"10px 14px", background:"#f0f9ff", borderRadius:8, borderLeft:"3px solid #0ea5e9" }}>
                                <div style={{ fontSize:10.5, fontWeight:600, color:"#0369a1", marginBottom:4 }}>ROOM FUNCTION</div>
                                <div style={{ fontSize:12.5, color:"#0f172a", lineHeight:1.6 }}>{d.roomFunction}</div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
          {[...Array(totalPages)].map((_,i) => (
            <button
              key={i}
              className={`page-btn ${page === i+1 ? "active" : ""}`}
              onClick={() => setPage(i+1)}
            >{i+1}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>›</button>
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}><span>{toast.msg}</span></div>
        </div>
      )}
    </div>
  );
}