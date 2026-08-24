import { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Sliders, Type, Frame, Music, Play, AlertCircle, RefreshCw, Layers, Upload, X, Check, Laptop, Smartphone, Square as SquareIcon, Image as ImageIcon, FolderOpen, Video, Mic, Volume2, Gauge, Shuffle, VolumeX, FileAudio } from "lucide-react";

export default function GeneratorForm({ activeTab, setActiveTab, onTaskCreated }) {
  const [loading, setLoading] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingTerms, setGeneratingTerms] = useState(false);
  const [bgmFiles, setBgmFiles] = useState([]);
  const [videoMaterials, setVideoMaterials] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState(false);

  // Logo/Watermark upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const allowed = ["jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setLogoUploadError("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    setLogoUploading(true);
    setLogoUploadError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await axios.post("/api/v1/video_materials", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data?.file) {
        const uploadedFile = res.data.data.file;
        handleFieldChange("watermark_path", `storage/local_videos/${uploadedFile}`);
      } else {
        setLogoUploadError("Failed to resolve uploaded filename");
      }
    } catch (err) {
      setLogoUploadError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  // Form Fields State
  const [formData, setFormData] = useState({
    video_subject: "Tokyo Coffee Shops",
    video_language: "en-US",
    paragraph_number: 2,
    video_script_prompt: "Write a short engaging script about 3 quiet hidden coffee shops in Tokyo.",
    custom_system_prompt: "",
    video_script: "",
    video_terms: "",
    video_source: "pexels", // pexels, pixabay, coverr, local, g-veo
    video_aspect: "9:16", // 9:16, 16:9, 1:1
    video_concat_mode: "random", // random, sequential
    video_transition_mode: "none", // none, fade-in, slide-in, etc.
    video_clip_duration: 5,
    match_materials_to_script: true,
    voice_name: "en-US-AvaMultilingualNeural-Female",
    voice_volume: 1.0,
    voice_rate: 1.1,
    bgm_type: "random", // none, random, custom
    bgm_file: "",
    bgm_volume: 0.15,
    subtitle_enabled: true,
    font_name: "MicrosoftYaHeiBold.ttc",
    subtitle_position: "bottom", // top, center, bottom, custom
    custom_position: 70.0,
    font_size: 60,
    text_fore_color: "#FFFFFF",
    stroke_color: "#000000",
    stroke_width: 1.5,
    subtitle_background_enabled: false,
    subtitle_background_color: "#000000",
    rounded_subtitle_background: false,
    caption_style: "standard", // standard, tiktok, hormozi
    watermark_path: "",
    border_width: 0,
    border_color: "#FFFFFF",
  });

  const [selectedPreset, setSelectedPreset] = useState("custom");

  const subtitlePresets = {
    tiktok: {
      text_fore_color: "#FFDD00",
      font_size: 65,
      stroke_color: "#000000",
      stroke_width: 4.0,
      subtitle_background_enabled: false,
      rounded_subtitle_background: false,
      subtitle_position: "bottom",
      subtitle_background_color: "#000000"
    },
    hormozi: {
      text_fore_color: "#FFFFFF",
      font_size: 60,
      stroke_color: "#000000",
      stroke_width: 3.0,
      subtitle_background_enabled: true,
      subtitle_background_color: "#10B981",
      rounded_subtitle_background: true,
      subtitle_position: "center"
    },
    minimalist: {
      text_fore_color: "#E2E8F0",
      font_size: 40,
      stroke_color: "#000000",
      stroke_width: 1.0,
      subtitle_background_enabled: false,
      rounded_subtitle_background: false,
      subtitle_position: "bottom",
      subtitle_background_color: "#000000"
    },
    karaoke: {
      text_fore_color: "#3B82F6",
      font_size: 55,
      stroke_color: "#FFFFFF",
      stroke_width: 2.0,
      subtitle_background_enabled: true,
      subtitle_background_color: "#1E293B",
      rounded_subtitle_background: true,
      subtitle_position: "bottom"
    }
  };

  // Fetch BGM list, materials list, and fonts on mount
  useEffect(() => {
    fetchBgmList();
    fetchVideoMaterials();
    fetchFonts();
  }, []);

  // Fetch voices when provider or language changes
  useEffect(() => {
    fetchVoices();
  }, [formData.video_language]);

  const fetchBgmList = async () => {
    try {
      const response = await axios.get("/musics");
      if (response.data && response.data.data) {
        setBgmFiles(response.data.data.files || []);
      }
    } catch (err) {
      console.error("Failed to load musics", err);
    }
  };

  const fetchVideoMaterials = async () => {
    try {
      const response = await axios.get("/video_materials");
      if (response.data && response.data.data) {
        setVideoMaterials(response.data.data.files || []);
      }
    } catch (err) {
      console.error("Failed to load video materials", err);
    }
  };

  const fetchFonts = async () => {
    setLoadingFonts(true);
    try {
      const response = await axios.get("/api/v1/fonts");
      setFonts(response.data?.data?.fonts || []);
    } catch (err) {
      console.error("Failed to load fonts", err);
    } finally {
      setLoadingFonts(false);
    }
  };

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      // Determine voice provider based on general app setting if possible
      const configRes = await axios.get("/api/v1/config");
      const provider = configRes.data?.data?.app?.llm_provider || "azure-tts-v1";
      
      const response = await axios.get("/api/v1/voices", {
        params: { 
          provider: provider.includes("azure") ? provider : "azure-tts-v1",
          language: formData.video_language.split("-")[0] // e.g. en, hi, zh
        }
      });
      const voiceList = response.data?.data?.voices || [];
      setVoices(voiceList);
      
      // Hindi default font selection logic
      const isHindi = formData.video_language === "hi-IN" || formData.video_language.startsWith("hi");
      
      if (voiceList.length > 0) {
        const defaultVoice = voiceList.find(v => isHindi ? v.startsWith("hi-IN") : v.startsWith(formData.video_language)) || voiceList[0];
        setFormData(prev => ({
          ...prev,
          voice_name: defaultVoice,
          font_name: isHindi ? "NotoSansDevanagari-Bold.ttf" : prev.font_name
        }));
      }
    } catch (err) {
      console.error("Failed to fetch voices", err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    if (presetName !== "custom" && subtitlePresets[presetName]) {
      const preset = subtitlePresets[presetName];
      setFormData(prev => ({
        ...prev,
        text_fore_color: preset.text_fore_color,
        font_size: preset.font_size,
        stroke_color: preset.stroke_color,
        stroke_width: preset.stroke_width,
        subtitle_background_enabled: preset.subtitle_background_enabled,
        rounded_subtitle_background: preset.rounded_subtitle_background,
        subtitle_position: preset.subtitle_position,
        subtitle_background_color: preset.subtitle_background_color
      }));
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Detect manual override to set preset to custom
      if (activeTab === "subtitle" && selectedPreset !== "custom") {
        const preset = subtitlePresets[selectedPreset];
        if (preset) {
          const modified = 
            updated.text_fore_color !== preset.text_fore_color ||
            updated.font_size !== preset.font_size ||
            updated.subtitle_position !== preset.subtitle_position ||
            updated.subtitle_background_enabled !== preset.subtitle_background_enabled ||
            updated.rounded_subtitle_background !== preset.rounded_subtitle_background ||
            updated.stroke_color !== preset.stroke_color ||
            updated.stroke_width !== preset.stroke_width ||
            updated.subtitle_background_color !== preset.subtitle_background_color;
          
          if (modified) {
            setSelectedPreset("custom");
          }
        }
      }

      // Automatically set Devanagari font when switching to Hindi language
      if (name === "video_language" && (value === "hi-IN" || value.startsWith("hi"))) {
        updated.font_name = "NotoSansDevanagari-Bold.ttf";
      }

      return updated;
    });
  };

  // Generate Script via LLM
  const handleGenerateScript = async () => {
    if (!formData.video_subject) return;
    setGeneratingScript(true);
    try {
      const response = await axios.post("/api/v1/scripts", {
        video_subject: formData.video_subject,
        video_language: formData.video_language,
        paragraph_number: formData.paragraph_number,
        video_script_prompt: formData.video_script_prompt,
        custom_system_prompt: formData.custom_system_prompt,
      });
      if (response.data && response.data.data) {
        setFormData((prev) => ({
          ...prev,
          video_script: response.data.data.video_script,
        }));
      }
    } catch (err) {
      alert("Failed to generate script: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingScript(false);
    }
  };

  // Generate Terms via LLM
  const handleGenerateTerms = async () => {
    if (!formData.video_subject || !formData.video_script) return;
    setGeneratingTerms(true);
    try {
      const response = await axios.post("/api/v1/terms", {
        video_subject: formData.video_subject,
        video_script: formData.video_script,
        amount: formData.paragraph_number * 3,
        match_materials_to_script: formData.match_materials_to_script,
      });
      if (response.data && response.data.data) {
        const termsList = response.data.data.video_terms || [];
        setFormData((prev) => ({
          ...prev,
          video_terms: Array.isArray(termsList) ? termsList.join(", ") : termsList,
        }));
      }
    } catch (err) {
      alert("Failed to generate terms: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingTerms(false);
    }
  };

  // Submit E2E Generation Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.video_script) {
      alert("Please write or generate a video script first!");
      return;
    }
    setLoading(true);
    try {
      // Split comma separated terms into array if present
      const processedTerms = formData.video_terms
        ? formData.video_terms.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Convert text_background_color: if enabled, pass hex string, otherwise false
      const textBg = formData.subtitle_background_enabled ? formData.subtitle_background_color : false;

      const payload = {
        ...formData,
        video_terms: processedTerms,
        text_background_color: textBg,
        video_count: 1, // generate single video at a time
      };

      const response = await axios.post("/api/v1/videos", payload);
      if (response.data && response.data.data) {
        onTaskCreated(response.data.data.task_id);
      }
    } catch (err) {
      alert("Task Creation Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Live Canvas Position Styles
  const getPreviewPositionStyle = () => {
    switch (formData.subtitle_position) {
      case "top":
        return { top: "15%", transform: "translate(-50%, -50%)" };
      case "center":
        return { top: "50%", transform: "translate(-50%, -50%)" };
      case "custom":
        return { top: `${formData.custom_position}%`, transform: "translate(-50%, -50%)" };
      case "bottom":
      default:
        return { top: "85%", transform: "translate(-50%, -50%)" };
    }
  };

  const friendlyVoiceName = (v) => {
    if (!v) return "";
    return v
      .replace("Female", "Female 👧")
      .replace("Male", "Male 👦")
      .replace("Neural", "")
      .replace("-", " ")
      .split(":")
      .pop();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Script & Topic view */}
      {activeTab === "script" && (
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Faint background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Premium Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/5">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/15">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Script & Visual Strategy
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Draft video content structure and configure visual prompt search parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Video Subject</label>
              <input
                type="text"
                value={formData.video_subject}
                onChange={(e) => handleFieldChange("video_subject", e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                placeholder="e.g. History of Bitcoin"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Language</label>
              <select
                value={formData.video_language}
                onChange={(e) => handleFieldChange("video_language", e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm text-slate-300 transition-all outline-none cursor-pointer"
              >
                <option value="en-US">English 🇺🇸 (en-US)</option>
                <option value="hi-IN">Hindi 🇮🇳 (hi-IN)</option>
                <option value="zh-CN">Chinese 🇨🇳 (zh-CN)</option>
                <option value="ru-RU">Russian 🇷🇺 (ru-RU)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Script Writing Prompt</label>
            <textarea
              value={formData.video_script_prompt}
              onChange={(e) => handleFieldChange("video_script_prompt", e.target.value)}
              rows={2}
              className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none resize-none leading-relaxed"
              placeholder="Outline your script requirements..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-950/25 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Paragraphs count:</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.paragraph_number}
                onChange={(e) => handleFieldChange("paragraph_number", parseInt(e.target.value) || 1)}
                className="w-16 bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-3 py-1.5 rounded-lg text-sm text-center text-white outline-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateScript}
              disabled={generatingScript || !formData.video_subject}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800/80 transition-all shadow-md active:scale-98 hover:shadow-indigo-500/20 disabled:shadow-none cursor-pointer"
            >
              {generatingScript ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generatingScript ? "Writing Script..." : "AI Generate Script"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Video Narration Script</label>
            <textarea
              value={formData.video_script}
              onChange={(e) => handleFieldChange("video_script", e.target.value)}
              rows={5}
              className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none resize-y leading-relaxed"
              placeholder="Narration script text lines..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Search Keywords (CSV)</label>
                <button
                  type="button"
                  onClick={handleGenerateTerms}
                  disabled={generatingTerms || !formData.video_script}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {generatingTerms ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Auto Keywords
                </button>
              </div>
              <input
                type="text"
                value={formData.video_terms}
                onChange={(e) => handleFieldChange("video_terms", e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                placeholder="e.g. coffee shop, espresso, cozy table"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="match_materials_to_script"
                checked={formData.match_materials_to_script}
                onChange={(e) => handleFieldChange("match_materials_to_script", e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <label htmlFor="match_materials_to_script" className="text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-all select-none">
                Match materials sequence to script chronological order
              </label>
            </div>
          </div>

          {/* Stepper Wizard Footer */}
          <div className="flex justify-end pt-6 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-98 cursor-pointer"
            >
              Proceed to Video Settings ➔
            </button>
          </div>
        </div>
      )}

      {/* 2. Video Settings view */}
      {activeTab === "video" && (
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Faint background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Premium Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/5">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/15">
              <Frame className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                Video Format & Layout
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Configure content sourcing engine, dimensions, frames, transitions, and branding watermarks.
              </p>
            </div>
          </div>

          {/* 1. Sourcing Engine (Video Source Selector) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
              Video Source Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "pexels", name: "Pexels", provider: "Pexels API", icon: <Video className="h-5 w-5" />, label: "Free Stock" },
                { id: "pixabay", name: "Pixabay", provider: "Pixabay API", icon: <ImageIcon className="h-5 w-5" />, label: "Free Stock" },
                { id: "coverr", name: "Coverr", provider: "Coverr API", icon: <Video className="h-5 w-5" />, label: "Premium Clips" },
                { id: "g-veo", name: "Google Veo", provider: "Gemini AI", icon: <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />, label: "AI Video" },
                { id: "local", name: "Local Files", provider: "Server storage", icon: <FolderOpen className="h-5 w-5" />, label: "Local Media" },
              ].map((src) => {
                const isActive = formData.video_source === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => handleFieldChange("video_source", src.id)}
                    className={`relative overflow-hidden cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-2 group select-none ${
                      isActive
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5 scale-[1.02]"
                        : "border-white/5 bg-slate-950/40 hover:border-white/10 hover:bg-slate-955/60"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-amber-500/20 text-amber-400" : "bg-slate-900 text-slate-400 group-hover:text-slate-200"
                    }`}>
                      {src.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{src.name}</div>
                      <div className="text-[8px] text-slate-500 font-medium mt-0.5">{src.provider}</div>
                    </div>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                      isActive ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-500"
                    }`}>
                      {src.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Dimensions & Duration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
            {/* Aspect Ratio Cards */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
                Canvas Dimension Ratio
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    id: "9:16",
                    name: "Portrait",
                    desc: "TikTok, Reels, Shorts",
                    aspect: "9:16",
                    icon: <Smartphone className="h-5 w-5" />,
                    frameClass: "w-[24px] h-[40px] border-2 rounded",
                  },
                  {
                    id: "16:9",
                    name: "Landscape",
                    desc: "YouTube, Presentation",
                    aspect: "16:9",
                    icon: <Laptop className="h-5 w-5" />,
                    frameClass: "w-[40px] h-[24px] border-2 rounded",
                  },
                  {
                    id: "1:1",
                    name: "Square",
                    desc: "Instagram, Square player",
                    aspect: "1:1",
                    icon: <SquareIcon className="h-5 w-5" />,
                    frameClass: "w-[28px] h-[28px] border-2 rounded",
                  },
                ].map((item) => {
                  const isActive = formData.video_aspect === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleFieldChange("video_aspect", item.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 select-none ${
                        isActive
                          ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5 scale-[1.02]"
                          : "border-white/5 bg-slate-955/40 hover:border-white/10 hover:bg-slate-955/60"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center min-w-[50px]">
                        <div className={`flex items-center justify-center transition-all ${
                          isActive ? "border-amber-500 text-amber-400" : "border-slate-700 text-slate-500"
                        } ${item.frameClass}`}>
                          <span className="text-[7px] font-mono font-bold">{item.aspect}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {item.name}
                          {isActive && <Check className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Max Duration */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
                Clip Duration Limits
              </label>
              <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Max Clip Length:</span>
                  <span className="text-xs text-amber-400 font-bold font-mono">{formData.video_clip_duration} sec</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={15}
                  value={formData.video_clip_duration}
                  onChange={(e) => handleFieldChange("video_clip_duration", parseInt(e.target.value) || 5)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[8px] text-slate-600 font-bold font-mono">
                  <span>2s</span>
                  <span>5s</span>
                  <span>10s</span>
                  <span>15s</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Style Options (Border, Color, Transition) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Video Border Width</label>
              <select
                value={formData.border_width}
                onChange={(e) => handleFieldChange("border_width", parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 px-4 py-3 rounded-xl text-sm text-slate-300 transition-all outline-none cursor-pointer"
              >
                <option value={0}>None (0px)</option>
                <option value={5}>Thin (5px)</option>
                <option value={10}>Normal (10px)</option>
                <option value={15}>Bold (15px)</option>
                <option value={20}>Thick (20px)</option>
                <option value={30}>Extra Thick (30px)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Border Frame Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.border_color.startsWith("#") ? formData.border_color : "#FFFFFF"}
                  onChange={(e) => handleFieldChange("border_color", e.target.value)}
                  className="h-11 w-12 rounded-xl border border-white/5 bg-slate-955/50 p-1 cursor-pointer"
                />
                <select
                  value={formData.border_color}
                  onChange={(e) => handleFieldChange("border_color", e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-white/5 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 px-4 py-3 rounded-xl text-sm text-slate-300 transition-all outline-none cursor-pointer"
                >
                  <option value="#FFFFFF">White</option>
                  <option value="#000000">Black</option>
                  <option value="#FFD700">Gold</option>
                  <option value="#FF0000">Red</option>
                  <option value="#00FF00">Green</option>
                  <option value="#0000FF">Blue</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">Clips Transition Style</label>
              <select
                value={formData.video_transition_mode}
                onChange={(e) => handleFieldChange("video_transition_mode", e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 px-4 py-3 rounded-xl text-sm text-slate-300 transition-all outline-none cursor-pointer"
              >
                <option value="none">None (Cut)</option>
                <option value="shuffle">Shuffle Modes</option>
                <option value="fade-in">Fade In</option>
                <option value="fade-out">Fade Out</option>
                <option value="slide-in">Slide In</option>
              </select>
            </div>
          </div>

          {/* 4. Branding & Logo File Upload (Watermark) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
              Overlay Branding Watermark (Optional)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Upload zone card */}
              <div className="md:col-span-2 relative">
                <input
                  type="file"
                  id="logo-file-input"
                  onChange={handleLogoUpload}
                  accept=".jpg,.jpeg,.png"
                  disabled={logoUploading}
                  className="hidden"
                />
                
                {formData.watermark_path ? (
                  <div className="flex items-center justify-between bg-slate-950/40 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">Logo Uploaded Successfully</div>
                        <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5 font-mono">{formData.watermark_path}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("watermark_path", "")}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                      title="Remove watermark"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-file-input"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-amber-500/30 bg-slate-950/20 hover:bg-slate-955/40 rounded-2xl p-6 cursor-pointer transition-all duration-300 group"
                  >
                    {logoUploading ? (
                      <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-500 group-hover:text-amber-500 group-hover:scale-105 transition-all mb-2" />
                    )}
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-all">
                      {logoUploading ? "Uploading Branding Logo..." : "Upload Branding Logo / Watermark"}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold mt-1">
                      Supports JPG, JPEG, and PNG formats (Auto-saves to VPS material folder)
                    </span>
                  </label>
                )}
                
                {logoUploadError && (
                  <div className="text-[10px] text-red-400 font-semibold mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {logoUploadError}
                  </div>
                )}
              </div>

              {/* Watermark Path backup field */}
              <div className="space-y-2 bg-slate-955/20 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Manual Path Entry</span>
                <input
                  type="text"
                  value={formData.watermark_path}
                  onChange={(e) => handleFieldChange("watermark_path", e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-700 transition-all outline-none font-mono"
                  placeholder="e.g. storage/local_videos/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Stepper Wizard Footer */}
          <div className="flex justify-between pt-6 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab("script")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-955/20 hover:bg-slate-955/40 border border-white/5 hover:border-white/10 transition-all active:scale-98 cursor-pointer"
            >
              ↵ Back to Script
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audio")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-98 cursor-pointer"
            >
              Proceed to Audio Settings ➔
            </button>
          </div>
        </div>
      )}

      {/* 3. Audio settings view */}
      {activeTab === "audio" && (
        <div className="glass-card rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Music className="h-5 w-5 text-blue-400" />
            <h2 className="text-md font-bold text-white">🔊 Audio & Voice Speaker</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">
                Voice Speaker Name {loadingVoices && "(loading...)"}
              </label>
              <select
                value={formData.voice_name}
                onChange={(e) => handleFieldChange("voice_name", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
                disabled={loadingVoices || voices.length === 0}
              >
                {voices.map((v) => (
                  <option key={v} value={v}>
                    {friendlyVoiceName(v)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Voice Speed Rate</label>
              <input
                type="number"
                step={0.1}
                min={0.5}
                max={2.0}
                value={formData.voice_rate}
                onChange={(e) => handleFieldChange("voice_rate", parseFloat(e.target.value) || 1.0)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Voice Volume</label>
              <input
                type="number"
                step={0.1}
                min={0.0}
                max={2.0}
                value={formData.voice_volume}
                onChange={(e) => handleFieldChange("voice_volume", parseFloat(e.target.value) || 1.0)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">BGM Mode</label>
              <select
                value={formData.bgm_type}
                onChange={(e) => handleFieldChange("bgm_type", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="none">No Background Music</option>
                <option value="random">Random from Library</option>
                <option value="custom">Select Specific File</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">BGM Volume</label>
              <input
                type="number"
                step={0.05}
                min={0.0}
                max={1.0}
                value={formData.bgm_volume}
                onChange={(e) => handleFieldChange("bgm_volume", parseFloat(e.target.value) || 0.1)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              />
            </div>

            {formData.bgm_type === "custom" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Choose Music File</label>
                <select
                  value={formData.bgm_file}
                  onChange={(e) => handleFieldChange("bgm_file", e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
                >
                  <option value="">Select track...</option>
                  {bgmFiles.map((music) => (
                    <option key={music.file} value={music.file}>
                      {music.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Stepper Wizard Footer */}
          <div className="flex justify-between pt-6 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-955/60 border border-white/5 hover:border-white/10 transition-all active:scale-98 cursor-pointer"
            >
              ↵ Back to Video Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subtitle")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-98 cursor-pointer"
            >
              Proceed to Subtitles ➔
            </button>
          </div>
        </div>
      )}

      {/* 4. Subtitle Settings view */}
      {activeTab === "subtitle" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Subtitle Form */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Type className="h-5 w-5 text-purple-400" />
              <h2 className="text-md font-bold text-white">🎨 Subtitle Settings & Presets</h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Caption Style Preset</label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="custom">Custom (Manual)</option>
                <option value="tiktok">TikTok Bold (Yellow/White Outline)</option>
                <option value="hormozi">Alex Hormozi (Bold Highlight Green)</option>
                <option value="minimalist">Minimalist Slate</option>
                <option value="karaoke">Classic Karaoke (Blue Slate)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Caption Style Format</label>
                <select
                  value={formData.caption_style}
                  onChange={(e) => handleFieldChange("caption_style", e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
                >
                  <option value="standard">Standard (Full Sentences)</option>
                  <option value="tiktok">TikTok Style (2-Word Bounce)</option>
                  <option value="hormozi">Hormozi Style (Word Highlights)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Font Family</label>
                <select
                  value={formData.font_name}
                  onChange={(e) => handleFieldChange("font_name", e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
                  disabled={loadingFonts}
                >
                  {fonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Font Size</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={formData.font_size}
                  onChange={(e) => handleFieldChange("font_size", parseInt(e.target.value) || 60)}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Subtitle Position</label>
                <select
                  value={formData.subtitle_position}
                  onChange={(e) => handleFieldChange("subtitle_position", e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
                >
                  <option value="bottom">Bottom (85%)</option>
                  <option value="center">Center (50%)</option>
                  <option value="top">Top (15%)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {formData.subtitle_position === "custom" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-slate-400">Custom Position (% from top)</label>
                  <span className="text-xs text-slate-300 font-bold">{formData.custom_position}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.custom_position}
                  onChange={(e) => handleFieldChange("custom_position", parseFloat(e.target.value) || 70)}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Font Color (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.text_fore_color}
                    onChange={(e) => handleFieldChange("text_fore_color", e.target.value)}
                    className="h-10 w-12 rounded-lg border border-white/10 bg-slate-950 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.text_fore_color}
                    onChange={(e) => handleFieldChange("text_fore_color", e.target.value)}
                    className="flex-1 glass-input px-3 rounded-lg text-sm text-white uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Stroke Color (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.stroke_color}
                    onChange={(e) => handleFieldChange("stroke_color", e.target.value)}
                    className="h-10 w-12 rounded-lg border border-white/10 bg-slate-950 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.stroke_color}
                    onChange={(e) => handleFieldChange("stroke_color", e.target.value)}
                    className="flex-1 glass-input px-3 rounded-lg text-sm text-white uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-slate-400">Stroke Width</label>
                  <span className="text-xs text-slate-300 font-bold">{formData.stroke_width}px</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={formData.stroke_width}
                  onChange={(e) => handleFieldChange("stroke_width", parseFloat(e.target.value) || 1.5)}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2 pt-6 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subtitle_background_enabled}
                    onChange={(e) => handleFieldChange("subtitle_background_enabled", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-300">Enable Subtitle Background</span>
                </label>

                {formData.subtitle_background_enabled && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rounded_subtitle_background}
                      onChange={(e) => handleFieldChange("rounded_subtitle_background", e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-300">Rounded Background Box</span>
                  </label>
                )}
              </div>
            </div>

            {formData.subtitle_background_enabled && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400">Subtitle Background Color (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.subtitle_background_color}
                    onChange={(e) => handleFieldChange("subtitle_background_color", e.target.value)}
                    className="h-10 w-12 rounded-lg border border-white/10 bg-slate-950 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.subtitle_background_color}
                    onChange={(e) => handleFieldChange("subtitle_background_color", e.target.value)}
                    className="flex-1 glass-input px-3 rounded-lg text-sm text-white uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtitle Live Preview Mockup */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest self-start">
              Live Preview Canvas
            </h3>

            {/* Phone Mock Frame */}
            <div className="relative w-64 h-[420px] rounded-3xl bg-slate-950 border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-center items-center select-none">
              {/* Camera Notch */}
              <div className="absolute top-2 w-20 h-4 bg-slate-800 rounded-full z-10" />

              {/* Video Simulated Background */}
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=640')" }}>
                {/* Overlay darken gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
              </div>

              {/* Live Preview Text Component */}
              <div
                className="absolute left-1/2 -translate-x-1/2 text-center w-[90%] pointer-events-none select-none transition-all duration-300"
                style={{
                  ...getPreviewPositionStyle(),
                  color: formData.text_fore_color,
                  fontSize: `${formData.font_size * 0.28}px`,
                  fontWeight: "bold",
                  fontFamily: formData.font_name.split(".")[0],
                  // Text Outline stroke
                  WebkitTextStroke: `${formData.stroke_width * 0.4}px ${formData.stroke_color}`,
                  // Background box style
                  backgroundColor: formData.subtitle_background_enabled ? formData.subtitle_background_color : "transparent",
                  borderRadius: formData.rounded_subtitle_background ? "6px" : "0px",
                  padding: formData.subtitle_background_enabled ? "4px 10px" : "0px"
                }}
              >
                {formData.video_language === "hi-IN" ? "यह एक लाइव सबटाइटल है" : "Live Subtitle Preview"}
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 font-semibold text-center mt-2 max-w-xs">
              Preview represents layout on a 9:16 aspect mobile player.
            </p>
          </div>

          {/* Stepper Wizard Footer */}
          <div className="lg:col-span-2 flex justify-between bg-slate-950/20 border border-white/5 p-4 rounded-2xl mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("audio")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-955/60 border border-white/5 hover:border-white/10 transition-all active:scale-98 cursor-pointer"
            >
              ↵ Back to Audio Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("compiler")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-98 cursor-pointer"
            >
              Proceed to Compiler ➔
            </button>
          </div>
        </div>
      )}

      {/* 5. Video Compiler view */}
      {activeTab === "compiler" && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Layers className="h-5 w-5 text-emerald-400" />
              <h2 className="text-md font-bold text-white">🎬 Video Compilation Summary</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-slate-400 font-semibold">Video Subject</span>
                <span className="text-white font-bold">{formData.video_subject || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-slate-400 font-semibold">Aspect Ratio</span>
                <span className="text-white font-bold">{formData.video_aspect === "9:16" ? "Portrait (9:16)" : formData.video_aspect === "16:9" ? "Landscape (16:9)" : "Square (1:1)"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-slate-400 font-semibold">Voice Speaker</span>
                <span className="text-white font-bold truncate max-w-[250px]">{friendlyVoiceName(formData.voice_name) || "Not selected"}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-slate-400 font-semibold">Script Length</span>
                <span className="text-white font-bold">{formData.video_script ? formData.video_script.length : 0} characters</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/5">
                <span className="text-slate-400 font-semibold">Background Music</span>
                <span className="text-white font-bold uppercase">{formData.bgm_type} {formData.bgm_type === "custom" && `(${formData.bgm_file})`}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-400 font-semibold">Caption Presets</span>
                <span className="text-white font-bold uppercase">{selectedPreset}</span>
              </div>
            </div>
          </div>

          {/* Stepper Wizard Footer & Trigger button */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setActiveTab("subtitle")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-955/60 border border-white/5 hover:border-white/10 transition-all active:scale-98 cursor-pointer"
            >
              ↵ Back to Subtitles
            </button>

            <button
              type="submit"
              disabled={loading || !formData.video_script}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl text-md font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-800 disabled:to-slate-800/80 transition-all shadow-lg shadow-emerald-500/25 disabled:shadow-none active:scale-98 cursor-pointer"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />}
              {loading ? "Initializing Render Task..." : "Compile & Render Video Now"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
