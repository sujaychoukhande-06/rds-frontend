"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPOLOGIES   = ["ICU","Ward","OT","Emergency","Outpatient","Diagnostic","Laboratory","Pharmacy","Administrative","Support","NICU","PICU","CCU","HDU","Isolation","Other"];
const CRITICALITIES = ["Critical","High","Medium","Low","Ancillary"];

const CRITICALITY_COLOR = {
  Critical:  { bg:"#fef2f2", text:"#dc2626", border:"#fca5a5" },
  High:      { bg:"#fff7ed", text:"#ea580c", border:"#fdba74" },
  Medium:    { bg:"#fefce8", text:"#ca8a04", border:"#fde047" },
  Low:       { bg:"#f0fdf4", text:"#16a34a", border:"#86efac" },
  Ancillary: { bg:"#f0f9ff", text:"#0369a1", border:"#7dd3fc" },
};

// ─── Helper: read a field from Supabase row regardless of case ───────────────
// Supabase stores columns as lowercase (createdat, roomcode, roomname)
// but the data JSONB field still has camelCase keys inside it
function get(row, camel, lower) {
  return row[camel] ?? row[lower] ?? null;
}

function getDate(row) {
  return row.createdat || row.createdAt || row.created_at || null;
}

function getRoomCode(row) {
  return row.roomcode || row.roomCode || row.data?.roomCode || "—";
}

function getRoomName(row) {
  return row.roomname || row.roomName || row.data?.roomName || "Unnamed Room";
}

function getDepartment(row) {
  return row.department || row.data?.department || "—";
}

function getProject(row) {
  return row.project || row.data?.project || "—";
}

