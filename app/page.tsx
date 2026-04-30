"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RdsForm     from "../components/RdsForm";
import RecordsPage from "../components/RecordsPage";
import { rdsSchema } from "../schema";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type View = "form" | "records" | "search";

interface RDSUser { name: string; role: string; email: string; }
interface EditRecord { id: string; data: Record<string, any>; }

function Page() {
  const router = useRouter();
  const [currentUser,    setCurrentUser]    = useState<RDSUser | null>(null);
  const [activeSection,  setActiveSection]  = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sidebarJump,    setSidebarJump]    = useState<{idx:number,ts:number}|null>(null);
  const [view,           setView]           = useState<View>("form");
  const [time,           setTime]           = useState("");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [editRecord,     setEditRecord]     = useState<EditRecord | null>(null);

  const progress = Math.round((completedCount / rdsSchema.length) * 100);

  // ── Auth check ────────────────────────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem("rds_user");
    if (!raw) { router.replace("/login"); return; }
    try { setCurrentUser(JSON.parse(raw)); }
    catch { router.replace("/login"); }
  }, [router]);

  // ── Live clock ────────────────────────────────────────
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("rds_user");
    router.replace("/login");
  };

  // ── Edit handler: called from RecordsPage ─────────────
  const handleEdit = (record: EditRecord) => {
    setEditRecord(record);   // pass data to RdsForm
    setView("form");         // switch to form view
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  if (!currentUser) return null;

  const avatarInitial = currentUser.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside className="sidebar" style={{ transform: sidebarOpen ? "none" : "translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>

        <div className="sidebar-logo-area">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div className="sidebar-brand">
              RDS System
              <span>Medical College</span>
            </div>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 10px rgba(16,185,129,0.7)", flexShrink:0 }} title="System online" />
          </div>

          <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background:"linear-gradient(135deg,rgba(37,99,235,0.5),rgba(6,182,212,0.3))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"#93c5fd",
              border:"1px solid rgba(59,130,246,0.25)",
              boxShadow:"0 4px 12px rgba(37,99,235,0.2)",
            }}>{avatarInitial}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.82)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", marginTop:1, textTransform:"capitalize" }}>
                {currentUser.role} · {time}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:14, padding:4, flexShrink:0, transition:"color 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseOut={e  => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >⏻</button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">Form Sections</div>

          {rdsSchema.map((section, idx) => {
            const isActive = view === "form" && idx === activeSection;
            const isDone   = view === "form" && idx < activeSection;
            return (
              <div key={section.id}
                className={`nav-item ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`}
                onClick={() => { setView("form"); setSidebarJump({ idx, ts: Date.now() }); }}
              >
                <div className="nav-icon">{section.icon}</div>
                <span className="nav-label">{section.section}</span>
                <div className="nav-status">
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isActive ? (
                    <div style={{ width:5, height:5, background:"#93c5fd", borderRadius:"50%" }} />
                  ) : (
                    <span style={{ fontSize:9 }}>{idx+1}</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="nav-group-label" style={{ marginTop:12 }}>Records &amp; Export</div>

          {([
            { icon:"📋", label:"All Room Sheets",    id:"records" },
            { icon:"🔍", label:"Search & Filter",    id:"search"  },
            { icon:"📊", label:"Export Excel (All)", id:"excel"   },
            { icon:"📄", label:"Export PDF (All)",   id:"pdf"     },
          ] as { icon:string; label:string; id:string }[]).map(item => (
            <div key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.id === "excel") window.open(`${API}/export/excel`, "_blank");
                else if (item.id === "pdf") window.open(`${API}/export/pdf`, "_blank");
                else setView(item.id as View);
              }}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-progress-area">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:9.5, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'Sora',sans-serif" }}>
              Form Completion
            </span>
            <span style={{ fontSize:13, color: progress === 100 ? "#34d399" : "#93c5fd", fontWeight:800, fontFamily:"'Sora',sans-serif" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.22)", marginTop:8, fontFamily:"'Sora',sans-serif" }}>
            {completedCount} of {rdsSchema.length} sections reviewed
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="main-wrapper">

        <header className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #e0e7ef", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="#5b6a81" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="topbar-left">
              <h1>
                {view === "form"
                  ? (editRecord ? "Edit Room Data Sheet" : "Room Data Sheet Dashboard")
                  : "All Room Records"}
              </h1>
              <p>
                {view === "form"
                  ? editRecord
                    ? `Editing: ${editRecord.data?.roomCode || ""} — ${editRecord.data?.roomName || ""}`
                    : `Section ${activeSection + 1} of ${rdsSchema.length} — ${rdsSchema[activeSection]?.section}`
                  : "Browse, download and manage submitted room data sheets"}
              </p>
            </div>
          </div>

          <div className="topbar-actions">
            {view === "form" && !editRecord && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:"#fff", border:"1.5px solid #e0e7ef", borderRadius:12 }}>
                  <svg width="18" height="18" viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e0e7ef" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray={`${progress * 0.942} 94.2`} strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:600, fontFamily:"'Sora',sans-serif" }}>{progress}% done</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px", background:"#fff", border:"1.5px solid #e0e7ef", borderRadius:10 }}>
                  <div className="draft-dot" />
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Draft</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/excel`, "_blank")}>📊 Excel</button>
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/pdf`, "_blank")}>📄 PDF</button>
              </>
            )}
            {view === "form" && editRecord && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditRecord(null); setView("records"); }}>
                ← Back to Records
              </button>
            )}
            {(view === "records" || view === "search") && (
              <button className="btn btn-primary btn-sm" onClick={() => { setEditRecord(null); setView("form"); }}>
                + New RDS
              </button>
            )}
          </div>
        </header>

        <main className="page-content">

          {view === "form" && !editRecord && (
            <div className="stats-strip">
              {[
                { icon:"📋", label:"Total Sections",    value: rdsSchema.length,                color:"#eff6ff", ac:"#2563eb" },
                { icon:"✅", label:"Completed",          value: completedCount,                   color:"#f0fdf4", ac:"#10b981" },
                { icon:"⏳", label:"Remaining",          value: rdsSchema.length - completedCount, color:"#fefce8", ac:"#f59e0b" },
                { icon:"📊", label:"Progress",           value: `${progress}%`,                  color:"#fdf4ff", ac:"#7c3aed" },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-icon" style={{ background:stat.color }}>{stat.icon}</div>
                  <div className="stat-body">
                    <strong style={{ color:stat.ac }}>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "form" && (
            <RdsForm
              onSectionChange={(val: {current:number, completed:number}) => {
                setActiveSection(val.current);
                setCompletedCount(val.completed);
              }}
              jumpToSection={sidebarJump}
              editRecord={editRecord}
              onEditDone={() => {
                setEditRecord(null);
                setView("records");
              }}
            />
          )}

          {(view === "records" || view === "search") && (
            <RecordsPage
              onBack={() => { setEditRecord(null); setView("form"); }}
              onEdit={handleEdit}
            />
          )}

        </main>
      </div>
    </div>
  );
}

export default Page;
