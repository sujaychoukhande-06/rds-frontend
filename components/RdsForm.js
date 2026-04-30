"use client";

import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { rdsSchema } from "../schema";
import SectionCard from "./SectionCard";
import FieldRenderer from "./FieldRenderer";
import UploadZone from "./UploadZone";
import SuccessOverlay from "./SuccessOverlay";

const DRAFT_KEY = "rds_draft_v2";
const API = process.env.NEXT_PUBLIC_API_URL || "";

if (!API) console.error("API URL missing");

const sectionDesc = {
  "room-identity":           "Basic identification and classification of this room",
  "function-workflow":       "Define the clinical purpose and operational workflow",
  "capacity-operations":     "Occupancy, staffing, and operational hour requirements",
  "planning-zoning":         "Functional zoning, circulation and access control",
  "adjacency-matrix":        "Spatial relationships with neighbouring spaces",
  "spatial-requirements":    "Dimensions, clearances, and compliance requirements",
  "room-finishes":           "Material specifications for all surfaces",
  "engineering-systems":     "HVAC, electrical, medical gas and plumbing requirements",
  "digital-smart-systems":   "IT, clinical systems and smart technology integration",
  "safety-infection-control":"Infection prevention, safety and hazard provisions",
  "user-experience":         "Comfort, privacy, lighting and wayfinding considerations",
  "fittings-furniture":      "Fixed and loose furniture quantities",
  "fixtures-equipment":      "Clinical equipment and associated services",
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return { toasts, addToast };
}

