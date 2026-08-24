"use client";
import { useState, useEffect, useRef } from "react";

const TTS_SERVERS = [
  { id: "azure-tts-v1", icon: "🔵", name: "Azure TTS V1", desc: "Neural voices" },
  { id: "azure-tts-v2", icon: "🟣", name: "Azure TTS V2", desc: "HD voices" },
  { id: "openai-tts", icon: "🟢", name: "OpenAI TTS", desc: "GPT voices" },
  { id: "gemini-tts", icon: "✨", name: "Gemini TTS", desc: "Google AI voices" },
  { id: "elevenlabs", icon: "⚡", name: "ElevenLabs", desc: "Ultra-realistic" },
  { id: "chatterbox", icon: "🎤", name: "Chatterbox", desc: "Local TTS" },
  { id: "no-voice", icon: "🔇", name: "No Voice", desc: "Silent" },
];

const BGM_TYPES = [
  { value: "random", label: "🎲 Random" },
  { value: "custom", label: "🎵 Custom File" },
  { value: "none", label: "🔇 No Music" },
];

const VOICE_LANGS = [
  { label: "All Languages", filter: null },
  { label: "Hindi 🇮🇳", filter: ["hi-IN"] },
  { label: "English 🇺🇸", filter: ["en-US","en-GB","en-AU","en-IN"] },
  { label: "Chinese 🇨🇳", filter: ["zh-CN","zh-TW","zh-HK"] },
  { label: "Spanish 🇪🇸", filter: ["es-ES","es-MX"] },
  { label: "Japanese 🇯🇵", filter: ["ja-JP"] },
];

const DEFAULT_VOICES = [
  "en-US-JennyNeural-Female", "en-US-GuyNeural-Male",
  "en-GB-SoniaNeural-Female", "en-GB-RyanNeural-Male",
  "hi-IN-SwaraNeural-Female", "hi-IN-MadhurNeural-Male",
  "zh-CN-XiaoxiaoNeural-Female", "zh-CN-YunxiNeural-Male",
  "es-ES-ElviraNeural-Female", "ja-JP-NanamiNeural-Female",
  "ko-KR-SunHiNeural-Female", "fr-FR-DeniseNeural-Female",
];

// Google Gemini TTS voices (Flash-8B / Flash 2.5 preview)
const GEMINI_VOICES = [
  "Aoede", "Charon", "Fenrir", "Kore",
  "Puck", "Orbit", "Zephyr", "Asteria",
  "Atlas", "Autonoe", "Callirrhoe", "Despina",
  "Enceladus", "Erinome", "Gacrux", "Io",
  "Laomedeia", "Leda", "Orus", "Perseus",
  "Schedar", "Sulafat", "Umbriel", "Vega",
];

