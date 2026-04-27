"use client";
import { useState } from "react";

// ─── USER GROUPS DATA ──────────────────────────────────────
const USER_GROUP_CATEGORIES = [
  { category:"Clinical Staff", icon:"👨‍⚕️", roles:["Doctor","Consultant","Surgeon","Resident Doctor","Intern Doctor","Nurse","Head Nurse","Nursing Assistant"] },
  { category:"Technical & Diagnostic", icon:"🧪", roles:["Lab Technician","Radiology Technician","Radiologist","Sonographer","ECG Technician","Dialysis Technician"] },
  { category:"Pharmacy & Clinical Support", icon:"💊", roles:["Pharmacist","Clinical Pharmacist"] },
  { category:"Engineering & Maintenance", icon:"🧰", roles:["Biomedical Engineer","Maintenance Staff","Electrician","Plumber","HVAC Technician"] },
  { category:"Support Staff", icon:"🧹", roles:["Housekeeping Staff","Ward Boy / Attendant","Patient Care Assistant","Laundry Staff"] },
  { category:"Safety & Security", icon:"🛡️", roles:["Security Staff","Fire Safety Officer"] },
  { category:"Administrative Staff", icon:"🧑‍💼", roles:["Admin Staff","Receptionist","Front Desk Executive","Medical Records Staff","Billing Staff"] },
  { category:"Medical College / Academic", icon:"🎓", roles:["Student","Intern","Professor","Associate Professor","Lecturer","Researcher"] },
  { category:"Patients & Visitors", icon:"🧑‍🤝‍🧑", roles:["Patient","Patient Attendant","Visitor"] },
];

