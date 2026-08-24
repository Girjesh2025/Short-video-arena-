"use client";
import { useState, useEffect } from "react";

const FONTS = [
  "STHeitiMedium.ttc", "Arial.ttf", "Impact.ttf",
  "TimesNewRoman.ttf", "ComicSans.ttf", "Roboto-Bold.ttf",
];

const POSITIONS = [
  { value: "top", label: "Top", icon: "⬆️" },
  { value: "center", label: "Center", icon: "⬛" },
  { value: "bottom", label: "Bottom", icon: "⬇️" },
  { value: "custom", label: "Custom %", icon: "📏" },
];

const PRESETS = {
  "Classic White": { text_fore_color: "#FFFFFF", font_size: 60, stroke_color: "#000000", stroke_width: 2, subtitle_background_enabled: false, subtitle_position: "bottom" },
  "Yellow Bold": { text_fore_color: "#FFE500", font_size: 65, stroke_color: "#000000", stroke_width: 3, subtitle_background_enabled: false, subtitle_position: "bottom" },
  "Black Box": { text_fore_color: "#FFFFFF", font_size: 55, stroke_color: "#000000", stroke_width: 0, subtitle_background_enabled: true, text_background_color: "#000000", subtitle_position: "bottom" },
  "Neon Pink": { text_fore_color: "#FF2E93", font_size: 62, stroke_color: "#000000", stroke_width: 2, subtitle_background_enabled: false, subtitle_position: "bottom" },
};

