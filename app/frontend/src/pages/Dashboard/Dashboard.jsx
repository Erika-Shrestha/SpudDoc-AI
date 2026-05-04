import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./Dashboard.css";
import logo from "../../assets/logo.png";
import iconUpload from "../../assets/folder.png";
import iconHistory from "../../assets/history.png";
// ─── Replace these with your actual asset imports ────────────────────────────
// import iconAnalyze    from "../../assets/icon-analyze.png";

const recentScans = [
  { id: 1, label: "Late Blight",  status: "critical", thumb: null },
  { id: 2, label: "Early Blight", status: "warning",  thumb: null },
];

export default function Dashboard({ onAnalyze }) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [fileType, setFileType]     = useState(null);
  const fileInputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const isVideo = f.type.startsWith("video/");
    setFileType(isVideo ? "video" : "image");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setFileType(null);
  };

  const handleAnalyze = () => {
    if (file) onAnalyze(preview, fileType);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-glow-top-right" />
      <div className="dashboard-glow-bottom-left" />
      <header className="dashboard-top-bar">
        <div className="dashboard-brand">
          <img src={logo} alt="SpudDoc AI" className="dashboard-brand-logo" />
        </div>

        <nav className="dashboard-nav">
          <a href="#" className="dashboard-nav-link is-active">Scan</a>
          <a href="#" className="dashboard-nav-link" onClick={() => navigate("/history")}>History</a>
          <a href="#" className="dashboard-nav-link">About</a>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="dashboard-hero">
        <h1 className="dashboard-hero-heading">
          Protect Your<br />
          <em>Harvest</em>
        </h1>
        <p className="dashboard-hero-tagline">
          Upload a clear photo or video of your potato plant leaves.
          Our model detects blights and guides your recovery.
        </p>
      </section>

      {/* ── Main grid ──────────────────────────────────────────── */}
      <main className="dashboard-content-grid">

        {/* Tips sidebar */}
        <aside className="dashboard-tips-card">
          <h3 className="dashboard-tips-label">Instructions for Capture</h3>
          <ul className="dashboard-tips-list">
            <li>
              <div className="dashboard-tip-icon dashboard-tip-icon--sun">
                <DotLottieReact
                  src="/sunsun.json"
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div>
                <strong>Optimal Lighting</strong>
                <p>Capture in natural daylight. Avoid harsh shadows or direct blinding sunlight.</p>
              </div>
            </li>
            <li>
              <div className="dashboard-tip-icon dashboard-tip-icon--search">
                <DotLottieReact
                  src="/scanning.json"
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div>
                <strong>Clear Focus</strong>
                <p>Ensure the leaf is the primary subject. Hold steady to prevent motion blur.</p>
              </div>
            </li>
            <li>
              <div className="dashboard-tip-icon dashboard-tip-icon--leaf">
                <DotLottieReact
                  src="/graph.json"
                  loop={true}
                  autoplay={true}
                  style={{ width: "90%", height: "100%" }}
                />
              </div>
              <div>
                <strong>Single Specimen</strong>
                <p>Focus on one leaf cluster at a time for maximum diagnostic precision.</p>
              </div>
            </li>
          </ul>
        </aside>

        {/* Upload zone */}
        <div className="dashboard-upload-area">
          <div
            className={`dashboard-drop-zone${isDragging ? " is-dragging" : ""}${preview ? " has-file" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !preview && fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.raw"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview ? (
              <div className="dashboard-file-preview-wrap">
                {fileType === "video" ? (
                  <video src={preview} className="dashboard-file-preview-media" controls muted />
                ) : (
                  <img src={preview} alt="Leaf preview" className="dashboard-file-preview-media" />
                )}
                <button className="dashboard-clear-file-btn" onClick={handleRemove}>✕</button>
                <div className="dashboard-file-name-tag">
                  <span>{fileType === "video" ? "🎥" : "🌿"}</span>
                  {file?.name || "File ready"}
                </div>
              </div>
            ) : (
              <div className="dashboard-drop-empty-state">
                <img src={iconUpload} alt="upload" className="dashboard-upload-icon-circle" />
                <p className="dashboard-drop-heading">Drop your leaf image or video here</p>
                <p className="dashboard-drop-hint">
                  Drag & drop a JPG, PNG, MP4 or MOV, or click to browse.
                </p>
              </div>
            )}
          </div>

          <button
            className="dashboard-scan-btn"
            onClick={handleAnalyze}
            disabled={!file}
          >
            {/* Replace with: <img src={iconAnalyze} alt="" className="dashboard-scan-btn-icon-img" /> */}
            Analyze Leaf
          </button>

          <p className="dashboard-accepted-formats">Supports: RAW · JPG · PNG · MP4 · MOV &nbsp;(Max 25 MB)</p>
        </div>
      </main>

      {/* ── Recent Scans ───────────────────────────────────────── */}
      <section className="dashboard-history-section">
        <h3 className="dashboard-history-label">Recent Scans</h3>
        <div className="dashboard-history-row">
          {recentScans.map((scan) => (
            <div key={scan.id} className="dashboard-scan-card">
              <div className="dashboard-scan-image-box">
                {/* Replace with: <img src={scan.thumb} alt={scan.label} /> */}
                <span className="dashboard-scan-image-placeholder">🍃</span>
              </div>
              <div className="dashboard-scan-card-footer">
                <span className={`dashboard-scan-status-badge dashboard-scan-status-badge--${scan.status}`}>
                  {scan.label}
                </span>
              </div>
            </div>
          ))}

          <div className="dashboard-view-all-card" onClick={() => navigate("/history")}>
            <img src={iconHistory} alt="history" className="dashboard-view-all-icon" />
            <span>View History</span>
          </div>
        </div>
      </section>
    </div>
  );
}