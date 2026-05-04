import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";
import logo from "../../assets/logo.png";

const MOCK_HISTORY = [
  { id: 1,  disease: "Late Blight",  scientific: "Phytophthora infestans",  severity: "critical", confidence: 92, date: "Oct 24, 2023", thumb: null },
  { id: 2,  disease: "Early Blight", scientific: "Alternaria solani",        severity: "warning",  confidence: 78, date: "Oct 22, 2023", thumb: null },
  { id: 3,  disease: "Healthy",      scientific: "No pathogen detected",     severity: "healthy",  confidence: 97, date: "Oct 20, 2023", thumb: null },
  { id: 4,  disease: "Late Blight",  scientific: "Phytophthora infestans",   severity: "critical", confidence: 88, date: "Oct 18, 2023", thumb: null },
  { id: 5,  disease: "Healthy",      scientific: "No pathogen detected",     severity: "healthy",  confidence: 99, date: "Oct 15, 2023", thumb: null },
  { id: 6,  disease: "Early Blight", scientific: "Alternaria solani",        severity: "warning",  confidence: 74, date: "Oct 12, 2023", thumb: null },
  { id: 7,  disease: "Late Blight",  scientific: "Phytophthora infestans",   severity: "critical", confidence: 95, date: "Oct 10, 2023", thumb: null },
  { id: 8,  disease: "Healthy",      scientific: "No pathogen detected",     severity: "healthy",  confidence: 96, date: "Oct 08, 2023", thumb: null },
];

const FILTERS = ["All", "Critical", "Warning", "Healthy"];

const SEVERITY_LABELS = {
  critical: "Critical",
  warning:  "Warning",
  healthy:  "Healthy",
};

export default function History() {
  const navigate = useNavigate();
  const [search,      setSearch]      = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [visible,     setVisible]     = useState(6);

  const filtered = MOCK_HISTORY.filter((s) => {
    const matchSearch = s.disease.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      s.severity === activeFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="history-page">
      <div className="history-glow history-glow--tl" />
      <div className="history-glow history-glow--br" />

      {/* ── Header ─────────────────────────────────── */}
      <header className="history-header">
        <div className="history-brand">
          <img src={logo} alt="SpudDoc AI" className="history-logo" />
        </div>
        <nav className="history-nav">
          <a href="#" className="history-nav-link" onClick={() => navigate("/")}>Scan</a>
          <a href="#" className="history-nav-link is-active">History</a>
          <a href="#" className="history-nav-link">About</a>
        </nav>
      </header>

      {/* ── Title ──────────────────────────────────── */}
      <div className="history-title-row">
        <div>
          <h1 className="history-title">Scan <em>History</em></h1>
          <p className="history-subtitle">{MOCK_HISTORY.length} scans recorded</p>
        </div>
        <button className="history-new-btn" onClick={() => navigate("/")}>
          + New Scan
        </button>
      </div>

      {/* ── Filters ────────────────────────────────── */}
      <div className="history-controls">
        <input
          className="history-search"
          type="text"
          placeholder="Search by disease..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisible(6); }}
        />
        <div className="history-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`history-filter-btn${activeFilter === f ? " is-active" : ""} history-filter-btn--${f.toLowerCase()}`}
              onClick={() => { setActiveFilter(f); setVisible(6); }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────── */}
      {shown.length > 0 ? (
        <>
          <div className="history-grid">
            {shown.map((scan) => (
              <div
                key={scan.id}
                className={`history-card history-card--${scan.severity}`}
                onClick={() => navigate("/analysis")}
              >
                <div className="history-card-thumb">
                  {scan.thumb ? (
                    <img src={scan.thumb} alt={scan.disease} className="history-card-img" />
                  ) : (
                    <span className="history-card-placeholder">🍃</span>
                  )}
                  <span className={`history-card-badge history-card-badge--${scan.severity}`}>
                    {SEVERITY_LABELS[scan.severity]}
                  </span>
                </div>

                <div className="history-card-body">
                  <h3 className="history-card-disease">{scan.disease}</h3>
                  <p className="history-card-scientific">{scan.scientific}</p>

                  <div className="history-card-footer">
                    <div className="history-card-confidence">
                      <div
                        className="history-card-conf-bar"
                        style={{ width: `${scan.confidence}%` }}
                      />
                      <span className="history-card-conf-val">{scan.confidence}%</span>
                    </div>
                    <span className="history-card-date">📅 {scan.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="history-load-more-wrap">
              <button
                className="history-load-more-btn"
                onClick={() => setVisible((v) => v + 3)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="history-empty">
          <span className="history-empty-emoji">🍃</span>
          <h3>No scans found</h3>
          <p>Try adjusting your search or filter.</p>
          <button className="history-new-btn" onClick={() => navigate("/")}>
            Upload your first leaf
          </button>
        </div>
      )}
    </div>
  );
}