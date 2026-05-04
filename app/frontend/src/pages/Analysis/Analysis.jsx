import { useEffect, useRef, useState } from "react";
import "./Analysis.css";
import logo from "../../assets/logo.png";

const CLASS_SEVERITY = {
  "Late Blight":  "critical",
  "Early Blight": "warning",
  "Healthy":      "healthy",
};

const MOCK_RESULT = {
  reportId:       "PG-2024-882",
  date:           "October 24, 2023",
  severity:       "critical",
  disease:        "Late Blight",
  scientificName: "Phytophthora infestans",
  confidence:     92,
  detections: [
    { id: 1, x: 0.12, y: 0.18, w: 0.28, h: 0.32, label: "Late Blight",  confidence: 92 },
    { id: 2, x: 0.55, y: 0.42, w: 0.22, h: 0.26, label: "Early Blight", confidence: 78 },
    { id: 3, x: 0.30, y: 0.60, w: 0.20, h: 0.22, label: "Healthy",      confidence: 95 },
  ],
  treatments: [
    {
      id: 1,
      emoji: "🚫",
      title: "Immediate Isolation",
      desc:  "Remove and destroy infected leaves and nearby plant debris immediately. Do not compost infected material as spores can survive.",
    },
    {
      id: 2,
      emoji: "🧪",
      title: "Chemical Intervention",
      desc:  "Apply a copper-based fungicide or oomycete-targeted treatment. Ensure thorough coverage of both upper and lower leaf surfaces.",
    },
    {
      id: 3,
      emoji: "💧",
      title: "Humidity Management",
      desc:  "Reduce overhead watering. Improve air circulation by spacing plants appropriately and removing lower canopy foliage.",
    },
  ],
  fieldConditions: {
    humidity:    "82% (High Risk)",
    temp:        "18°C",
    sporeTravel: "North-East",
    note:        "Current weather patterns favor rapid pathogen spread. Inspect adjacent rows within 24 hours.",
  },
  expert: {
    name: "Sarah Mitchell",
    role: "Plant Pathologist",
  },
};

const SEVERITY_COLORS = {
  critical: { stroke: "#ef4444", fill: "rgba(239,68,68,0.12)" },
  warning:  { stroke: "#f59e0b", fill: "rgba(245,158,11,0.12)" },
  healthy:  { stroke: "#22c55e", fill: "rgba(34,197,94,0.12)"  },
};

function DetectionCrop({ image, detection, isActive, onClick }) {
  const canvasRef = useRef();
  const severity  = CLASS_SEVERITY[detection.label] ?? "warning";
  const colors    = SEVERITY_COLORS[severity];

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const pad = 0.06;
      const sx = Math.max(0, detection.x - pad) * img.naturalWidth;
      const sy = Math.max(0, detection.y - pad) * img.naturalHeight;
      const sw = Math.min(1 - Math.max(0, detection.x - pad), detection.w + pad * 2) * img.naturalWidth;
      const sh = Math.min(1 - Math.max(0, detection.y - pad), detection.h + pad * 2) * img.naturalHeight;

      canvas.width  = 200;
      canvas.height = 150;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 150);

      const bx = (pad / (detection.w + pad * 2)) * 200;
      const by = (pad / (detection.h + pad * 2)) * 150;
      const bw = (detection.w / (detection.w + pad * 2)) * 200;
      const bh = (detection.h / (detection.h + pad * 2)) * 150;
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = colors.fill;
      ctx.fillRect(bx, by, bw, bh);
    };
    img.src = image;
  }, [image, detection, colors]);

  return (
    <div
      className={`detection-crop${isActive ? " is-active" : ""} detection-crop--${severity}`}
      onClick={onClick}
      title={`${detection.label} — ${detection.confidence}%`}
    >
      <canvas ref={canvasRef} className="detection-crop-canvas" />
      <div className="detection-crop-label">
        <span className={`detection-crop-dot detection-crop-dot--${severity}`} />
        <span className="detection-crop-name">{detection.label}</span>
        <span className="detection-crop-conf">{detection.confidence}%</span>
      </div>
    </div>
  );
}

