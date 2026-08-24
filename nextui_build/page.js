"use client";
import { useState, useEffect } from "react";
import ScriptTopic from "@/components/ScriptTopic";
import VideoSettings from "@/components/VideoSettings";
import AudioSettings from "@/components/AudioSettings";
import SubtitleSettings from "@/components/SubtitleSettings";
import VideoCompiler from "@/components/VideoCompiler";
import TextToAudio from "@/components/TextToAudio";
import SavedVideos from "@/components/SavedVideos";
import SystemSettings from "@/components/SystemSettings";

const NAV_ITEMS = [
  { id: "script", icon: "✍️", label: "Script & Topic", group: "Create" },
  { id: "video", icon: "🎞️", label: "Video Settings", group: "Create" },
  { id: "audio", icon: "🔊", label: "Audio Settings", group: "Create" },
  { id: "subtitles", icon: "🎨", label: "Subtitle Settings", group: "Create" },
  { id: "compiler", icon: "🎬", label: "Video Compiler", group: "Create" },
  { id: "tts", icon: "🎙️", label: "Text to Audio", group: "Tools" },
  { id: "saved", icon: "📁", label: "Saved Videos", group: "Library" },
  { id: "settings", icon: "⚙️", label: "System Settings", group: "Config" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("script");
  const [params, setParams] = useState({
    // Script
    video_subject: "",
    video_language: "",
    video_script: "",
    video_script_prompt: "",
    paragraph_number: 1,
    // Video
    video_source: "pexels",
    video_aspect: "9:16",
    video_count: 1,
    video_clip_duration: 5,
    video_transition: "none",
    border_width: 0,
    border_color: "#FFFFFF",
    caption_style: "standard",
    // Audio
    voice_name: "en-US-JennyNeural-Female",
    voice_rate: 1.0,
    voice_volume: 1.0,
    bgm_type: "random",
    bgm_file: "",
    bgm_volume: 0.2,
    // Subtitles
    subtitle_enabled: true,
    font_name: "STHeitiMedium.ttc",
    text_fore_color: "#FFFFFF",
    font_size: 60,
    stroke_color: "#000000",
    stroke_width: 1.5,
    subtitle_position: "bottom",
    text_background_color: "#000000",
    subtitle_background_enabled: true,
    rounded_subtitle_background: false,
    custom_position: 70,
  });
  const [diskUsed, setDiskUsed] = useState(45);

  // Fetch disk usage from a health endpoint
  useEffect(() => {
    fetch("/api/v1/ping").then(r => r.json()).catch(() => {});
  }, []);

  const groups = [...new Set(NAV_ITEMS.map(i => i.group))];

  const COMPONENTS = {
    script: <ScriptTopic params={params} setParams={setParams} onGenerate={() => setActiveTab("compiler")} />,
    video: <VideoSettings params={params} setParams={setParams} />,
    audio: <AudioSettings params={params} setParams={setParams} />,
    subtitles: <SubtitleSettings params={params} setParams={setParams} />,
    compiler: <VideoCompiler params={params} />,
    tts: <TextToAudio />,
    saved: <SavedVideos />,
    settings: <SystemSettings />,
  };

  const activeNav = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Video Arena 🦊</h1>
          <p>World-Class Video Generator</p>
        </div>

        <nav className="sidebar-nav">
          {groups.map(group => (
            <div key={group}>
              <div className="sidebar-section-label">{group}</div>
              {NAV_ITEMS.filter(i => i.group === group).map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-status">
          <h4>System Node Status</h4>
          <div className="status-row">
            <span>🟢 API Gateway</span>
            <span className="status-badge" style={{ color: "var(--green)" }}>Online</span>
          </div>
          <div className="status-row">
            <span>💾 Disk</span>
            <span className="status-badge" style={{ color: diskUsed < 75 ? "var(--green)" : "var(--red)" }}>
              {diskUsed}%
            </span>
          </div>
          <div className="status-row">
            <span>⚡ Render</span>
            <span className="status-badge" style={{ color: "#818CF8" }}>Ready</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="page-header">
          <h2>{activeNav?.icon} {activeNav?.label}</h2>
          <p>
            {activeTab === "script" && "Configure your video topic, script, and language settings"}
            {activeTab === "video" && "Choose video source, aspect ratio, duration, and visual style"}
            {activeTab === "audio" && "Select voice synthesis, background music, and audio settings"}
            {activeTab === "subtitles" && "Customize subtitle appearance, fonts, colors, and positioning"}
            {activeTab === "compiler" && "Review all settings and generate your final video"}
            {activeTab === "tts" && "Convert text to speech audio and download as MP3"}
            {activeTab === "saved" && "Browse, stream, and download your previously generated videos"}
            {activeTab === "settings" && "Configure API keys, LLM providers, and global preferences"}
          </p>
        </div>

        {COMPONENTS[activeTab]}
      </main>
    </div>
  );
}
