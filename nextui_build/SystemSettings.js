"use client";
import { useState, useEffect, useRef } from "react";

const LLM_PROVIDERS = [
  { id: "openai", name: "OpenAI", icon: "🟢" },
  { id: "moonshot", name: "Moonshot", icon: "🌙" },
  { id: "azure", name: "Azure OpenAI", icon: "🔵" },
  { id: "gemini", name: "Google Gemini", icon: "✨" },
  { id: "ollama", name: "Ollama (Local)", icon: "🦙" },
  { id: "groq", name: "Groq", icon: "⚡" },
  { id: "qianwen", name: "Qianwen", icon: "🇨🇳" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍" },
  { id: "ernie", name: "Ernie (Baidu)", icon: "🐉" },
  { id: "g4f", name: "g4f (Free)", icon: "🆓" },
  { id: "oneapi", name: "OneAPI", icon: "1️⃣" },
  { id: "cloudflare", name: "Cloudflare AI", icon: "☁️" },
  { id: "litellm", name: "LiteLLM", icon: "🔀" },
];

export default function SystemSettings() {
  const [llmProvider, setLlmProvider] = useState("openai");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState("");
  const [llmModelName, setLlmModelName] = useState("");
  const [pexelsKey, setPexelsKey] = useState("");
  const [pixabayKey, setPixabayKey] = useState("");
  const [coverrKey, setCoverrKey] = useState("");
  const [showKeys, setShowKeys] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState("llm");

  // BGM upload
  const bgmRef = useRef(null);
  const [bgmList, setBgmList] = useState([]);
  const [bgmUploading, setBgmUploading] = useState(false);

  // Video materials upload
  const matRef = useRef(null);
  const [matList, setMatList] = useState([]);
  const [matUploading, setMatUploading] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/v1/musics").then(r => r.json())
      .then(d => setBgmList(d.data?.files || [])).catch(() => {});
    fetch("/api/v1/video_materials").then(r => r.json())
      .then(d => setMatList(d.data?.files || [])).catch(() => {});
  }, []);

  const toggleKey = (key) => setShowKeys(s => ({ ...s, [key]: !s[key] }));

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llm_provider: llmProvider,
          llm_api_key: llmApiKey,
          llm_base_url: llmBaseUrl,
          llm_model_name: llmModelName,
          pexels_api_keys: pexelsKey ? pexelsKey.split(",").map(s => s.trim()) : [],
          pixabay_api_keys: pixabayKey ? pixabayKey.split(",").map(s => s.trim()) : [],
          coverr_api_keys: coverrKey ? coverrKey.split(",").map(s => s.trim()) : [],
        }),
      });
      showToast("✅ Settings saved successfully!", "success");
    } catch {
      showToast("Error saving settings", "error");
    }
    setSaving(false);
  };

  const uploadBGM = async (file) => {
    setBgmUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/v1/musics", { method: "POST", body: form });
      const d = await res.json();
      if (d.status === 200) {
        setBgmList(list => [...list, { name: file.name, size: file.size, file: file.name }]);
        showToast(`✅ ${file.name} uploaded!`, "success");
      } else {
        showToast(`Error: ${d.message}`, "error");
      }
    } catch {
      showToast("Upload failed", "error");
    }
    setBgmUploading(false);
  };

  const uploadMaterial = async (file) => {
    setMatUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/v1/video_materials", { method: "POST", body: form });
      const d = await res.json();
      if (d.status === 200) {
        setMatList(list => [...list, { name: file.name, size: file.size, file: file.name }]);
        showToast(`✅ ${file.name} uploaded!`, "success");
      } else {
        showToast(`Error: ${d.message}`, "error");
      }
    } catch {
      showToast("Upload failed", "error");
    }
    setMatUploading(false);
  };

  const fmt = (bytes) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const SECTIONS = ["llm", "api_keys", "assets"];
  const SECTION_LABELS = { llm: "🤖 LLM Provider", api_keys: "🔑 API Keys", assets: "📁 Assets & BGM" };

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="tab-bar">
        {SECTIONS.map(s => (
          <button key={s} className={`tab-btn ${activeSection === s ? "active" : ""}`} onClick={() => setActiveSection(s)}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* LLM Settings */}
      {activeSection === "llm" && (
        <div>
          <div className="glass-card">
            <div className="section-title">🤖 LLM Provider</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
              {LLM_PROVIDERS.map(p => (
                <div
                  key={p.id}
                  className={`voice-source-card ${llmProvider === p.id ? "selected" : ""}`}
                  onClick={() => setLlmProvider(p.id)}
                  style={{ padding: "10px 8px" }}
                >
                  <div className="vs-icon" style={{ fontSize: 18 }}>{p.icon}</div>
                  <div className="vs-name" style={{ fontSize: 11 }}>{p.name}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">🔑 API Key</label>
                <div className="settings-key-input">
                  <input
                    type={showKeys.llm ? "text" : "password"}
                    className="form-input"
                    placeholder="sk-..."
                    value={llmApiKey}
                    onChange={e => setLlmApiKey(e.target.value)}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleKey("llm")}>
                    {showKeys.llm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🌐 Base URL (optional)</label>
                <input type="text" className="form-input"
                  placeholder="https://api.openai.com/v1"
                  value={llmBaseUrl} onChange={e => setLlmBaseUrl(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🧠 Model Name</label>
              <input type="text" className="form-input"
                placeholder={llmProvider === "openai" ? "gpt-4o-mini" : llmProvider === "gemini" ? "gemini-2.5-flash" : "model-name"}
                value={llmModelName} onChange={e => setLlmModelName(e.target.value)} />
            </div>

            {llmProvider === "gemini" && (
              <div className="alert alert-info">
                ℹ️ For Gemini: Use format <code>gemini/gemini-2.5-flash</code> and set provider to <strong>litellm</strong> for best compatibility.
              </div>
            )}
          </div>

          <div className="glass-card">
            <div className="section-title">💾 Save Configuration</div>
            <button className="btn btn-primary btn-full" onClick={handleSaveSettings} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : "💾 Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeSection === "api_keys" && (
        <div>
          <div className="glass-card">
            <div className="section-title">🎥 Video Source API Keys</div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              ℹ️ Add multiple API keys separated by commas. The system will rotate between them to avoid rate limits.
            </div>

            {[
              { key: "pexels", label: "🌐 Pexels API Key", val: pexelsKey, set: setPexelsKey, link: "https://www.pexels.com/api" },
              { key: "pixabay", label: "🖼️ Pixabay API Key", val: pixabayKey, set: setPixabayKey, link: "https://pixabay.com/api/docs" },
              { key: "coverr", label: "🎥 Coverr API Key", val: coverrKey, set: setCoverrKey, link: "https://coverr.co" },
            ].map(item => (
              <div className="form-group" key={item.key}>
                <label className="form-label">
                  {item.label} <a href={item.link} target="_blank" rel="noreferrer"
                    style={{ color: "var(--indigo)", fontSize: 10, marginLeft: 6 }}>Get Key ↗</a>
                </label>
                <div className="settings-key-input">
                  <input
                    type={showKeys[item.key] ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter API key (multiple keys: key1,key2,...)"
                    value={item.val}
                    onChange={e => item.set(e.target.value)}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleKey(item.key)}>
                    {showKeys[item.key] ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card">
            <div className="section-title">💾 Save API Keys</div>
            <button className="btn btn-primary btn-full" onClick={handleSaveSettings} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : "💾 Save API Keys"}
            </button>
          </div>
        </div>
      )}

      {/* Assets */}
      {activeSection === "assets" && (
        <div className="grid-2">
          {/* BGM */}
          <div>
            <div className="glass-card">
              <div className="section-title">🎵 Background Music (MP3)</div>
              <div
                className={`upload-zone ${dragOver === "bgm" ? "drag-over" : ""}`}
                onClick={() => bgmRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver("bgm"); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(null);
                  const file = e.dataTransfer.files[0];
                  if (file) uploadBGM(file);
                }}
              >
                <div className="upload-icon">🎵</div>
                <h4>{bgmUploading ? "Uploading..." : "Drop MP3 here"}</h4>
                <p>or click to browse</p>
                <input ref={bgmRef} type="file" accept=".mp3" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files[0]; if (f) uploadBGM(f); }} />
              </div>

              <div style={{ marginTop: 16, maxHeight: 200, overflowY: "auto" }}>
                {bgmList.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20 }}>No BGM files uploaded</p>
                ) : bgmList.map((f, i) => (
                  <div key={i} className="file-item">
                    <span className="file-icon">🎵</span>
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{fmt(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Materials */}
          <div>
            <div className="glass-card">
              <div className="section-title">🎬 Video Materials</div>
              <div
                className={`upload-zone ${dragOver === "mat" ? "drag-over" : ""}`}
                onClick={() => matRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver("mat"); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(null);
                  const file = e.dataTransfer.files[0];
                  if (file) uploadMaterial(file);
                }}
              >
                <div className="upload-icon">🎞️</div>
                <h4>{matUploading ? "Uploading..." : "Drop video/image here"}</h4>
                <p>MP4, MOV, AVI, JPG, PNG</p>
                <input ref={matRef} type="file" accept=".mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files[0]; if (f) uploadMaterial(f); }} />
              </div>

              <div style={{ marginTop: 16, maxHeight: 200, overflowY: "auto" }}>
                {matList.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12, padding: 20 }}>No materials uploaded</p>
                ) : matList.map((f, i) => (
                  <div key={i} className="file-item">
                    <span className="file-icon">{f.name.match(/\.(jpg|jpeg|png)$/i) ? "🖼️" : "🎞️"}</span>
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{fmt(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