function AnnotatedImage({ image, fileType, detections, activeId, onBoxClick }) {
  return (
    <div className="annotated-image-wrap">
      {image ? (
        fileType === "video" ? (
          <video src={image} className="leaf-media" controls muted />
        ) : (
          <img src={image} alt="Analyzed leaf" className="leaf-media" />
        )
      ) : (
        <div className="leaf-placeholder">
          <span className="leaf-ph-emoji">🍃</span>
          <span>Leaf image will appear here</span>
        </div>
      )}

      {image && fileType !== "video" && detections.map((det) => {
        const severity = CLASS_SEVERITY[det.label] ?? "warning";
        return (
          <div
            key={det.id}
            className={`overlay-box overlay-box--${severity}${activeId === det.id ? " overlay-box--active" : ""}`}
            style={{
              left:   `${det.x * 100}%`,
              top:    `${det.y * 100}%`,
              width:  `${det.w * 100}%`,
              height: `${det.h * 100}%`,
            }}
            onClick={() => onBoxClick(det.id)}
          >
            <span className="overlay-box-label">{det.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analysis({ image, fileType, onNewAnalysis }) {
  const r = MOCK_RESULT;
  const barRef = useRef();
  const valRef = useRef();
  const [activeDetection, setActiveDetection] = useState(r.detections[0]?.id ?? null);

  useEffect(() => {
    let frame;
    let current = 0;
    const target = r.confidence;
    const step = () => {
      current = Math.min(current + 1.5, target);
      if (barRef.current) barRef.current.style.width = `${current}%`;
      if (valRef.current) valRef.current.textContent = `${Math.round(current)}%`;
      if (current < target) frame = requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(step); }, 350);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [r.confidence]);

  const handleBoxClick = (id) => {
    setActiveDetection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="analysis-page">
      <div className="bg-accent bg-accent--tl" />
      <div className="bg-accent bg-accent--br" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="analysis-header">
        <div className="logo-wrap">
          <img src={logo} alt="SpudDoc AI" className="nav-logo" />
        </div>
        <div className="report-meta">
          <span className="report-id">Report ID: {r.reportId}</span>
          <span className="report-sep">·</span>
          <span className="report-date">📅 {r.date}</span>
        </div>
      </header>

      {/* ── Title ──────────────────────────────────────────────── */}
      <div className="analysis-title-row">
        <h1 className="analysis-title">
          Analysis <em>Overview</em>
        </h1>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <main className="analysis-body">

        {/* Left column */}
        <div className="analysis-left">
          <div className="leaf-image-card">
            <AnnotatedImage
              image={image}
              fileType={fileType}
              detections={r.detections}
              activeId={activeDetection}
              onBoxClick={handleBoxClick}
            />
          </div>

          <div className="treatments-section">
            <h3 className="section-heading">
              <span className="section-icon">🌿</span>
              Treatment &amp; Prevention
            </h3>
            <div className="treatment-list">
              {r.treatments.map((t) => (
                <div key={t.id} className="treatment-card">
                  <div className="treatment-icon">
                    <span className="treatment-emoji">{t.emoji}</span>
                  </div>
                  <div>
                    <strong>{t.title}</strong>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="new-analysis-btn" onClick={onNewAnalysis}>
            New Analysis
          </button>
        </div>

        {/* Middle column - detections */}
        {image && fileType !== "video" && (
          <div className="analysis-detections-col">
            <div className="detections-panel">
              <h4 className="detections-panel-title">
                <span>🔬</span>
                Detected Regions
                <span className="detections-count">{r.detections.length}</span>
              </h4>
              <div className="detections-grid">
                {r.detections.map((det) => (
                  <DetectionCrop
                    key={det.id}
                    image={image}
                    detection={det}
                    isActive={activeDetection === det.id}
                    onClick={() => handleBoxClick(det.id)}
                  />
                ))}
              </div>
              <p className="detections-hint">Click a region to highlight it on the image</p>
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="analysis-right">
          <div className="diagnosis-card">
            <div className={`severity-badge severity-badge--${r.severity}`}>
              <span className="badge-icon-ph">⚠️</span>
              {r.severity === "critical" ? "Critical Finding" : "Warning"}
            </div>
            <h2 className="disease-name">{r.disease}</h2>
            <p className="scientific-name">
              Scientific Name: <em>{r.scientificName}</em>
            </p>
            <div className="confidence-wrap">
              <div className="confidence-row">
                <span className="confidence-value" ref={valRef}>0%</span>
                <span className="confidence-label">Confidence Score</span>
              </div>
              <div className="confidence-bar-bg">
                <div className="confidence-bar-fill" ref={barRef} style={{ width: "0%" }} />
              </div>
            </div>
          </div>

          <button className="pdf-btn">
            <span className="pdf-icon-ph">📄</span>
            <div>
              <span className="pdf-title">Download PDF Report</span>
              <span className="pdf-size">4.2 MB</span>
            </div>
          </button>

          <div className="field-card">
            <h4 className="field-title">
              <span className="field-title-icon">🌡️</span>
              Field Conditions
            </h4>
            <div className="field-rows">
              <div className="field-row">
                <span>Local Humidity</span>
                <span className="field-val field-val--danger">{r.fieldConditions.humidity}</span>
              </div>
              <div className="field-row">
                <span>Avg Temperature</span>
                <span className="field-val">{r.fieldConditions.temp}</span>
              </div>
              <div className="field-row">
                <span>Spore Travel</span>
                <span className="field-val">{r.fieldConditions.sporeTravel}</span>
              </div>
            </div>
            <p className="field-note">{r.fieldConditions.note}</p>
          </div>

          <div className="expert-card">
            <span className="expert-label">Assigned Expert</span>
            <div className="expert-info">
              <div className="expert-avatar">
                <span className="expert-avatar-emoji">👩‍🔬</span>
              </div>
              <div>
                <strong>{r.expert.name}</strong>
                <p>{r.expert.role}</p>
              </div>
            </div>
            <button className="consult-btn">Request Consult</button>
          </div>
        </div>

      </main>
    </div>
  );
}