export default function AudioSettings({ params, setParams }) {
  const [ttsServer, setTtsServer] = useState("azure-tts-v1");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [voiceLang, setVoiceLang] = useState("All Languages");
  const [bgmFiles, setBgmFiles] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch("/api/v1/musics")
      .then(r => r.json())
      .then(d => setBgmFiles(d.data?.files || []))
      .catch(() => {});
  }, []);

  const update = (key, val) => setParams(p => ({ ...p, [key]: val }));

  const isGemini = ttsServer === "gemini-tts";
  const langFilter = VOICE_LANGS.find(l => l.label === voiceLang)?.filter || null;
  const filteredVoices = isGemini
    ? GEMINI_VOICES
    : (langFilter
        ? DEFAULT_VOICES.filter(v => langFilter.some(lf => v.toLowerCase().startsWith(lf.toLowerCase())))
        : DEFAULT_VOICES);

  const handlePreviewVoice = async () => {
    setPreviewLoading(true);
    setPreviewAudio(null);
    try {
      const res = await fetch("/api/v1/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_script: "This is a voice preview. Testing audio output quality.",
          voice_name: params.voice_name,
          voice_rate: params.voice_rate,
          voice_volume: params.voice_volume,
          bgm_type: "none",
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewAudio(url);
      }
    } catch {}
    setPreviewLoading(false);
  };

  return (
    <div>
      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderTop: "2px solid var(--cyan)" }}>
          <span className="metric-icon">🔊</span>
          <div>
            <div className="metric-label">TTS Server</div>
            <div className="metric-value" style={{ fontSize: 13 }}>{ttsServer.replace("azure-", "Azure ")}</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--green)" }}>
          <span className="metric-icon">⚡</span>
          <div>
            <div className="metric-label">Voice Rate</div>
            <div className="metric-value">{params.voice_rate}x</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--indigo)" }}>
          <span className="metric-icon">🔉</span>
          <div>
            <div className="metric-label">Voice Volume</div>
            <div className="metric-value">{Math.round(params.voice_volume * 100)}%</div>
          </div>
        </div>
        <div className="metric-card" style={{ borderTop: "2px solid var(--yellow)" }}>
          <span className="metric-icon">🎵</span>
          <div>
            <div className="metric-label">BGM Volume</div>
            <div className="metric-value">{Math.round(params.bgm_volume * 100)}%</div>
          </div>
        </div>
      </div>

      {/* TTS Server Selection */}
      <div className="glass-card">
        <div className="section-title">🎙️ TTS Server</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {TTS_SERVERS.map(srv => (
            <div
              key={srv.id}
              className={`voice-source-card ${ttsServer === srv.id ? "selected" : ""}`}
              onClick={() => setTtsServer(srv.id)}
            >
              <div className="vs-icon">{srv.icon}</div>
              <div className="vs-name">{srv.name}</div>
              <div className="vs-desc">{srv.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      {ttsServer !== "no-voice" && (
        <div className="glass-card">
          <div className="section-title">🎤 Voice Selection</div>
          {/* Gemini-specific: API key + info */}
          {isGemini && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                ✨ <strong>Google Gemini TTS</strong> — Uses Gemini 2.0/2.5 Flash model for
                ultra-natural AI voices. Requires a Google Gemini API key.
              </div>
              <div className="form-group">
                <label className="form-label">🔑 Gemini API Key</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    className="form-input"
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowGeminiKey(s => !s)}>
                    {showGeminiKey ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="help-text">Get your key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: "var(--indigo)" }}>aistudio.google.com ↗</a></div>
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Language filter — hidden for Gemini */}
            {!isGemini && (
              <div className="form-group">
                <label className="form-label">🌐 Filter by Language</label>
                <select className="form-select" value={voiceLang} onChange={e => setVoiceLang(e.target.value)}>
                  {VOICE_LANGS.map(l => <option key={l.label} value={l.label}>{l.label}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">🎤 Select Voice</label>
              <select className="form-select" value={params.voice_name} onChange={e => update("voice_name", e.target.value)}>
                {filteredVoices.map(v => (
                  <option key={v} value={v}>{v.replace("-Neural", "").replace("Neural", "")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">⚡ Voice Rate: <strong style={{ color: "var(--cyan)" }}>{params.voice_rate}x</strong></label>
              <input type="range" className="form-range" min={0.5} max={2.0} step={0.1}
                value={params.voice_rate} onChange={e => update("voice_rate", parseFloat(e.target.value))} />
              <div className="range-labels"><span>0.5x</span><span>1.0x</span><span>2.0x</span></div>
            </div>
            <div className="form-group">
              <label className="form-label">🔉 Voice Volume: <strong style={{ color: "var(--green)" }}>{Math.round(params.voice_volume * 100)}%</strong></label>
              <input type="range" className="form-range" min={0} max={2.0} step={0.1}
                value={params.voice_volume} onChange={e => update("voice_volume", parseFloat(e.target.value))} />
              <div className="range-labels"><span>0%</span><span>100%</span><span>200%</span></div>
            </div>
          </div>

          <div className="grid-2">
            <button className="btn btn-indigo btn-full" onClick={handlePreviewVoice} disabled={previewLoading}>
              {previewLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Synthesizing...</> : "▶️ Preview Voice"}
            </button>
            <div />
          </div>

          {previewAudio && (
            <div className="audio-player-card" style={{ marginTop: 12 }}>
              <audio ref={audioRef} controls autoPlay src={previewAudio} style={{ width: "100%" }} />
            </div>
          )}
        </div>
      )}

      {/* BGM Settings */}
      <div className="glass-card">
        <div className="section-title">🎵 Background Music</div>
        <div className="form-group">
          <label className="form-label">BGM Type</label>
          <div className="segment-selector">
            {BGM_TYPES.map(t => (
              <button key={t.value} className={`segment-option ${params.bgm_type === t.value ? "active" : ""}`}
                onClick={() => update("bgm_type", t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {params.bgm_type === "custom" && (
          <div className="form-group">
            <label className="form-label">🎵 Select BGM File</label>
            <select className="form-select" value={params.bgm_file} onChange={e => update("bgm_file", e.target.value)}>
              <option value="">-- Select a BGM file --</option>
              {bgmFiles.map(f => <option key={f.file} value={f.file}>{f.name}</option>)}
            </select>
            {bgmFiles.length === 0 && (
              <div className="help-text">No BGM files found. Upload MP3 files in the Assets Manager.</div>
            )}
          </div>
        )}

        {params.bgm_type !== "none" && (
          <div className="form-group">
            <label className="form-label">🔉 BGM Volume: <strong style={{ color: "var(--yellow)" }}>{Math.round(params.bgm_volume * 100)}%</strong></label>
            <input type="range" className="form-range" min={0} max={1.0} step={0.05}
              value={params.bgm_volume} onChange={e => update("bgm_volume", parseFloat(e.target.value))} />
            <div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
