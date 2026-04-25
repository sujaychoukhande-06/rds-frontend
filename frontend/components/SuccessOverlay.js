"use client";
import { useEffect, useState, useRef } from "react";

// ── Particle system ───────────────────────────────────────
function Particle({ delay, color, x, angle, distance }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      width: 8, height: 8, borderRadius: "50%",
      background: color, opacity: 0,
      animation: `particle 1.2s ${delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
      "--tx": `${Math.cos(angle) * distance}px`,
      "--ty": `${Math.sin(angle) * distance}px`,
    }} />
  );
}

const COLORS = ["#2563eb","#06b6d4","#10b981","#7c3aed","#f59e0b","#ef4444","#ec4899","#ffffff"];
const PARTICLES = Array.from({ length: 42 }, (_, i) => ({
  delay:    (i % 6) * 0.04,
  color:    COLORS[i % COLORS.length],
  x:        0,
  angle:    (i / 42) * Math.PI * 2,
  distance: 60 + (i % 4) * 35,
}));

export default function SuccessOverlay({ roomCode, roomName, onClose }) {
  const [phase, setPhase]     = useState(0); // 0=enter 1=shown 2=exit
  const [counter, setCounter] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    // Phase sequence: animate in → count up → auto-close after 5s
    const t1 = setTimeout(() => setPhase(1), 100);
    // Count up the "fields saved" number
    let n = 0;
    const countTimer = setInterval(() => {
      n += 3;
      if (n >= 100) { n = 100; clearInterval(countTimer); }
      setCounter(n);
    }, 18);
    // Auto dismiss after 5.5 seconds
    timerRef.current = setTimeout(() => {
      setPhase(2);
      setTimeout(onClose, 600);
    }, 5500);

    return () => {
      clearTimeout(t1); clearTimeout(timerRef.current); clearInterval(countTimer);
    };
  }, []);

  function handleClose() {
    clearTimeout(timerRef.current);
    setPhase(2);
    setTimeout(onClose, 600);
  }

  return (
    <>
      <style>{`
        @keyframes particle {
          0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-50%,-50%) translate(var(--tx),var(--ty)) scale(0); opacity:0; }
        }
        @keyframes overlayIn  { from { opacity:0; backdrop-filter:blur(0px); } to { opacity:1; backdrop-filter:blur(20px); } }
        @keyframes overlayOut { from { opacity:1; } to { opacity:0; } }
        @keyframes cardIn  { from { opacity:0; transform:scale(0.7) translateY(40px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes cardOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.92) translateY(-20px); } }
        @keyframes checkStroke {
          from { stroke-dashoffset: 80; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ringPulse {
          0%   { transform:scale(1);   opacity:0.6; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes ringPulse2 {
          0%   { transform:scale(1);   opacity:0.4; }
          100% { transform:scale(1.8); opacity:0; }
        }
        @keyframes slideUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes barFill  { from { width:0%; } to { width:100%; } }
        @keyframes shimmer  { from { background-position:-200% 0; } to { background-position:200% 0; } }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(4,13,30,0.75)",
          animation: phase === 2 ? "overlayOut 0.6s ease forwards" : "overlayIn 0.5s ease forwards",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        {/* Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "linear-gradient(145deg,#0f1f40 0%,#0d1a35 50%,#091225 100%)",
            border: "1px solid rgba(37,99,235,0.4)",
            borderRadius: 28, padding: "52px 48px 44px",
            maxWidth: 480, width: "100%", textAlign: "center",
            position: "relative", overflow: "hidden",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: phase === 2 ? "cardOut 0.5s ease forwards" : "cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
          }}
        >
          {/* Background glow mesh */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none", borderRadius:28, overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%)" }} />
            <div style={{ position:"absolute", bottom:-60, right:-60, width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.15) 0%,transparent 70%)" }} />
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(37,99,235,0.6),rgba(6,182,212,0.4),transparent)" }} />
          </div>

          {/* Close button */}
          <button onClick={handleClose} style={{
            position:"absolute", top:18, right:18, width:32, height:32,
            background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:8, cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
          }}>×</button>

          {/* ── Check icon with particles ── */}
          <div style={{ position:"relative", width:96, height:96, margin:"0 auto 28px" }}>
            {/* Pulse rings */}
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              border:"2px solid rgba(16,185,129,0.5)",
              animation: phase >= 1 ? "ringPulse 1.6s 0.3s ease-out infinite" : "none",
            }} />
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              border:"1.5px solid rgba(16,185,129,0.3)",
              animation: phase >= 1 ? "ringPulse2 1.6s 0.6s ease-out infinite" : "none",
            }} />

            {/* Circle bg */}
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:"linear-gradient(135deg,#065f46,#047857)",
              boxShadow:"0 0 40px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.3)",
              border:"2px solid rgba(16,185,129,0.6)",
            }} />

            {/* SVG checkmark */}
            <svg viewBox="0 0 48 48" style={{ position:"relative", zIndex:1, width:96, height:96 }}>
              <path
                d="M14 25 L21 32 L34 17"
                fill="none" stroke="#ffffff" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="80"
                strokeDashoffset="80"
                style={{ animation: phase >= 1 ? "checkStroke 0.6s 0.4s cubic-bezier(0.4,0,0.2,1) forwards" : "none" }}
              />
            </svg>

            {/* Confetti particles */}
            {phase >= 1 && PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
          </div>

          {/* ── Heading ── */}
          <div style={{
            fontSize: 28, fontWeight: 800, color: "#ffffff",
            letterSpacing: -0.8, lineHeight: 1.15,
            animation: phase >= 1 ? "slideUp 0.5s 0.5s both" : "none",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            Room Data Sheet
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, lineHeight: 1.15,
            background: "linear-gradient(90deg, #10b981, #06b6d4, #2563eb)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: phase >= 1 ? "slideUp 0.5s 0.55s both" : "none",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            Submitted Successfully
          </div>

          {/* ── Room info badge ── */}
          {(roomCode || roomName) && (
            <div style={{
              margin: "20px auto 0", display:"inline-flex", alignItems:"center", gap:10,
              background:"rgba(37,99,235,0.15)", border:"1px solid rgba(37,99,235,0.35)",
              borderRadius:50, padding:"8px 18px",
              animation: phase >= 1 ? "slideUp 0.5s 0.65s both, floatBadge 3s 1.2s ease-in-out infinite" : "none",
            }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#60a5fa", fontFamily:"'SF Mono','Fira Code',monospace" }}>
                {roomCode || "—"}
              </span>
              {roomName && <>
                <span style={{ width:1, height:14, background:"rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>{roomName}</span>
              </>}
            </div>
          )}

          {/* ── Divider ── */}
          <div style={{
            height:1, background:"rgba(255,255,255,0.08)", margin:"24px 0",
            animation: phase >= 1 ? "slideUp 0.5s 0.7s both" : "none",
          }} />

          {/* ── Stats row ── */}
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12,
            animation: phase >= 1 ? "slideUp 0.5s 0.75s both" : "none",
          }}>
            {[
              { icon:"📋", label:"Sections", value:"13 / 13" },
              { icon:"✅", label:"Fields", value:`${counter}%` },
              { icon:"🏥", label:"Status", value:"Live" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:12, padding:"14px 10px",
              }}>
                <div style={{ fontSize:20, marginBottom:5 }}>{icon}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{value}</div>
                <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Progress bar (auto-dismiss countdown) ── */}
          <div style={{
            marginTop:24, height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden",
            animation: phase >= 1 ? "slideUp 0.5s 0.85s both" : "none",
          }}>
            <div style={{
              height:"100%", borderRadius:2,
              background:"linear-gradient(90deg,#2563eb,#06b6d4,#10b981)",
              backgroundSize:"200% 100%",
              animation: phase >= 1 ? "barFill 5s 0.9s linear forwards, shimmer 2s 0.9s linear infinite" : "none",
            }} />
          </div>
          <div style={{
            fontSize:11, color:"rgba(255,255,255,0.28)", marginTop:8,
            animation: phase >= 1 ? "slideUp 0.4s 0.9s both" : "none",
          }}>
            Closing automatically in 5 seconds · <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={handleClose}>close now</span>
          </div>

          {/* ── Action buttons ── */}
          <div style={{
            display:"flex", gap:10, marginTop:24,
            animation: phase >= 1 ? "slideUp 0.5s 0.95s both" : "none",
          }}>
            <button onClick={handleClose} style={{
              flex:1, padding:"12px 0", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.8)",
              fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.2s",
            }}
              onMouseEnter={e => e.target.style.background="rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.target.style.background="rgba(255,255,255,0.07)"}
            >
              New RDS
            </button>
            <button onClick={handleClose} style={{
              flex:2, padding:"12px 0", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
              color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              boxShadow:"0 4px 16px rgba(37,99,235,0.4)",
              transition:"all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform="translateY(-1px)"; e.target.style.boxShadow="0 8px 24px rgba(37,99,235,0.5)"; }}
              onMouseLeave={e => { e.target.style.transform="translateY(0)"; e.target.style.boxShadow="0 4px 16px rgba(37,99,235,0.4)"; }}
            >
              View All Records →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