function SectionFields({ section, register, errors, setValue, watch }) {
  if (section.subsections) {
    return (
      <>
        {section.subsections.map((sub, si) => (
          <div key={si} className={si > 0 ? "rds-subsection" : ""}>
            <div className="rds-subsection-title">{sub.title}</div>
            <div className="form-grid">
              {sub.fields.map(field => (
                <FieldRenderer key={field.name} field={field}
                  register={register} errors={errors} setValue={setValue} watch={watch} />
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="form-grid">
      {section.fields.map(field => (
        <FieldRenderer key={field.name} field={field}
          register={register} errors={errors} setValue={setValue} watch={watch} />
      ))}
    </div>
  );
}

// ─── Main form — accepts optional editRecord prop ──────────────────────────
// editRecord shape: { id: string, data: object }
// When editRecord is provided the form pre-fills all fields and resubmits as
// a PUT /data/:id (update) instead of POST /save (new).
export default function RdsForm({ onSectionChange, jumpToSection, editRecord, onEditDone }) {
  const [currentIdx,        setCurrentIdx]        = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [lastSaved,         setLastSaved]         = useState(null);
  const [roomImage,         setRoomImage]         = useState(null);
  const [showSuccess,       setShowSuccess]       = useState(false);
  const [submittedRoom,     setSubmittedRoom]     = useState({ code:"", name:"" });
  const [isEditMode,        setIsEditMode]        = useState(false);
  const [editId,            setEditId]            = useState(null);
  const { toasts, addToast } = useToast();

  const {
    register, handleSubmit, setValue, watch, trigger, getValues, reset,
    formState: { errors, isDirty: formIsDirty },
  } = useForm({ mode:"onBlur" });

  const currentSection = rdsSchema[currentIdx];

  // ── Sync sidebar jump ──────────────────────────────────────────────────────
  useEffect(() => {
    if (jumpToSection && typeof jumpToSection.idx === "number") {
      setCurrentIdx(jumpToSection.idx);
      window.scrollTo({ top:0, behavior:"smooth" });
    }
  }, [jumpToSection]);

  // ── Load edit record when provided ────────────────────────────────────────
  useEffect(() => {
    if (editRecord && editRecord.id && editRecord.data) {
      // Clear any draft first
      localStorage.removeItem(DRAFT_KEY);
      // Reset form with existing data
      reset(editRecord.data);
      // Mark all sections as completed since we have full data
      setCompletedSections(new Set(rdsSchema.map(s => s.id)));
      setIsEditMode(true);
      setEditId(editRecord.id);
      setCurrentIdx(0);
      window.scrollTo({ top:0, behavior:"smooth" });
      addToast("Room data loaded — make your changes and resubmit", "success");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRecord]);

  // ── Restore draft (only when NOT editing) ─────────────────────────────────
  useEffect(() => {
    if (editRecord) return; // skip draft restore in edit mode
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed.data);
        if (parsed.completedSections) setCompletedSections(new Set(parsed.completedSections));
        if (parsed.roomImage) setRoomImage(parsed.roomImage);
        setLastSaved(new Date(parsed.timestamp));
        addToast("Draft restored automatically", "success");
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save draft every 30s ──────────────────────────────────────────────
  useEffect(() => {
    if (!formIsDirty || isEditMode) return;
    const timer = setTimeout(() => saveDraft(true), 30000);
    return () => clearTimeout(timer);
  }, [formIsDirty, isEditMode]);

  const watchedValues = watch();

  // Count sections with at least one filled field
  const filledSectionsCount = rdsSchema.filter(section => {
    const allNames = section.subsections
      ? section.subsections.flatMap(s => s.fields.map(f => f.name))
      : (section.fields || []).map(f => f.name);
    return allNames.some(n => {
      const v = watchedValues[n];
      return v !== undefined && v !== null && v !== "" && !(typeof v === "number" && isNaN(v));
    });
  }).length;

  useEffect(() => {
    onSectionChange?.({ current: currentIdx, completed: filledSectionsCount });
  }, [currentIdx, filledSectionsCount, onSectionChange]);

  const saveDraft = useCallback((auto = false) => {
    try {
      const data = getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data, completedSections: [...completedSections],
        timestamp: new Date().toISOString(), roomImage,
      }));
      setLastSaved(new Date());
      if (!auto) addToast("Draft saved successfully", "success");
    } catch { addToast("Could not save draft", "error"); }
  }, [getValues, completedSections, roomImage, addToast]);

  const getSectionFieldNames = (section) => {
    if (section.subsections) return section.subsections.flatMap(s => s.fields.map(f => f.name));
    return section.fields.map(f => f.name);
  };

  const handleNext = async () => {
    const valid = await trigger(getSectionFieldNames(currentSection));
    if (!valid) { addToast("Please complete required fields", "error"); return; }
    setCompletedSections(prev => new Set([...prev, currentSection.id]));
    if (currentIdx < rdsSchema.length - 1) {
      setCurrentIdx(i => i + 1);
      window.scrollTo({ top:0, behavior:"smooth" });
    }
  };

  // ── Submit (new) ───────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (currentIdx !== rdsSchema.length - 1) return;
    setIsSubmitting(true);
    try {
      const payload = { ...data, roomImage };
      await axios.post(`${API}/save`, payload);
      localStorage.removeItem(DRAFT_KEY);
      setCompletedSections(new Set(rdsSchema.map(s => s.id)));
      setSubmittedRoom({ code: data.roomCode || "", name: data.roomName || "" });
      setShowSuccess(true);
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      addToast("Submission failed — please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Update (edit mode) ────────────────────────────────────────────────────
  const onUpdate = async (data) => {
    if (currentIdx !== rdsSchema.length - 1) return;
    setIsSubmitting(true);
    try {
      await axios.put(`${API}/data/${editId}`, { ...data, roomImage });
      setSubmittedRoom({ code: data.roomCode || "", name: data.roomName || "" });
      addToast("Room updated successfully!", "success");
      setShowSuccess(true);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      addToast("Update failed — please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle extracted fields from UploadZone ───────────────────────────────
  const handleExtracted = useCallback((fields, image) => {
    Object.entries(fields).forEach(([key, value]) => {
      setValue(key, value, { shouldDirty:true, shouldValidate:false });
    });
    if (image) setRoomImage(image);
    addToast(`✓ ${Object.keys(fields).length} fields auto-filled${image ? " + room image extracted" : ""}`, "success");
    window.scrollTo({ top:300, behavior:"smooth" });
  }, [setValue, addToast]);

  // ── Reset all fields ──────────────────────────────────────────────────────
  const handleReset = () => {
    if (!confirm("Reset all fields and start over? Your draft will be lost.")) return;
    reset({});
    setCompletedSections(new Set());
    setCurrentIdx(0);
    localStorage.removeItem(DRAFT_KEY);
    setRoomImage(null);
    setIsEditMode(false);
    setEditId(null);
    window.scrollTo({ top:0, behavior:"smooth" });
    addToast("Form reset — start fresh", "success");
  };

  const isLastSection   = currentIdx === rdsSchema.length - 1;
  const funcSectionIdx  = rdsSchema.findIndex(s => s.id === "function-workflow");

  return (
    <>
      {/* ── EDIT MODE BANNER ── */}
      {isEditMode && (
        <div style={{
          background:"linear-gradient(135deg,#eff6ff,#dbeafe)",
          border:"1px solid #bfdbfe", borderRadius:12,
          padding:"14px 20px", marginBottom:20,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>✏️</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13.5, color:"#1d4ed8" }}>
                Edit Mode — Modifying existing room data sheet
              </div>
              <div style={{ fontSize:12, color:"#3b82f6", marginTop:2 }}>
                Make your changes across any section, then click "Update RDS" on the last section to save.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditId(null);
              reset({});
              setCompletedSections(new Set());
              setCurrentIdx(0);
              if (onEditDone) onEditDone();
            }}
            style={{
              padding:"6px 14px", background:"#fff", color:"#1d4ed8",
              border:"1px solid #bfdbfe", borderRadius:8,
              cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0,
            }}>
            ✕ Cancel Edit
          </button>
        </div>
      )}

      {/* Upload zone — only on section 0 and not in edit mode */}
      {currentIdx === 0 && !isEditMode && <UploadZone onExtracted={handleExtracted} />}

      {/* STEPPER DOTS */}
      <div className="section-stepper">
        {rdsSchema.map((s, i) => (
          <div key={s.id}
            className={`stepper-dot ${completedSections.has(s.id) ? "done" : i === currentIdx ? "active" : ""}`}
            onClick={() => setCurrentIdx(i)} title={s.section} />
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={e => e.preventDefault()}>
        <SectionCard
          title={currentSection.section}
          icon={currentSection.icon}
          color={currentSection.color}
          description={sectionDesc[currentSection.id]}
          badge={`${currentIdx + 1} of ${rdsSchema.length}`}
        >
          {/* Room image panel */}
          {currentIdx === funcSectionIdx && roomImage && (
            <div style={{
              marginBottom:20, padding:14,
              background:"#f0f9ff", border:"1px solid #bae6fd",
              borderRadius:12, display:"flex", alignItems:"flex-start", gap:14,
            }}>
              <img
                src={roomImage}
                alt="Room layout / floor plan"
                style={{
                  maxWidth:220, maxHeight:180, objectFit:"contain",
                  borderRadius:8, border:"1px solid #e0f2fe", background:"#fff",
                }}
              />
              <div>
                <div style={{ fontWeight:700, fontSize:12.5, color:"#0369a1", marginBottom:4 }}>
                  📐 Room Image (extracted from uploaded file)
                </div>
                <div style={{ fontSize:11.5, color:"#64748b", lineHeight:1.5 }}>
                  This image was automatically extracted from your uploaded document.
                </div>
                <button type="button"
                  onClick={() => setRoomImage(null)}
                  style={{ marginTop:8, fontSize:11, color:"#dc2626", background:"none", border:"none", cursor:"pointer", padding:0 }}>
                  × Remove image
                </button>
              </div>
            </div>
          )}

          <SectionFields section={currentSection} register={register}
            errors={errors} setValue={setValue} watch={watch} />
        </SectionCard>

        {/* STEP NAV */}
        <div className="step-nav">
          <div className="step-counter">
            Section <strong>{currentIdx + 1}</strong> of <strong>{rdsSchema.length}</strong>
            {isEditMode && (
              <span style={{ marginLeft:12, background:"#dbeafe", color:"#1d4ed8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>
                EDIT MODE
              </span>
            )}
            {!isEditMode && lastSaved && (
              <span style={{ marginLeft:16, color:"#94a3b8", fontSize:11 }}>
                Draft saved {lastSaved.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button type="button" className="btn btn-ghost btn-sm"
              onClick={handleReset}
              style={{ color:"#dc2626", borderColor:"#fecaca" }}
              title="Clear all fields">
              🔄 Reset
            </button>
            {!isEditMode && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveDraft(false)}>
                💾 Save Draft
              </button>
            )}
            {currentIdx > 0 && (
              <button type="button" className="btn btn-ghost"
                onClick={() => { setCurrentIdx(i => i-1); window.scrollTo({ top:0, behavior:"smooth" }); }}>
                ← Back
              </button>
            )}
            {!isLastSection ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Next Section →
              </button>
            ) : isEditMode ? (
              /* UPDATE button in edit mode */
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onUpdate)()}
                style={{ background:"linear-gradient(135deg,#2563eb,#1d4ed8)", minWidth:140 }}
              >
                {isSubmitting ? (
                  <><span className="spinner" style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite",display:"inline-block" }} /> Updating…</>
                ) : "✓ Update RDS"}
              </button>
            ) : (
              /* SUBMIT button for new records */
              <button
                type="button"
                className="btn btn-success"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? (
                  <><span className="spinner" style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite",display:"inline-block" }} /> Submitting…</>
                ) : "✓ Submit RDS"}
              </button>
            )}
          </div>
        </div>
      </form>

      {showSuccess && (
        <SuccessOverlay
          roomCode={submittedRoom.code}
          roomName={submittedRoom.name}
          onClose={() => {
            setShowSuccess(false);
            setCurrentIdx(0);
            reset({});
            setCompletedSections(new Set());
            setRoomImage(null);
            setIsEditMode(false);
            setEditId(null);
            if (onEditDone) onEditDone();
          }}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}><span>{t.msg}</span></div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
