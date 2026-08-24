"use client";
import { useState } from "react";

const VOICES_TTA = [
  "en-US-JennyNeural-Female", "en-US-GuyNeural-Male",
  "hi-IN-SwaraNeural-Female", "hi-IN-MadhurNeural-Male",
  "zh-CN-XiaoxiaoNeural-Female", "zh-CN-YunxiNeural-Male",
  "es-ES-ElviraNeural-Female", "ja-JP-NanamiNeural-Female",
  "ko-KR-SunHiNeural-Female", "fr-FR-DeniseNeural-Female",
];

export default function TextToAudio() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("en-US-JennyNeural-Female");
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [bgmType, setBgmType] = useState("none");
  const [bgmVolume, setBgmVolume] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
      showToast("Please enter some text to convert to audio", "error");
      return;
    }
    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/v1/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_script: script,
          voice_name: voice,
          voice_rate: rate,
          voice_volume: volume,
          bgm_type: bgmType,
          bgm_volume: bgmVolume,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        showToast("✅ Audio generated successfully!", "success");
      } else {
        const d = await res.json();
        showToast(`Error: ${d.message || "Failed to generate audio"}`, "error");
      }
    } catch {
      showToast("Network error: Could not reach API", "error");
    }
    setLoading(false);
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estMin = wordCount > 0 ? Math.ceil(wordCount / 150) : 0;

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"} {toast.msg}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderTop: "2px solid var(--cyan)" }}>
          <span className="metric-icon">📝</span>
          <div><div className="metric-label">Word Count</div><div className="metric-value">{wordCount}</div></div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--green)" }}>
          <span className="metric-icon">⏱️</span>
          <div><div className="metric-label">Est. Duration</div><div className="metric-value">~{estMin} min</div></div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--pink)" }}>
          <span className="metric-icon">⚡</span>
          <div><div className="metric-label">Voice Rate</div><div className="metric-value">{rate}x</div></div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--yellow)" }}>
          <span className="metric-icon">🔉</span>
          <div><div className="metric-label">Volume</div><div className="metric-value">{Math.round(volume * 100)}%</div></div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          {/* Script Input */}
          <div className="glass-card">
            <div className="section-title">📝 Script Text</div>
            <div className="form-group">
              <label className="form-label">Enter your text / script</label>
              <textarea
                className="form-textarea"
                placeholder="Enter the text you want to convert to audio. Supports long-form content for up to several hours of audio..."
                value={script}
                onChange={e => setScript(e.target.value)}
                rows={12}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span className="help-text">{wordCount} words</span>
                <span className="help-text">~{estMin} min audio @ {rate}x speed</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Voice Settings */}
          <div className="glass-card">
            <div className="section-title">🎤 Voice & Audio Settings</div>

            <div className="form-group">
              <label className="form-label">🎤 Voice</label>
              <select className="form-select" value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES_TTA.map(v => <option key={v} value={v}>{v.replace("-Neural","").replace("Neural","")}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">⚡ Speed: <strong style={{ color: "var(--cyan)" }}>{rate}x</strong></label>
              <input type="range" className="form-range" min={0.5} max={2.0} step={0.1}
                value={rate} onChange={e => setRate(parseFloat(e.target.value))} />
              <div className="range-labels"><span>0.5x Slow</span><span>1.0x Normal</span><span>2.0x Fast</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">🔉 Volume: <strong style={{ color: "var(--green)" }}>{Math.round(volume * 100)}%</strong></label>
              <input type="range" className="form-range" min={0.1} max={2.0} step={0.1}
                value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
              <div className="range-labels"><span>0%</span><span>100%</span><span>200%</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">🎵 Background Music</label>
              <div className="segment-selector">
                {[{ v: "none", l: "🔇 None" }, { v: "random", l: "🎲 Random" }].map(t => (
                  <button key={t.v} className={`segment-option ${bgmType === t.v ? "active" : ""}`}
                    onClick={() => setBgmType(t.v)}>{t.l}</button>
                ))}
              </div>
            </div>

            {bgmType !== "none" && (
              <div className="form-group">
                <label className="form-label">BGM Volume: <strong style={{ color: "var(--yellow)" }}>{Math.round(bgmVolume * 100)}%</strong></label>
                <input type="range" className="form-range" min={0} max={1.0} step={0.05}
                  value={bgmVolume} onChange={e => setBgmVolume(parseFloat(e.target.value))} />
              </div>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || !script.trim()}
              style={{ marginTop: 8 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating Audio...</>
                : "🎙️ Generate Audio"}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="glass-card">
          <div className="section-title">🎧 Generated Audio</div>
          <div className="audio-player-card">
            <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <a href={audioUrl} download="generated-audio.mp3" className="btn btn-success">
                📥 Download MP3
              </a>
              <button className="btn btn-secondary" onClick={() => setAudioUrl(null)}>
                🗑️ Clear
              </button>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginTop: 14 }}>
            ℹ️ For very long scripts (1+ hours), the API generates audio in chunks. 
            The final download will contain the complete merged audio.
          </div>
        </div>
      )}
    </div>
  );
}
