"use client";
import { useState } from "react";

const LANGUAGES = [
  { value: "", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
  { value: "vi", label: "Vietnamese" },
];

export default function ScriptTopic({ params, setParams, onGenerate }) {
  const [generating, setGenerating] = useState(false);
  const [scriptMode, setScriptMode] = useState("ai"); // "ai" | "manual"
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const update = (key, val) => setParams(p => ({ ...p, [key]: val }));

  const handleGenerateScript = async () => {
    if (!params.video_subject.trim()) {
      showToast("Please enter a video subject first", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_subject: params.video_subject,
          video_language: params.video_language,
          paragraph_number: params.paragraph_number,
          video_script_prompt: params.video_script_prompt,
        }),
      });
      const data = await res.json();
      if (data.status === 200 && data.data?.video_script) {
        update("video_script", data.data.video_script);
        showToast("✨ Script generated successfully!", "success");
      } else {
        showToast("Failed to generate script. Check your LLM settings.", "error");
      }
    } catch {
      showToast("Network error: Could not reach API", "error");
    }
    setGenerating(false);
  };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderTop: "2px solid var(--pink)" }}>
          <span className="metric-icon">🎯</span>
          <div>
            <div className="metric-label">Topic Mode</div>
            <div className="metric-value">{scriptMode === "ai" ? "AI Write" : "Manual"}</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--indigo)" }}>
          <span className="metric-icon">📝</span>
          <div>
            <div className="metric-label">Paragraphs</div>
            <div className="metric-value">{params.paragraph_number}</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--cyan)" }}>
          <span className="metric-icon">🌐</span>
          <div>
            <div className="metric-label">Language</div>
            <div className="metric-value">{params.video_language || "Auto"}</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--green)" }}>
          <span className="metric-icon">⚡</span>
          <div>
            <div className="metric-label">Script Status</div>
            <div className="metric-value">{params.video_script ? "Ready" : "Pending"}</div>
          </div>
        </div>
      </div>

      {/* Script Mode Toggle */}
      <div className="glass-card">
        <div className="section-title">📋 Script Mode</div>
        <div className="segment-selector" style={{ marginBottom: "20px" }}>
          <button className={`segment-option ${scriptMode === "ai" ? "active" : ""}`} onClick={() => setScriptMode("ai")}>
            🤖 AI Generate
          </button>
          <button className={`segment-option ${scriptMode === "manual" ? "active" : ""}`} onClick={() => setScriptMode("manual")}>
            ✍️ Write Manually
          </button>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label className="form-label">🎯 Video Subject *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. The Amazing Benefits of Morning Exercise"
            value={params.video_subject}
            onChange={e => update("video_subject", e.target.value)}
          />
          <div className="help-text">Describe the topic of your short video in a clear, concise sentence.</div>
        </div>

        {/* Language */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">🌐 Video Language</label>
            <select className="form-select" value={params.video_language} onChange={e => update("video_language", e.target.value)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">📑 Paragraphs</label>
            <div className="number-input-row">
              <button onClick={() => update("paragraph_number", Math.max(1, params.paragraph_number - 1))}>−</button>
              <input type="number" value={params.paragraph_number} min={1} max={10}
                onChange={e => update("paragraph_number", parseInt(e.target.value) || 1)} />
              <button onClick={() => update("paragraph_number", Math.min(10, params.paragraph_number + 1))}>+</button>
            </div>
          </div>
        </div>

        {/* AI Prompt (only in AI mode) */}
        {scriptMode === "ai" && (
          <div className="form-group">
            <label className="form-label">💡 Script Prompt (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Additional instructions for the AI script writer..."
              value={params.video_script_prompt}
              onChange={e => update("video_script_prompt", e.target.value)}
              rows={3}
            />
            <div className="help-text">Leave blank to use the default AI prompt. Max 2000 characters.</div>
          </div>
        )}
      </div>

      {/* Script Content */}
      <div className="glass-card">
        <div className="section-title">📄 Video Script</div>

        {scriptMode === "ai" && (
          <button
            className="btn btn-indigo btn-full"
            style={{ marginBottom: "16px" }}
            onClick={handleGenerateScript}
            disabled={generating || !params.video_subject.trim()}
          >
            {generating ? (
              <><span className="spinner" style={{ width: 15, height: 15 }} /> Generating Script...</>
            ) : (
              <>🤖 Generate Script with AI</>
            )}
          </button>
        )}

        <div className="form-group">
          <label className="form-label">
            {scriptMode === "ai" ? "Generated Script (editable)" : "Your Script"}
          </label>
          <textarea
            className="form-textarea"
            placeholder={scriptMode === "ai"
              ? "Click 'Generate Script with AI' above, or paste your own script here..."
              : "Write your video script here. Each paragraph will be one video segment."}
            value={params.video_script}
            onChange={e => update("video_script", e.target.value)}
            rows={10}
          />
          <div className="help-text">
            {params.video_script
              ? `${params.video_script.length} characters | ~${Math.ceil(params.video_script.split(" ").length / 150)} min read`
              : "Your script will appear here."}
          </div>
        </div>

        {params.video_script && (
          <div className="alert alert-success" style={{ marginTop: 0 }}>
            ✅ Script is ready! Head to <strong>Video Compiler</strong> to generate your video.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <div className="section-title">🚀 Quick Actions</div>
        <div className="grid-2">
          <button className="btn btn-secondary btn-full" onClick={() => {
            update("video_script", "");
            update("video_subject", "");
          }}>
            🗑️ Clear All
          </button>
          <button
            className="generate-btn"
            onClick={onGenerate}
            disabled={!params.video_subject && !params.video_script}
          >
            🎬 Go to Compiler →
          </button>
        </div>
      </div>
    </div>
  );
}
