export const rdsSchema = [
  {
    id: "room-identity",
    section: "Room Identity",
    icon: "🏥",
    color: "#0ea5e9",
    fields: [
      { name: "project", label: "Project", type: "text", required: true, colSpan: 2 },
      { name: "department", label: "Department", type: "text", required: true, colSpan: 2 },
      { name: "roomName", label: "Room Name", type: "text", required: true, colSpan: 2 },
      { name: "roomCode", label: "Room Code", type: "text", required: true, colSpan: 2 },
      { name: "location", label: "Location", type: "text", required: true, colSpan: 4 },
      {
        name: "roomTypology", label: "Room Typology", type: "select", required: true, colSpan: 2,
        options: ["ICU", "Ward", "OT", "Emergency", "Outpatient", "Diagnostic", "Laboratory", "Pharmacy", "Administrative", "Support", "NICU", "PICU", "CCU", "HDU", "Isolation", "Other"]
      },
      {
        name: "criticalityLevel", label: "Criticality Level", type: "select", required: true, colSpan: 2,
        options: ["Critical", "High", "Medium", "Low", "Ancillary"]
      },
      {
        name: "infectionRiskCategory", label: "Infection Risk Category", type: "select", required: true, colSpan: 2,
        options: ["Very High", "High", "Medium", "Low", "Minimal"]
      },
      {
        name: "isolationType", label: "Isolation Type", type: "select", required: false, colSpan: 2,
        options: ["None", "Contact", "Droplet", "Airborne", "Protective (Reverse)", "Combined", "Strict Isolation"]
      }
    ]
  },
  {
    id: "spatial-requirements",
    section: "Spatial Requirements",
    icon: "📐",
    color: "#06b6d4",
    fields: [
      { name: "netArea", label: "Net Area (m²)", type: "number", placeholder: "e.g. 35", required: true, colSpan: 2 },
      { name: "minimumDimensions", label: "Minimum Dimensions (L × W)", type: "text", placeholder: "e.g. 7m × 5m", required: false, colSpan: 2 },
      { name: "clearances", label: "Clearances", type: "text", placeholder: "Around equipment/bed", required: false, colSpan: 2 },
      { name: "ceilingHeight", label: "Ceiling Height (m)", type: "number", placeholder: "e.g. 3.0", required: false, colSpan: 2 },
      {
        name: "doorType", label: "Door Type", type: "select", required: false, colSpan: 2,
        options: ["Sliding", "Hinged (Single)", "Hinged (Double)", "Automatic Sliding", "Hermetic Sealed", "Fire-Rated", "Other"]
      },
      { name: "doorSize", label: "Door Size", type: "text", placeholder: "e.g. 1200 × 2100 mm", required: false, colSpan: 2 },
      {
        name: "accessibility", label: "Accessibility Compliance", type: "select", required: true, colSpan: 4,
        options: ["Full Barrier-Free Compliance", "Partial Compliance", "Standard", "Not Applicable"]
      }
    ]
  },
  {
    id: "room-finishes",
    section: "Room Finishes",
    icon: "🎨",
    color: "#ec4899",
    fields: [
      { name: "floor", label: "Floor", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "skirting", label: "Skirting", type: "text", placeholder: "Type & height", required: false, colSpan: 2 },
      { name: "walls", label: "Walls", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "ceiling", label: "Ceiling", type: "text", placeholder: "Material & specification", required: false, colSpan: 2 },
      { name: "wallProtection", label: "Wall Protection", type: "text", placeholder: "Crash rails, corner guards etc.", required: false, colSpan: 2 },
      { name: "specialFinishes", label: "Special Finishes", type: "textarea", placeholder: "Anti-microbial, lead lining, etc.", required: false, colSpan: 2 }
    ]
  },
  {
    id: "function-workflow",
    section: "Function & Workflow",
    icon: "⚙️",
    color: "#8b5cf6",
    fields: [
      { name: "roomFunction", label: "Room Function", type: "textarea", required: true, colSpan: 4 },
      { name: "keyActivities", label: "Key Activities", type: "textarea", required: true, colSpan: 4 },
      { name: "userGroups", label: "User Groups", type: "textarea", required: true, colSpan: 2 },
      { name: "operationalScenarios", label: "Operational Scenarios", type: "textarea", required: false, colSpan: 2 }
    ]
  },
  {
    id: "capacity-operations",
    section: "Capacity & Operations",
    icon: "📊",
    color: "#10b981",
    fields: [
      { name: "patientCapacity", label: "Patient Capacity", type: "number", placeholder: "No. of beds / users", required: true, colSpan: 2 },
      { name: "staffRequirement", label: "Staff Requirement", type: "number", placeholder: "Per shift", required: true, colSpan: 2 },
      { name: "peakLoad", label: "Peak Load", type: "number", placeholder: "Max occupancy", required: false, colSpan: 2 },
      { name: "throughput", label: "Throughput", type: "text", placeholder: "Patients/day (if applicable)", required: false, colSpan: 2 },
      { name: "averageStayTime", label: "Average Stay Time(min)", type: "text", placeholder: "Per patient", required: false, colSpan: 2 },
      { name: "surgeCapacity", label: "Surge Capacity", type: "text", placeholder: "Expandability logic", required: false, colSpan: 2 },
      {
        name: "operationalHours", label: "Operational Hours", type: "select", required: true, colSpan: 4,
        options: ["24×7", "Scheduled (Day only)", "Scheduled (Day & Evening)", "On-call", "As Required"]
      }
    ]
  },
  {
    id: "planning-zoning",
    section: "Planning & Zoning",
    icon: "🗺️",
    color: "#f59e0b",
    subsections: [
      {
        title: "Functional Zones",
        fields: [
          { name: "patientZone", label: "Patient Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "staffZone", label: "Staff Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "equipmentZone", label: "Equipment Zone", type: "textarea", required: false, colSpan: 4 },
          { name: "cleanZone", label: "Clean Zone", type: "textarea", required: false, colSpan: 2 },
          { name: "dirtyZone", label: "Dirty Zone", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Circulation",
        fields: [
          { name: "patientFlow", label: "Patient Flow", type: "textarea", required: false, colSpan: 4 },
          { name: "staffFlow", label: "Staff Flow", type: "textarea", required: false, colSpan: 2 },
          { name: "materialFlow", label: "Material Flow", type: "textarea", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Access Control",
        fields: [
          { name: "entryPoints", label: "Entry Points", type: "textarea", required: false, colSpan: 2 },
          { name: "restrictedZones", label: "Restricted Zones", type: "textarea", required: false, colSpan: 2 }
        ]
      }
    ]
  },
  {
    id: "adjacency-matrix",
    section: "Adjacency Matrix",
    icon: "🔗",
    color: "#ef4444",
    fields: [
      { name: "mustBeAdjacent", label: "Must be Adjacent — Rooms", type: "textarea", placeholder: "e.g. Sterile Store, Scrub Area", required: false, colSpan: 4 },
      { name: "shouldBeAdjacent", label: "Should be Adjacent — Rooms", type: "textarea", placeholder: "e.g. Recovery, Anaesthesia Room", required: false, colSpan: 4 },
      { name: "avoidAdjacency", label: "Avoid Adjacency — Rooms", type: "textarea", placeholder: "e.g. Dirty Utility, Waiting Area", required: false, colSpan: 4 }
    ]
  },
  {
    id: "engineering-systems",
    section: "Engineering Systems",
    icon: "⚡",
    color: "#f97316",
    subsections: [
      {
        title: "HVAC",
        fields: [
          { name: "airChangesACH", label: "Air Changes (ACH)", type: "number", placeholder: "e.g. 15", required: false, colSpan: 2 },
          {
            name: "pressure", label: "Pressure Regime", type: "select", required: false, colSpan: 2,
            options: ["Positive (+ve)", "Negative (-ve)", "Neutral", "Variable"]
          },
          { name: "temperature", label: "Temperature (°C)", type: "text", placeholder: "e.g. 20–24°C", required: false, colSpan: 2 },
          { name: "humidity", label: "Humidity (%RH)", type: "text", placeholder: "e.g. 45–60%", required: false, colSpan: 2 },
          {
            name: "filtration", label: "Filtration", type: "select", required: false, colSpan: 2,
            options: ["HEPA H14", "HEPA H13", "MERV-16", "MERV-13", "Standard", "ULPA", "Other"]
          },
          { name: "airflowDirection", label: "Airflow Direction", type: "text", placeholder: "e.g. Top supply, Low exhaust", required: false, colSpan: 2 },
          {
            name: "pandemicMode", label: "Pandemic Mode Capable", type: "yesno", required: false, colSpan: 4
          }
        ]
      },
      {
        title: "Electrical",
        fields: [
          { name: "powerLoad", label: "Power Load (kVA)", type: "number", placeholder: "e.g. 15", required: false, colSpan: 2 },
          { name: "normalPower", label: "Normal Power Supply", type: "text", placeholder: "e.g. 230V/50Hz", required: false, colSpan: 2 },
          { name: "emergencyPower", label: "Emergency Power", type: "text", placeholder: "e.g. Gen-set within 10s", required: false, colSpan: 2 },
          {
            name: "ups", label: "UPS Required", type: "yesno", required: false, colSpan: 2
          },
          { name: "numberOfSockets", label: "No. of Sockets", type: "number", placeholder: "e.g. 12", required: false, colSpan: 2 },
          { name: "specialOutlets", label: "Special Outlets", type: "text", placeholder: "e.g. IEC 60601 medical-grade", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Medical Gases",
        fields: [
          { name: "oxygen", label: "Oxygen (O₂) — No. of Outlets", type: "number", placeholder: "e.g. 4", required: false, colSpan: 2 },
          { name: "medicalAir", label: "Medical Air — No. of Outlets", type: "number", placeholder: "e.g. 2", required: false, colSpan: 2 },
          { name: "vacuum", label: "Vacuum (AGSS) — No. of Outlets", type: "number", placeholder: "e.g. 2", required: false, colSpan: 2 },
          { name: "nitrousOxide", label: "Nitrous Oxide — No. of Outlets", type: "number", placeholder: "e.g. 1", required: false, colSpan: 2 }
        ]
      },
      {
        title: "Plumbing",
        fields: [
          { name: "handWash", label: "Hand Wash Basins", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "wc", label: "WC / Toilet", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "shower", label: "Shower", type: "number", placeholder: "No. of units", required: false, colSpan: 2 },
          { name: "plumbingSpecialSystems", label: "Special Plumbing Systems", type: "text", placeholder: "e.g. Sluice, Bedpan washer", required: false, colSpan: 2 }
        ]
      }
    ]
  },
  {
    id: "digital-smart-systems",
    section: "Digital & Smart Systems",
    icon: "💻",
    color: "#6366f1",
    fields: [
      { name: "hisEmr", label: "HIS / EMR Integration", type: "text", placeholder: "System name & integration type", required: false, colSpan: 2 },
      { name: "pacs", label: "PACS", type: "text", placeholder: "Imaging system details", required: false, colSpan: 2 },
      { name: "lis", label: "LIS (Laboratory)", type: "text", placeholder: "Lab information system", required: false, colSpan: 2 },
      { name: "rtls", label: "RTLS (Real-time Location)", type: "text", placeholder: "Asset/patient tracking", required: false, colSpan: 2 },
      { name: "nurseCall", label: "Nurse Call System", type: "text", placeholder: "System specification", required: false, colSpan: 2 },
      {
        name: "cctv", label: "CCTV / Surveillance", type: "yesno", required: false, colSpan: 2
      },
      { name: "iotSensors", label: "IoT Sensors", type: "text", placeholder: "Environmental, occupancy, etc.", required: false, colSpan: 2 },
      { name: "aiAnalytics", label: "AI / Analytics", type: "text", placeholder: "Clinical decision support, etc.", required: false, colSpan: 2 }
    ]
  },
  {
    id: "safety-infection-control",
    section: "Safety & Infection Control",
    icon: "🛡️",
    color: "#dc2626",
    fields: [
      {
        name: "pressureRegime", label: "Pressure Regime", type: "select", required: false, colSpan: 2,
        options: ["Positive (+ve)", "Negative (-ve)", "Neutral", "Variable / Switchable"]
      },
      {
        name: "isolationLevel", label: "Isolation Level", type: "select", required: false, colSpan: 2,
        options: ["Level 1 – Standard", "Level 2 – Enhanced", "Level 3 – Strict", "Level 4 – Maximum / BSL-4", "Not Applicable"]
      },
      {
        name: "radiationProtection", label: "Radiation Protection", type: "select", required: false, colSpan: 2,
        options: ["Not Required", "Lead Lining Required", "Lead Glass Windows", "Controlled Zone", "Supervised Zone"]
      },
      {
        name: "biohazardHandling", label: "Biohazard Handling", type: "select", required: false, colSpan: 2,
        options: ["Not Applicable", "BSL-1", "BSL-2", "BSL-3", "BSL-4"]
      },
      { name: "fireSafety", label: "Fire Safety Provisions", type: "textarea", placeholder: "Sprinkler, suppression, detection type", required: false, colSpan: 4 },
      { name: "emergencySystems", label: "Emergency Systems", type: "textarea", placeholder: "Code blue panel, crash cart location", required: false, colSpan: 4 }
    ]
  },
  {
    id: "user-experience",
    section: "User Experience",
    icon: "✨",
    color: "#0891b2",
    fields: [
      { name: "lightingQuality", label: "Lighting Quality", type: "textarea", placeholder: "Lux levels, CCT, controls", required: false, colSpan: 2 },
      { name: "acousticControl", label: "Acoustic Control", type: "text", placeholder: "dB target, STC rating", required: false, colSpan: 2 },
      { name: "privacy", label: "Privacy", type: "text", placeholder: "Visual & acoustic privacy measures", required: false, colSpan: 2 },
      { name: "patientComfort", label: "Patient Comfort", type: "textarea", placeholder: "Bedhead units, entertainment, wayfinding", required: false, colSpan: 2 },
      { name: "familyInteraction", label: "Family Interaction", type: "text", placeholder: "Visitor seating, consultation space", required: false, colSpan: 2 },
      { name: "visualEnvironment", label: "Visual Environment", type: "text", placeholder: "Views, artwork, wayfinding colours", required: false, colSpan: 2 }
    ]
  },
  {
    id: "fittings-furniture",
    section: "Fittings & Furniture (FF)",
    icon: "🛋️",
    color: "#7c3aed",
    fields: [
      { name: "airFlowmeter", label: "Air Flowmeter", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "oxygenFlowmeter", label: "Oxygen Flowmeter", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "suctionAdapterLowFlow", label: "Suction Adapter: Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "suctionBottle", label: "Suction Bottle", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "oxygenFlowmeterLowFlow", label: "Oxygen Flowmeter: Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "trolleyProcedure", label: "Trolley: Procedure", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "blenderAirOxygen", label: "Blender: Air & Oxygen, Low Flow", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "stoolAdjustableMobile", label: "Stool: Adjustable, Mobile", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "curtainTrackSystem", label: "Curtain Track System", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "ivHook", label: "IV Hook", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "additionalFF", label: "Additional FF Items", type: "textarea", placeholder: "List any additional items", required: false, colSpan: 4 }
    ]
  },
  {
    id: "fixtures-equipment",
    section: "Fixtures, Equipment & Services (FE)",
    icon: "🔬",
    color: "#059669",
    fields: [
      { name: "infusionPumpSyringe", label: "Infusion Pump: Syringe", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "examinationLight", label: "Light: Examination, Single, Ceiling Mounted", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "physiologicMonitor", label: "Monitor: Physiologic, Critical Care / Neonatal", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "infantIncubator", label: "Incubator: Infant", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "phototherapyLamp", label: "Lamp: Phototherapy, Neonatal", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "supplyUnitCeiling", label: "Supply Unit: Ceiling, Double Arm", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "infusionPumpEnteral", label: "Infusion Pump: Enteral Feeding", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "infusionPumpSingleChannel", label: "Infusion Pump: Single Channel", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "ventilatorNeonatal", label: "Ventilator: Neonatal / Paediatric", type: "number", placeholder: "Qty", required: false, colSpan: 1 },
      { name: "additionalFE", label: "Additional FE Items", type: "textarea", placeholder: "List any additional items", required: false, colSpan: 4 }
    ]
  }
];