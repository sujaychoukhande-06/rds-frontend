"use client";

import { useState } from "react";
import RdsForm     from "../components/RdsForm";
import RecordsPage from "../components/RecordsPage";
import { rdsSchema } from "../schema";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type View = "form" | "records" | "search" | "export";

export default function Page() {
  const [activeSection, setActiveSection] = useState(0);
  const [sidebarJump,   setSidebarJump]   = useState<{idx:number,ts:number}|null>(null);
  const [view,          setView]          = useState<View>("form");

  const progress = Math.round((activeSection / rdsSchema.length) * 100);

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo-area">
          <div className="sidebar-brand">
            RDS System
            <span>Medical College</span>
          </div>
          <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9,
              background:"linear-gradient(135deg,rgba(37,99,235,0.35),rgba(37,99,235,0.2))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, fontWeight:700, color:"#93c5fd",
              border:"1px solid rgba(37,99,235,0.3)" }}>A</div>
            <div>
              <div style={{ fontSize:12,color:"rgba(255,255,255,0.75)",fontWeight:600 }}>Admin</div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.32)" }}>Super Administrator</div>
            </div>
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
                onClick={() => { setView("form"); setSidebarJump({idx, ts: Date.now()}); window.scrollTo({top:0,behavior:"smooth"}); }}
              >
                <div className="nav-icon">{section.icon}</div>
                <span className="nav-label">{section.section}</span>
                <div className="nav-status">
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

          <div className="nav-group-label" style={{ marginTop:10 }}>Records &amp; Export</div>

          {([
            { icon:"📋", label:"All Room Sheets",      id:"records" },
            { icon:"🔍", label:"Search &amp; Filter",  id:"search"  },
            { icon:"📊", label:"Export Excel (All)",   id:"excel"   },
            { icon:"📄", label:"Export PDF (All)",     id:"pdf"     },
          ] as { icon:string; label:string; id:string }[]).map(item => (
            <div key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => {
                if (item.id === "excel") {
                  window.open(`${API}/export/excel`, "_blank");
                } else if (item.id === "pdf") {
                  window.open(`${API}/export/pdf`, "_blank");
                } else {
                  setView(item.id as View);
                }
              }}
            >
              <div className="nav-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="nav-label" dangerouslySetInnerHTML={{ __html: item.label }} />
            </div>
          ))}
        </nav>

        <div className="sidebar-progress-area">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontWeight:700, letterSpacing:1 }}>FORM COMPLETION</span>
            <span style={{ fontSize:12, color:"#93c5fd", fontWeight:700 }}>{progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", marginTop:6 }}>
            {activeSection} of {rdsSchema.length} sections reviewed
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div className="main-wrapper">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <h1>
              {view === "form"    ? "Room Data Sheet Dashboard"
              : view === "records" || view === "search" ? "All Room Records"
              : "Room Data Sheet"}
            </h1>
            <p>
              {view === "form"
                ? "Complete all sections to generate a comprehensive RDS"
                : "Browse, download and manage submitted room data sheets"}
            </p>
          </div>

          <div className="topbar-actions">
            {view === "form" && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px",
                  background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10 }}>
                  <div className="draft-dot" />
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Draft</span>
                </div>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => window.open(`${API}/export/excel`, "_blank")}>
                  📊 Export Excel
                </button>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => window.open(`${API}/export/pdf`, "_blank")}>
                  📄 Export PDF
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

          {/* Stats strip — form view only */}
          {view === "form" && (
            <div className="stats-strip">
              {[
                { icon:"📋", label:"Total Sections",  value: rdsSchema.length,              color:"#eff6ff", ac:"#2563eb" },
                { icon:"✅", label:"Completed",        value: activeSection,                 color:"#f0fdf4", ac:"#10b981" },
                { icon:"⏳", label:"Remaining",        value: rdsSchema.length-activeSection, color:"#fefce8", ac:"#f59e0b" },
                { icon:"📊", label:"Progress",         value: `${progress}%`,               color:"#fdf4ff", ac:"#7c3aed" },
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

          {/* View Router */}
          {view === "form" && (
            <RdsForm
              onSectionChange={(idx: number) => setActiveSection(idx)}
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