// ─── USER GROUPS INPUT ─────────────────────────────────────
function UserGroupsInput({ field, register, setValue, watch }) {
  const rawVal = watch?.(field.name) || "[]";
  let selected = [];
  try { selected = JSON.parse(rawVal); } catch { selected = []; }

  const getQty = (role) => selected.find(s => s.role === role)?.qty || 0;

  const updateRole = (role, qty) => {
    let next;
    if (qty <= 0) next = selected.filter(s => s.role !== role);
    else {
      const ex = selected.find(s => s.role === role);
      next = ex ? selected.map(s => s.role === role ? { ...s, qty } : s) : [...selected, { role, qty }];
    }
    setValue?.(field.name, JSON.stringify(next), { shouldDirty: true });
  };

  const [openCats, setOpenCats] = useState(new Set([USER_GROUP_CATEGORIES[0].category]));
  const toggleCat = (cat) => setOpenCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  return (
    <div style={{ border:"1.5px solid #e8edf5", borderRadius:12, overflow:"hidden", background:"#fff" }}>
      <input type="hidden" {...register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        validate: v => { try { return JSON.parse(v||"[]").length > 0 || "Select at least one user group"; } catch { return "Invalid value"; } }
      })} />

      {/* Header */}
      <div style={{ padding:"10px 14px", background:"#f8fafc", borderBottom:"1px solid #e8edf5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Select roles and set quantities</span>
        {selected.length > 0 && (
          <span style={{ background:"#dbeafe", color:"#1d4ed8", fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>
            {selected.length} role{selected.length !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>

      {/* Categories */}
      <div style={{ maxHeight:420, overflowY:"auto" }}>
        {USER_GROUP_CATEGORIES.map(({ category, icon, roles }) => {
          const isOpen = openCats.has(category);
          const catCount = roles.filter(r => getQty(r) > 0).length;
          return (
            <div key={category} style={{ borderBottom:"1px solid #f1f5f9" }}>
              <button type="button" onClick={() => toggleCat(category)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}
                onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background="none"}
              >
                <span style={{ fontSize:16 }}>{icon}</span>
                <span style={{ flex:1, fontSize:12.5, fontWeight:700, color:"#374151" }}>{category}</span>
                {catCount > 0 && <span style={{ background:"#dcfce7", color:"#15803d", fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{catCount} selected</span>}
                <span style={{ fontSize:11, color:"#94a3b8", display:"inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>▼</span>
              </button>

              {isOpen && (
                <div style={{ padding:"4px 14px 10px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
                  {roles.map(role => {
                    const qty = getQty(role);
                    const active = qty > 0;
                    return (
                      <div key={role} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", borderRadius:8, gap:8, background: active ? "#eff6ff" : "#f8fafc", border:`1px solid ${active ? "#bfdbfe" : "#e8edf5"}`, transition:"all 0.15s" }}>
                        <span style={{ fontSize:12, color: active ? "#1d4ed8" : "#374151", fontWeight: active ? 600 : 400, flex:1 }}>{role}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          <button type="button" onClick={() => updateRole(role, qty - 1)}
                            style={{ width:22, height:22, borderRadius:5, border:"1px solid #e2e8f0", background: active ? "#dbeafe" : "#f1f5f9", cursor:"pointer", fontSize:14, color: active ? "#1d4ed8" : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                          <span style={{ minWidth:20, textAlign:"center", fontSize:12.5, fontWeight:700, color: active ? "#1d4ed8" : "#94a3b8" }}>{qty}</span>
                          <button type="button" onClick={() => updateRole(role, qty + 1)}
                            style={{ width:22, height:22, borderRadius:5, border:"1px solid #e2e8f0", background: active ? "#2563eb" : "#f1f5f9", cursor:"pointer", fontSize:14, color: active ? "#fff" : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selected.length > 0 && (
        <div style={{ padding:"10px 14px", background:"#f0fdf4", borderTop:"1px solid #bbf7d0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#15803d", marginBottom:5 }}>SELECTED ROLES</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {selected.map(({ role, qty }) => (
              <span key={role} style={{ background:"#dcfce7", color:"#15803d", border:"1px solid #86efac", borderRadius:20, padding:"3px 10px", fontSize:11.5, fontWeight:600 }}>
                {role} × {qty}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QTY COUNTER ──────────────────────────────────────────
function QtyInput({ field, register, setValue, watch }) {
  const val = parseInt(watch?.(field.name)) || 0;
  return (
    <div className="qty-input-wrap">
      <button type="button" className="qty-btn"
        onClick={() => setValue?.(field.name, Math.max(0, val - 1))}>−</button>
      <input
        type="number"
        className="qty-input"
        min={0}
        {...register(field.name, { valueAsNumber: true })}
        placeholder="0"
      />
      <button type="button" className="qty-btn"
        onClick={() => setValue?.(field.name, val + 1)}>+</button>
    </div>
  );
}

// ─── YES/NO TOGGLE ─────────────────────────────────────────
function YesNoInput({ field, register, setValue, watch }) {
  const val = watch?.(field.name);
  return (
    <div className="yesno-wrap">
      <input type="hidden" {...register(field.name)} />
      <button type="button"
        className={`yesno-btn ${val === "Yes" ? "selected-yes" : ""}`}
        onClick={() => setValue?.(field.name, val === "Yes" ? "" : "Yes")}>
        ✓ Yes
      </button>
      <button type="button"
        className={`yesno-btn ${val === "No" ? "selected-no" : ""}`}
        onClick={() => setValue?.(field.name, val === "No" ? "" : "No")}>
        ✗ No
      </button>
    </div>
  );
}

// ─── MAIN RENDERER ─────────────────────────────────────────
export default function FieldRenderer({ field, register, errors, setValue, watch }) {
  const err = errors?.[field.name];
  const baseClass = err ? "error" : "";

  return (
    <div className={`field-group col-${field.colSpan || 2}`}>
      <label className="field-label">
        {field.label}
        {field.required && <span className="required-star">*</span>}
      </label>

      {field.type === "text" && (
        <input
          className={`rds-input ${baseClass}`}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {field.type === "number" && field.colSpan === 1 ? (
        <QtyInput field={field} register={register} setValue={setValue} watch={watch} />
      ) : field.type === "number" ? (
        <input
          type="number"
          className={`rds-input ${baseClass}`}
          placeholder={field.placeholder || "0"}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
            valueAsNumber: true
          })}
        />
      ) : null}

      {field.type === "textarea" && (
        <textarea
          className={`rds-textarea ${baseClass}`}
          placeholder={field.placeholder || `Describe ${field.label.toLowerCase()}`}
          rows={3}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {field.type === "select" && (
        <select
          className={`rds-select ${baseClass}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}>
          <option value="">— Select {field.label} —</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === "usergroups" && (
        <UserGroupsInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "yesno" && (
        <YesNoInput field={field} register={register} setValue={setValue} watch={watch} />
      )}

      {field.type === "date" && (
        <input
          type="date"
          className={`rds-input ${baseClass}`}
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })}
        />
      )}

      {err && (
        <span className="field-error">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/>
          </svg>
          {err.message}
        </span>
      )}

      {field.hint && !err && (
        <span className="field-hint">{field.hint}</span>
      )}
    </div>
  );
}