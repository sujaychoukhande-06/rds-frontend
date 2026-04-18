"use client";

import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { rdsSchema } from "../schema";
import SectionCard from "./SectionCard";
import FieldRenderer from "./FieldRenderer";
import UploadZone from "./UploadZone";

const DRAFT_KEY = "rds_draft_v2";
const API = process.env.NEXT_PUBLIC_API_URL || "";

if (!API) {
  console.error("API URL missing");
}

const sectionDesc = {
  "room-identity":          "Basic identification and classification of this room",
  "function-workflow":      "Define the clinical purpose and operational workflow",
  "capacity-operations":    "Occupancy, staffing, and operational hour requirements",
  "planning-zoning":        "Functional zoning, circulation and access control",
  "adjacency-matrix":       "Spatial relationships with neighbouring spaces",
  "spatial-requirements":   "Dimensions, clearances, and compliance requirements",
  "room-finishes":          "Material specifications for all surfaces",
  "engineering-systems":    "HVAC, electrical, medical gas and plumbing requirements",
  "digital-smart-systems":  "IT, clinical systems and smart technology integration",
  "safety-infection-control":"Infection prevention, safety and hazard provisions",
  "user-experience":        "Comfort, privacy, lighting and wayfinding considerations",
  "fittings-furniture":     "Fixed and loose furniture quantities",
  "fixtures-equipment":     "Clinical equipment and associated services"
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

export default function RdsForm({ onSectionChange, jumpToSection }) {
  const [currentIdx,        setCurrentIdx]        = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [lastSaved,         setLastSaved]         = useState(null);
  const [roomImage,         setRoomImage]         = useState(null);
  const { toasts, addToast } = useToast();

  // Sync when sidebar clicks a section
  useEffect(() => {
    if (jumpToSection && typeof jumpToSection.idx === "number") {
      setCurrentIdx(jumpToSection.idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [jumpToSection]);

  const {
    register, handleSubmit, setValue, watch, trigger, getValues, reset,
    formState: { errors, isDirty: formIsDirty }
  } = useForm({ mode: "onBlur" });

  const currentSection = rdsSchema[currentIdx];

  useEffect(() => {
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

  useEffect(() => {
    if (!formIsDirty) return;
    const timer = setTimeout(() => saveDraft(true), 30000);
    return () => clearTimeout(timer);
  }, [formIsDirty]);

  useEffect(() => { onSectionChange?.(currentIdx); }, [currentIdx, onSectionChange]);

  const saveDraft = useCallback((auto = false) => {
    try {
      const data = getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data, completedSections: [...completedSections],
        timestamp: new Date().toISOString(),
        roomImage
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Include the room image in the submission data
      const payload = { ...data, roomImage };
      await axios.post(`${API}/save`, payload);
      localStorage.removeItem(DRAFT_KEY);
      setCompletedSections(new Set(rdsSchema.map(s => s.id)));
      addToast("✓ Room Data Sheet submitted successfully!", "success");
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
      addToast("Submission failed — please try again", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle extracted fields + image from UploadZone ─────
  const handleExtracted = useCallback((fields, image) => {
    Object.entries(fields).forEach(([key, value]) => {
      setValue(key, value, { shouldDirty: true, shouldValidate: false });
    });
    if (image) setRoomImage(image);
    addToast(`✓ ${Object.keys(fields).length} fields auto-filled${image ? " + room image extracted" : ""}`, "success");
    window.scrollTo({ top: 300, behavior: "smooth" });
  }, [setValue, addToast]);

  // ── Reset all form fields and start fresh ───────────────
  const handleReset = () => {
    if (!confirm("Reset all fields and start over? Your draft will be lost.")) return;
    reset({});
    setCompletedSections(new Set());
    setCurrentIdx(0);
    localStorage.removeItem(DRAFT_KEY);
    setRoomImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast("Form reset — start fresh", "success");
  };

  const isLastSection = currentIdx === rdsSchema.length - 1;
  const funcSectionIdx = rdsSchema.findIndex(s => s.id === "function-workflow");

  return (
    <>
      {/* Upload zone — only on section 0 */}
      {currentIdx === 0 && <UploadZone onExtracted={handleExtracted} />}

      {/* STEPPER DOTS */}
      <div className="section-stepper">
        {rdsSchema.map((s, i) => (
          <div key={s.id}
            className={`stepper-dot ${completedSections.has(s.id) ? "done" : i === currentIdx ? "active" : ""}`}
            onClick={() => setCurrentIdx(i)} title={s.section} />
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <SectionCard
          title={currentSection.section}
          icon={currentSection.icon}
          color={currentSection.color}
          description={sectionDesc[currentSection.id]}
          badge={`${currentIdx + 1} of ${rdsSchema.length}`}
        >
          {/* ── Room image panel — shown in Function & Workflow section ── */}
          {currentIdx === funcSectionIdx && roomImage && (
            <div style={{
              marginBottom: 20, padding: 14,
              background: "#f0f9ff", border: "1px solid #bae6fd",
              borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 14
            }}>
              <img
                src={roomImage}
                alt="Room layout / floor plan"
                style={{
                  maxWidth: 220, maxHeight: 180, objectFit: "contain",
                  borderRadius: 8, border: "1px solid #e0f2fe", background: "#fff"
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0369a1", marginBottom: 4 }}>
                  📐 Room Image (extracted from uploaded file)
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>
                  This image was automatically extracted from your uploaded document.
                  It will be saved with the draft for reference.
                </div>
                <button type="button"
                  onClick={() => setRoomImage(null)}
                  style={{ marginTop: 8, fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
            {lastSaved && (
              <span style={{ marginLeft: 16, color: "#94a3b8", fontSize: 11 }}>
                Draft saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
              title="Clear all fields and start over"
            >
              🔄 Reset
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveDraft(false)}>💾 Save Draft</button>
            {currentIdx > 0 && (
              <button type="button" className="btn btn-ghost"
                onClick={() => { setCurrentIdx(i => i - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                ← Back
              </button>
            )}
            {!isLastSection ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next Section →</button>
            ) : (
              <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="spinner" style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite",display:"inline-block" }} /> Submitting…</>
                ) : "✓ Submit RDS"}
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}><span>{t.msg}</span></div>)}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}