export default function SubtitleSettings({ params, setParams }) {
  const [selectedPreset, setSelectedPreset] = useState("custom");

  const update = (key, val) => setParams(p => ({ ...p, [key]: val }));

  const applyPreset = (name) => {
    const cfg = PRESETS[name];
    if (!cfg) return;
    setParams(p => ({ ...p, ...cfg }));
    setSelectedPreset(name);
  };

  // Build preview CSS
  const previewPos = params.subtitle_position;
  let posStyle = {};
  if (previewPos === "top") posStyle = { top: "15%", left: "50%", transform: "translateX(-50%)" };
  else if (previewPos === "center") posStyle = { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  else if (previewPos === "bottom") posStyle = { bottom: "15%", left: "50%", transform: "translateX(-50%)" };
  else posStyle = { top: `${params.custom_position}%`, left: "50%", transform: "translateX(-50%)" };

  const subBg = params.subtitle_background_enabled
    ? `${params.text_background_color}${params.rounded_subtitle_background ? " border-radius:8px" : ""}`
    : "transparent";

  return (
    <div>
      {/* Preset Selector */}
      <div className="glass-card">
        <div className="section-title">🎨 Style Presets</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {["Custom", ...Object.keys(PRESETS)].map(name => (
            <button
              key={name}
              className={`btn ${selectedPreset === name.toLowerCase() || (name !== "Custom" && selectedPreset === name) ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => name === "Custom" ? setSelectedPreset("custom") : applyPreset(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Settings */}
        <div>
          {/* Subtitle Toggle */}
          <div className="glass-card">
            <div className="section-title">🔤 Subtitle Settings</div>
            <div className="form-group">
              <label className="toggle-wrapper">
                <div className="toggle-switch">
                  <input type="checkbox" checked={params.subtitle_enabled}
                    onChange={e => update("subtitle_enabled", e.target.checked)} />
                  <div className="toggle-track" />
                </div>
                <span className="toggle-label">Enable Subtitles</span>
              </label>
            </div>

            {params.subtitle_enabled && (
              <>
                <div className="form-group">
                  <label className="form-label">🔤 Font</label>
                  <select className="form-select" value={params.font_name} onChange={e => update("font_name", e.target.value)}>
                    {FONTS.map(f => <option key={f} value={f}>{f.replace(".ttf","").replace(".ttc","")}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">📍 Position</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                    {POSITIONS.map(p => (
                      <button
                        key={p.value}
                        className={`btn btn-sm ${params.subtitle_position === p.value ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => update("subtitle_position", p.value)}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {params.subtitle_position === "custom" && (
                  <div className="form-group">
                    <label className="form-label">📏 Custom Position: <strong style={{ color: "var(--pink)" }}>{params.custom_position}%</strong> from top</label>
                    <input type="range" className="form-range" min={0} max={100} step={1}
                      value={params.custom_position} onChange={e => update("custom_position", parseInt(e.target.value))} />
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">🎨 Font Color</label>
                    <div className="color-input-row">
                      <input type="color" className="form-color" value={params.text_fore_color}
                        onChange={e => update("text_fore_color", e.target.value)} />
                      <span className="color-value-display">{params.text_fore_color}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">📏 Font Size: <strong style={{ color: "var(--cyan)" }}>{params.font_size}px</strong></label>
                    <input type="range" className="form-range" min={20} max={100} step={2}
                      value={params.font_size} onChange={e => update("font_size", parseInt(e.target.value))} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">🖊️ Stroke Color</label>
                    <div className="color-input-row">
                      <input type="color" className="form-color" value={params.stroke_color}
                        onChange={e => update("stroke_color", e.target.value)} />
                      <span className="color-value-display">{params.stroke_color}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">🖊️ Stroke Width: <strong style={{ color: "var(--indigo)" }}>{params.stroke_width}</strong></label>
                    <input type="range" className="form-range" min={0} max={10} step={0.5}
                      value={params.stroke_width} onChange={e => update("stroke_width", parseFloat(e.target.value))} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Subtitle Background */}
          {params.subtitle_enabled && (
            <div className="glass-card">
              <div className="section-title">🟫 Subtitle Background</div>
              <div className="form-group">
                <label className="toggle-wrapper">
                  <div className="toggle-switch">
                    <input type="checkbox" checked={params.subtitle_background_enabled}
                      onChange={e => update("subtitle_background_enabled", e.target.checked)} />
                    <div className="toggle-track" />
                  </div>
                  <span className="toggle-label">Enable Background Box</span>
                </label>
              </div>

              {params.subtitle_background_enabled && (
                <>
                  <div className="form-group">
                    <label className="form-label">🎨 Background Color</label>
                    <div className="color-input-row">
                      <input type="color" className="form-color" value={params.text_background_color}
                        onChange={e => update("text_background_color", e.target.value)} />
                      <span className="color-value-display">{params.text_background_color}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="toggle-wrapper">
                      <div className="toggle-switch">
                        <input type="checkbox" checked={params.rounded_subtitle_background}
                          onChange={e => update("rounded_subtitle_background", e.target.checked)} />
                        <div className="toggle-track" />
                      </div>
                      <span className="toggle-label">Rounded Corners</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Phone Preview */}
        <div>
          <div className="glass-card">
            <div className="section-title">📱 Live Preview</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="phone-mockup">
                <div className="phone-notch" />
                {/* Background gradient to simulate video */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, #1a1f35 0%, #0a0f1e 60%, #1a0f35 100%)",
                }}>
                  {/* Simulated video overlay lines */}
                  <div style={{ position: "absolute", inset: 0, opacity: 0.05,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "100% 20px" }} />
                </div>
                {params.subtitle_enabled && (
                  <div style={{
                    position: "absolute",
                    ...posStyle,
                    fontSize: Math.max(9, params.font_size * 0.18),
                    color: params.text_fore_color,
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    WebkitTextStroke: `${params.stroke_width * 0.3}px ${params.stroke_color}`,
                    whiteSpace: "nowrap",
                    padding: params.subtitle_background_enabled ? "4px 8px" : "0",
                    backgroundColor: params.subtitle_background_enabled ? params.text_background_color : "transparent",
                    borderRadius: params.rounded_subtitle_background ? "6px" : "0",
                    zIndex: 10,
                  }}>
                    Sample Subtitle Text
                  </div>
                )}
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 14 }}>
              Live preview of subtitle styling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
