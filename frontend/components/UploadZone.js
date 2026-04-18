"use client";
import { useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

async function extractFromBackend(type, content) {
  const res = await fetch(`${API}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Extraction failed");
  return data; // { fields, image }
}

// ─── COMPONENT ────────────────────────────────────────────
export default function UploadZone({ onExtracted }) {
  const [status,   setStatus]   = useState("idle");
  const [msg,      setMsg]      = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  // FIX 1: declared as async so await works inside
  async function processFile(file) {
    if (!file) return;

    const isXLS  = file.type.includes("spreadsheet") || /\.xlsx?$/i.test(file.name);
    const isDOCX = file.type.includes("wordprocessingml") || /\.docx?$/i.test(file.name);

    if (!isXLS && !isDOCX) {
      setStatus("error");
      setMsg("Unsupported file. Please upload an Excel (.xlsx) or Word (.docx).");
      return;
    }

    setStatus("loading");
    setMsg("Reading file…");

    try {
      // Read file as base64
      const base64Content = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result.split(",")[1]); // base64 part only
        r.onerror = rej;
        r.readAsDataURL(file);
      });

      const type = isDOCX ? "word" : "excel";

      setMsg("AI is mapping fields…");
      // FIX 2: use API (not API_BASE which was never defined)
      const result = await extractFromBackend(type, base64Content);
      const fields = result.fields;
      const image  = result.image || null;
      const count  = Object.keys(fields).length;

      if (count === 0 && !image) {
        setStatus("error");
        setMsg("No matching RDS fields found. Check that the file contains RDS data.");
        return;
      }

      onExtracted(fields, image);
      setStatus("done");
      const imgMsg = image ? " (image extracted)" : "";
      setMsg(`${count} fields auto-filled from "${file.name}"${imgMsg}. Review and complete remaining fields.`);
    } catch (e) {
      setStatus("error");
      setMsg(e.message || "Something went wrong.");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  const S = {
    idle:    { border:"#e2e8f0", bg:"#f8fafc",  icon:"📂", iconBg:"#eff6ff" },
    loading: { border:"#93c5fd", bg:"#eff6ff",  icon:"⏳", iconBg:"#dbeafe" },
    done:    { border:"#86efac", bg:"#f0fdf4",  icon:"✅", iconBg:"#dcfce7" },
    error:   { border:"#fca5a5", bg:"#fef2f2",  icon:"❌", iconBg:"#fee2e2" },
  }[status];

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        onClick={() => status !== "loading" && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "#2563eb" : S.border}`,
          background: dragging ? "#eff6ff" : S.bg,
          borderRadius: 14, padding: "20px",
          display: "flex", alignItems: "center", gap: 16,
          cursor: status === "loading" ? "wait" : "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 12, flexShrink: 0,
          background: S.iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22
        }}>
          {S.icon}
        </div>

        <div style={{ flex: 1 }}>
          {status === "idle" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                Upload Room Data Sheet to Auto-Fill
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                Drag &amp; drop or click — Excel or Word. AI extracts fields and images automatically.
              </div>
            </>
          )}
          {status === "loading" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="spinner" style={{
                width: 20, height: 20,
                border: "2px solid rgba(37,99,235,0.2)",
                borderTopColor: "#2563eb", borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }} />
              <div style={{ fontWeight: 600, fontSize: 13, color: "#2563eb" }}>{msg}</div>
            </div>
          )}
          {status === "done" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#15803d" }}>{msg}</div>
              <button
                onClick={e => { e.stopPropagation(); setStatus("idle"); setMsg(""); }}
                style={{ marginTop: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Upload a different file
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>{msg}</div>
              <button
                onClick={e => { e.stopPropagation(); setStatus("idle"); setMsg(""); }}
                style={{ marginTop: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Try again
              </button>
            </>
          )}
        </div>

        {status === "idle" && (
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {[["XLSX","#dcfce7","#15803d"],["DOCX","#dbeafe","#1d4ed8"]].map(([t, bg, c]) => (
              <span key={t} style={{
                background: bg, color: c, padding: "3px 10px",
                borderRadius: 20, fontSize: 11, fontWeight: 700
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.docx,.doc"
        style={{ display: "none" }}
        onChange={e => processFile(e.target.files[0])}
      />
    </div>
  );
}