"use client";
import { useState, useEffect } from "react";
import RdsForm     from "../components/RdsForm";
import RecordsPage from "../components/RecordsPage";
import { rdsSchema } from "../schema";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type View = "form" | "records" | "search";

export default function Page() {
  const [activeSection,    setActiveSection]    = useState(0);
  const [completedCount,   setCompletedCount]   = useState(0);
  const [sidebarJump,   setSidebarJump]   = useState<{idx:number,ts:number}|null>(null);
  const [view,          setView]          = useState<View>("form");
  const [time,          setTime]          = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(true);

  const progress = Math.round((completedCount / rdsSchema.length) * 100);

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside className="sidebar" style={{ transform: sidebarOpen ? "none" : "translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Logo */}
        <div className="sidebar-logo-area">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div className="sidebar-brand">
              RDS System
              <span>Medical College</span>
            </div>
            <div style={{
              width:8, height:8, borderRadius:"50%", background:"#10b981",
              boxShadow:"0 0 10px rgba(16,185,129,0.7)", flexShrink:0
            }} title="System online" />
          </div>

          {/* User info */}
          <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background:"linear-gradient(135deg,rgba(37,99,235,0.5),rgba(6,182,212,0.3))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"#93c5fd",
              border:"1px solid rgba(59,130,246,0.25)",
              boxShadow:"0 4px 12px rgba(37,99,235,0.2)"
            }}>A</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.82)", fontWeight:600 }}>Administrator</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", marginTop:1 }}>Super Admin · {time}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Progress */}
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

        {/* TOPBAR */}
        <header className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Hamburger */}
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
                {view === "form" ? "Room Data Sheet Dashboard"
                : "All Room Records"}
              </h1>
              <p>
                {view === "form"
                  ? `Section ${activeSection + 1} of ${rdsSchema.length} — ${rdsSchema[activeSection]?.section}`
                  : "Browse, download and manage submitted room data sheets"}
              </p>
            </div>
          </div>

          <div className="topbar-actions">
            {view === "form" && (
              <>
                {/* Progress ring */}
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
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/excel`, "_blank")}>
                  📊 Excel
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => window.open(`${API}/export/pdf`, "_blank")}>
                  📄 PDF
                </button>
              </>
            )}
            {(view === "records" || view === "search") && (
              <button className="btn btn-primary btn-sm" onClick={() => setView("form")}>
                + New RDS
              </button>
            )}
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="page-content">

          {/* Stats strip */}
          {view === "form" && (
            <div className="stats-strip">
              {[
                { icon:"📋", label:"Total Sections",   value: rdsSchema.length,               color:"#eff6ff", ac:"#2563eb" },
                { icon:"✅", label:"Completed",         value: completedCount,                  color:"#f0fdf4", ac:"#10b981" },
                { icon:"⏳", label:"Remaining",         value: rdsSchema.length - completedCount, color:"#fefce8", ac:"#f59e0b" },
                { icon:"📊", label:"Progress",          value: `${progress}%`,                 color:"#fdf4ff", ac:"#7c3aed" },
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
            />
          )}

          {(view === "records" || view === "search") && (
            <RecordsPage onBack={() => setView("form")} />
          )}

        </main>
      </div>
    </div>
  );
}
