"use client";
import { useState, useEffect, useRef } from "react";

export default function SavedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/tasks");
      const data = await res.json();
      if (data.status === 200 && data.data) {
        setVideos(data.data.tasks || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, []);

  const handleDelete = async (taskId) => {
    setDeleting(taskId);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
      const d = await res.json();
      if (d.status === 200) {
        setVideos(v => v.filter(x => x.task_id !== taskId));
        showToast("Video deleted successfully", "success");
      } else {
        showToast("Failed to delete video", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setDeleting(null);
  };

  const filtered = search.trim()
    ? videos.filter(v =>
        (v.subject || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.script || "").toLowerCase().includes(search.toLowerCase())
      )
    : videos;

  const sorted = [...filtered].sort((a, b) => (b.time || 0) - (a.time || 0));

  const fmtDate = (ts) => {
    if (!ts) return "Unknown";
    return new Date(ts * 1000).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: 1, maxWidth: 400 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by subject or script..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginLeft: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>
            {sorted.length} video{sorted.length !== 1 ? "s" : ""}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={loadVideos}>🔄 Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 16px", borderWidth: 3 }} />
          <p style={{ color: "var(--text-muted)" }}>Loading saved videos...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>{search ? "No videos match your search" : "No saved videos yet"}</h3>
          <p>{search
            ? "Try a different search term"
            : "Go to the Video Compiler tab to generate your first video!"}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {sorted.map((item) => (
            <VideoCard
              key={item.task_id}
              item={item}
              fmtDate={fmtDate}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({ item, fmtDate, onDelete, deleting }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = item.video_url || (item.videos && item.videos[0]);
  const dlUrl = item.download_url || videoUrl;

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
            controls
            preload="metadata"
          />
        ) : (
          <div style={{
            height: 180, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.03)", fontSize: 36
          }}>🎬</div>
        )}
      </div>

      <div className="video-card-body">
        <div className="video-card-title">🎬 {(item.subject || "Untitled Video").toUpperCase()}</div>
        <div className="video-card-meta">
          {item.task_id?.slice(0, 8)} · {fmtDate(item.time)}
        </div>

        {item.script && (
          <div className="video-card-script">
            {item.script.slice(0, 300)}{item.script.length > 300 ? "..." : ""}
          </div>
        )}

        <div className="video-card-actions">
          {dlUrl && (
            <a href={dlUrl} download className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: "center", display: "flex" }}>
              📥 Download
            </a>
          )}
          <button
            className="btn btn-danger btn-sm"
            style={{ flex: 1 }}
            onClick={() => onDelete(item.task_id)}
            disabled={deleting === item.task_id}
          >
            {deleting === item.task_id
              ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Deleting...</>
              : "🗑️ Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
