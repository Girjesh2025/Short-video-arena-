"use client";
import { useState, useEffect } from "react";

const VIDEO_SOURCES = [
  { id: "pexels", icon: "🌐", name: "Pexels", desc: "Free stock videos" },
  { id: "pixabay", icon: "🖼️", name: "Pixabay", desc: "Open source media" },
  { id: "local", icon: "💻", name: "Local Files", desc: "Your own footage" },
  { id: "coverr", icon: "🎥", name: "Coverr", desc: "High-res footage" },
];

const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16", desc: "TikTok / Reels", w: 45, h: 80 },
  { value: "16:9", label: "16:9", desc: "YouTube / Wide", w: 80, h: 45 },
  { value: "1:1", label: "1:1", desc: "Instagram Square", w: 60, h: 60 },
];

const TRANSITIONS = [
  { value: "none", label: "None" },
  { value: "shuffle", label: "Shuffle" },
  { value: "FadeIn", label: "Fade In" },
  { value: "SlideIn", label: "Slide In" },
  { value: "ZoomIn", label: "Zoom In" },
];

const CAPTION_STYLES = [
  { value: "standard", label: "Standard" },
  { value: "highlight", label: "Highlight" },
  { value: "karaoke", label: "Karaoke" },
];

export default function VideoSettings({ params, setParams }) {
  const [localMaterials, setLocalMaterials] = useState([]);

  useEffect(() => {
    if (params.video_source === "local") {
      fetch("/api/v1/video_materials")
        .then(r => r.json())
        .then(d => setLocalMaterials(d.data?.files || []))
        .catch(() => {});
    }
  }, [params.video_source]);

  const update = (key, val) => setParams(p => ({ ...p, [key]: val }));

  return (
    <div>
      {/* Source Selection */}
      <div className="glass-card">
        <div className="section-title">🎥 Video Source</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 0 }}>
          {VIDEO_SOURCES.map(src => (
            <div
              key={src.id}
              className={`voice-source-card ${params.video_source === src.id ? "selected" : ""}`}
              onClick={() => update("video_source", src.id)}
            >
              <div className="vs-icon">{src.icon}</div>
              <div className="vs-name">{src.name}</div>
              <div className="vs-desc">{src.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="glass-card">
        <div className="section-title">📐 Aspect Ratio</div>
        <div className="aspect-ratio-grid">
          {ASPECT_RATIOS.map(ar => (
            <div
              key={ar.value}
              className={`aspect-option ${params.video_aspect === ar.value ? "selected" : ""}`}
              onClick={() => update("video_aspect", ar.value)}
            >
              <div className="aspect-box" style={{ width: ar.w * 0.8, height: ar.h * 0.8 }} />
              <div className="aspect-label">{ar.label}</div>
              <div className="aspect-sublabel">{ar.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Parameters */}
      <div className="glass-card">
        <div className="section-title">⚙️ Video Parameters</div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">🎬 Video Count (Variants)</label>
            <div className="number-input-row">
              <button onClick={() => update("video_count", Math.max(1, params.video_count - 1))}>−</button>
              <input
                type="number"
                value={params.video_count}
                min={1}
                max={5}
                onChange={e => update("video_count", parseInt(e.target.value) || 1)}
              />
              <button onClick={() => update("video_count", Math.min(5, params.video_count + 1))}>+</button>
            </div>
            <div className="help-text">Number of different video variants to generate (1–5)</div>
          </div>

          <div className="form-group">
            <label className="form-label">⏱️ Clip Duration (seconds)</label>
            <div className="number-input-row">
              <button onClick={() => update("video_clip_duration", Math.max(2, params.video_clip_duration - 1))}>−</button>
              <input
                type="number"
                value={params.video_clip_duration}
                min={2}
                max={30}
                onChange={e => update("video_clip_duration", parseInt(e.target.value) || 5)}
              />
              <button onClick={() => update("video_clip_duration", Math.min(30, params.video_clip_duration + 1))}>+</button>
            </div>
            <div className="help-text">Duration of each video segment clip (2–30 sec)</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">🎭 Scene Transition</label>
            <select className="form-select" value={params.video_transition} onChange={e => update("video_transition", e.target.value)}>
              {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">💬 Caption Style</label>
            <select className="form-select" value={params.caption_style} onChange={e => update("caption_style", e.target.value)}>
              {CAPTION_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Local materials list */}
        {params.video_source === "local" && (
          <div>
            <div className="form-label" style={{ marginBottom: 10 }}>📁 Available Local Materials</div>
            {localMaterials.length === 0 ? (
              <div className="alert alert-warning">
                ⚠️ No local video materials found. Upload them in the Assets Manager.
              </div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {localMaterials.map((f, i) => (
                  <div key={i} className="file-item">
                    <span className="file-icon">🎞️</span>
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Border Settings */}
      <div className="glass-card">
        <div className="section-title">🖼️ Video Border (Optional)</div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Border Width: <strong style={{ color: "var(--pink)" }}>{params.border_width}px</strong></label>
            <input
              type="range"
              className="form-range"
              min={0}
              max={40}
              value={params.border_width}
              onChange={e => update("border_width", parseInt(e.target.value))}
            />
            <div className="range-labels"><span>0px</span><span>20px</span><span>40px</span></div>
          </div>
          <div className="form-group">
            <label className="form-label">Border Color</label>
            <div className="color-input-row">
              <input
                type="color"
                className="form-color"
                value={params.border_color}
                onChange={e => update("border_color", e.target.value)}
              />
              <span className="color-value-display">{params.border_color}</span>
            </div>
          </div>
        </div>

        {/* Border Preview */}
        {params.border_width > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <div style={{
              width: 100, height: 178, background: "linear-gradient(135deg,#1a1f35,#0a0f1e)",
              border: `${params.border_width * 0.4}px solid ${params.border_color}`,
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "var(--text-muted)"
            }}>Preview</div>
          </div>
        )}
      </div>
    </div>
  );
}
