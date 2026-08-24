"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const STEPS = [
  "Script generation",
  "Search video terms",
  "Fetch video materials",
  "Generate speech audio",
  "Merge audio tracks",
  "Add subtitles",
  "Combine final video",
];

function getStepIndex(progress) {
  if (progress < 10) return 0;
  if (progress < 25) return 1;
  if (progress < 40) return 2;
  if (progress < 55) return 3;
  if (progress < 70) return 4;
  if (progress < 85) return 5;
  return 6;
}

export default function VideoCompiler({ params }) {
  const [taskId, setTaskId] = useState(null);
  const [task, setTask] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const pollRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const startPolling = useCallback((id) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/tasks/${id}`);
        const data = await res.json();
        if (data.status === 200 && data.data) {
          setTask(data.data);
          if (data.data.state === 2 || data.data.progress >= 100) {
            stopPolling();
            setGenerating(false);
            showToast("🎉 Video generated successfully!", "success");
          } else if (data.data.state === 3) {
            stopPolling();
            setGenerating(false);
            setError("Video generation failed. Check your API keys and settings.");
          }
        }
      } catch {}
    }, 1500);
  }, []);

  useEffect(() => () => stopPolling(), []);

  const handleGenerate = async () => {
    if (!params.video_subject && !params.video_script) {
      setError("Please set a Video Subject or Script in the Script & Topic page first.");
      return;
    }
    setError(null);
    setGenerating(true);
    setTask(null);
    setStartTime(Date.now());

    const payload = {
      video_subject: params.video_subject,
      video_script: params.video_script || "",
      video_language: params.video_language || "",
      paragraph_number: params.paragraph_number || 1,
      video_source: params.video_source || "pexels",
      video_aspect: params.video_aspect || "9:16",
      video_count: params.video_count || 1,
      video_clip_duration: params.video_clip_duration || 5,
      video_transition: params.video_transition || "none",
      caption_style: params.caption_style || "standard",
      border_width: params.border_width || 0,
      border_color: params.border_color || "#FFFFFF",
      voice_name: params.voice_name || "en-US-JennyNeural-Female",
      voice_rate: params.voice_rate || 1.0,
      voice_volume: params.voice_volume || 1.0,
      bgm_type: params.bgm_type || "random",
      bgm_file: params.bgm_file || "",
      bgm_volume: params.bgm_volume || 0.2,
      subtitle_enabled: params.subtitle_enabled ? "true" : "false",
      font_name: params.font_name || "STHeitiMedium.ttc",
      text_fore_color: params.text_fore_color || "#FFFFFF",
      font_size: params.font_size || 60,
      stroke_color: params.stroke_color || "#000000",
      stroke_width: params.stroke_width || 1.5,
      subtitle_position: params.subtitle_position || "bottom",
      text_background_color: params.subtitle_background_enabled ? (params.text_background_color || "#000000") : false,
      rounded_subtitle_background: params.rounded_subtitle_background || false,
    };

    try {
      const res = await fetch("/api/v1/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 200 && data.data?.task_id) {
        setTaskId(data.data.task_id);
        startPolling(data.data.task_id);
      } else {
        setError(`API Error: ${data.message || "Unknown error"}`);
        setGenerating(false);
      }
    } catch (e) {
      setError("Network error: Could not reach API server.");
      setGenerating(false);
    }
  };

  const handleReset = () => {
    stopPolling();
    setTaskId(null);
    setTask(null);
    setGenerating(false);
    setError(null);
    setStartTime(null);
  };

  const progress = task?.progress || 0;
  const stepIndex = getStepIndex(progress);
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const eta = progress > 5 && progress < 100
    ? Math.floor(elapsed * (100 - progress) / progress)
    : null;

  const fmtTime = (s) => s > 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        </div>
      )}

      {/* Settings Summary */}
      {!generating && !task && (
        <div className="glass-card">
          <div className="section-title">📋 Current Settings Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Subject", value: params.video_subject || "—", icon: "🎯" },
              { label: "Language", value: params.video_language || "Auto", icon: "🌐" },
              { label: "Source", value: params.video_source || "pexels", icon: "🎥" },
              { label: "Aspect", value: params.video_aspect || "9:16", icon: "📐" },
              { label: "Variants", value: params.video_count || 1, icon: "🎬" },
              { label: "Voice", value: params.voice_name?.split("-")[2]?.replace("Neural","") || "Jenny", icon: "🎤" },
              { label: "Subtitles", value: params.subtitle_enabled ? "Enabled" : "Disabled", icon: "💬" },
              { label: "BGM", value: params.bgm_type || "random", icon: "🎵" },
              { label: "Border", value: params.border_width > 0 ? `${params.border_width}px` : "None", icon: "🖼️" },
            ].map(item => (
              <div key={item.label} style={{
                background: "rgba(9,14,28,0.5)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center"
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>⚠️ {error}</div>
          )}

          <div style={{ marginTop: 20 }}>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={(!params.video_subject && !params.video_script) || generating}
            >
              🚀 Generate Video Now
            </button>
          </div>
        </div>
      )}

      {/* Progress View */}
      {(generating || (task && task.progress < 100)) && (
        <div className="glass-card">
          <div className="section-title">⚡ Generating Your Video</div>

          <div className="progress-container">
            <div className="progress-header">
              <div>
                <span className="progress-pct">{progress}%</span>
                <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  {STEPS[Math.min(stepIndex, STEPS.length - 1)]}
                </span>
              </div>
              <div className="progress-eta">
                {eta ? `⏳ ~${fmtTime(eta)} remaining` : "⏳ Calculating..."}
              </div>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <ul className="checklist">
            {STEPS.map((step, i) => {
              const isDone = i < stepIndex;
              const isActive = i === stepIndex;
              return (
                <li key={step} className={`checklist-item ${isDone ? "done" : isActive ? "active" : "pending"}`}>
                  <span className="checklist-icon">
                    {isDone ? "✅" : isActive ? "⟳" : "○"}
                  </span>
                  <span>{step}</span>
                  {isActive && <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>}
                </li>
              );
            })}
          </ul>

          {taskId && (
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
              Task ID: <code style={{ color: "var(--indigo)" }}>{taskId}</code>
            </div>
          )}
        </div>
      )}

      {/* Completion View */}
      {task && (task.state === 2 || task.progress >= 100) && (
        <div>
          <div className="success-banner">
            <span className="success-icon">🎉</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--green)", marginBottom: 6 }}>
              Video Generated Successfully!
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Your video is ready. Preview and download below.
            </p>
          </div>

          {/* Video Player Grid */}
          {task.videos && task.videos.length > 0 && (
            <div className="glass-card" style={{ marginTop: 16 }}>
              <div className="section-title">🎬 Generated Videos</div>
              <div style={{ display: "grid", gridTemplateColumns: task.videos.length > 1 ? "repeat(2,1fr)" : "1fr", gap: 16 }}>
                {task.videos.map((url, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, overflow: "hidden" }}>
                    <video controls src={url} style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
                      <a href={url} download className="btn btn-success btn-sm btn-full">📥 Download</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.combined_videos && task.combined_videos.length > 0 && (
            <div className="glass-card">
              <div className="section-title">🎥 Combined Video</div>
              {task.combined_videos.map((url, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, overflow: "hidden" }}>
                  <video controls src={url} style={{ width: "100%", display: "block" }} />
                  <div style={{ padding: "10px 12px" }}>
                    <a href={url} download className="btn btn-success btn-sm btn-full">📥 Download Combined</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-secondary btn-full" onClick={handleReset} style={{ marginTop: 8 }}>
            ↩️ Generate Another Video
          </button>
        </div>
      )}

      {/* Error Completion */}
      {task && task.state === 3 && (
        <div>
          <div className="alert alert-error">
            ❌ Video generation failed. Please check your API keys and try again.
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleReset} style={{ marginTop: 12 }}>
            ↩️ Try Again
          </button>
        </div>
      )}
    </div>
  );
}