export default function RecordsPage({ onBack }) {
  const [rows,        setRows]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [department,  setDepartment]  = useState("");
  const [typology,    setTypology]    = useState("");
  const [criticality, setCriticality] = useState("");
  const [page,        setPage]        = useState(1);
  const [departments, setDepartments] = useState([]);
  const [deleting,    setDeleting]    = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const LIMIT = 10;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)      params.search            = search;
      if (department)  params.department        = department;
      if (typology)    params.roomTypology      = typology;
      if (criticality) params.criticalityLevel  = criticality;
      const res = await axios.get(`${API}/data`, { params });
      setRows(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  }, [search, department, typology, criticality, page]);

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
    finally   { setDeleting(null); }
  };

  const clearFilters = () => {
    setSearch(""); setDepartment(""); setTypology(""); setCriticality(""); setPage(1);
  };

  const hasFilters  = search || department || typology || criticality;
  const totalPages  = Math.ceil(total / LIMIT);

  // ─── Format date/time from Supabase ISO string ────────────────────────────
  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
    } catch { return "—"; }
  };

  const fmtTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
    } catch { return ""; }
  };

  return (
    <div className="records-page">

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600,
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          color:       toast.type === "error" ? "#dc2626"  : "#16a34a",
          border:`1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
          animation:"slideInRight 0.3s ease",
        }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex:2 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by room name, code, project, department…"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16, lineHeight:1 }}>
              ×
            </button>
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
        <button className="btn btn-ghost btn-sm"
          onClick={() => window.open(`${API}/export/excel`, "_blank")}
          style={{ marginLeft:"auto" }}>
          📊 Export All Excel
        </button>
        <button className="btn btn-ghost btn-sm"
          onClick={() => window.open(`${API}/export/pdf`, "_blank")}>
          📄 Export All PDF
        </button>
      </div>

      {/* ── RESULTS COUNT ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:13, color:"#64748b" }}>
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
          <div style={{ fontSize:56, marginBottom:16, opacity:0.9 }}>📋✨</div>
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
                const d          = row.data || {};
                const crit       = d.criticalityLevel || "";
                const cc         = CRITICALITY_COLOR[crit] || { bg:"#f8fafc", text:"#64748b", border:"#e2e8f0" };
                const isExpanded = expandedId === row.id;
                const dateIso    = getDate(row);
                const roomCode   = getRoomCode(row);
                const roomName   = getRoomName(row);
                const dept       = getDepartment(row);
                const project    = getProject(row);

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`records-row ${isExpanded ? "expanded" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    >
                      {/* Room */}
                      <td>
                        <div className="room-cell">
                          <div className="room-code-badge">{roomCode}</div>
                          <div>
                            <div className="room-name">{roomName}</div>
                            <div className="room-project">{project}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td><span className="dept-tag">{dept}</span></td>

                      {/* Typology */}
                      <td><span className="typology-tag">{d.roomTypology || "—"}</span></td>

                      {/* Criticality */}
                      <td>
                        {crit ? (
                          <span className="crit-badge"
                            style={{ background:cc.bg, color:cc.text, borderColor:cc.border }}>
                            {crit}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Net Area */}
                      <td>{d.netArea ? `${d.netArea} m²` : "—"}</td>

                      {/* ── Created date + time ── */}
                      <td style={{ fontSize:12, color:"#94a3b8", minWidth:110 }}>
                        {dateIso ? (
                          <>
                            <div style={{ color:"#475569", fontWeight:600, fontSize:12.5 }}>
                              {fmtDate(dateIso)}
                            </div>
                            <div style={{ fontSize:11, color:"#b0b8c4", marginTop:3 }}>
                              {fmtTime(dateIso)}
                            </div>
                          </>
                        ) : (
                          <span style={{ color:"#cbd5e1" }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign:"center" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => window.open(`${API}/export/excel/${row.id}`, "_blank")}
                            title="Export Excel"
                            style={{ fontSize:13, padding:"4px 8px" }}>
                            📊
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => window.open(`${API}/export/pdf/${row.id}`, "_blank")}
                            title="Export PDF"
                            style={{ fontSize:13, padding:"4px 8px" }}>
                            📄
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDelete(row.id)}
                            disabled={deleting === row.id}
                            title="Delete"
                            style={{
                              fontSize:13, padding:"4px 8px",
                              background:"#fef2f2", color:"#dc2626",
                              border:"1px solid #fca5a5", borderRadius:7,
                              cursor:"pointer", opacity: deleting === row.id ? 0.5 : 1
                            }}>
                            {deleting === row.id ? "…" : "🗑"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── EXPANDED DETAIL ROW ── */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={7} style={{ padding:"0 12px 16px", background:"#f8fafc" }}>
                          <div style={{
                            display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
                            gap:10, padding:"16px", background:"#fff",
                            borderRadius:10, border:"1px solid #e2e8f0"
                          }}>
                            {[
                              ["Room Function",     d.roomFunction],
                              ["Operational Hours", d.operationalHours],
                              ["Patient Capacity",  d.patientCapacity],
                              ["Staff Required",    d.staffRequirement],
                              ["Net Area",          d.netArea ? `${d.netArea} m²` : null],
                              ["Ceiling Height",    d.ceilingHeight ? `${d.ceilingHeight} m` : null],
                              ["Pressure Regime",   d.pressureRegime],
                              ["Infection Risk",    d.infectionRiskCategory],
                              ["HVAC Category",     d.acuCategory],
                              ["Ventilation Rate",  d.ventilationRate],
                              ["Isolation Type",    d.isolationType],
                              ["Floor Finish",      d.floor],
                              ["Wall Finish",       d.wallFinish],
                              ["Submitted By",      row.submittedby || row.submittedBy || row.submitted_by],
                              ["Record ID",         String(row.id)],
                              ["Last Updated",      fmtDate(row.updatedat || row.updatedAt || row.updated_at)],
                            ].filter(([,v]) => v != null && String(v).trim() !== "").map(([label, value]) => (
                              <div key={label} style={{ minWidth:0 }}>
                                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, marginBottom:3 }}>
                                  {label}
                                </div>
                                <div style={{ fontSize:12.5, color:"#334155", fontWeight:500, wordBreak:"break-word" }}>
                                  {String(value)}
                                </div>
                              </div>
                            ))}
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
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:24 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}>
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${page === i+1 ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setPage(i+1)}
              style={{ minWidth:36 }}>
              {i+1}
            </button>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}>
            Next →
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}