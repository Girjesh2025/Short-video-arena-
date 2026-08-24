import { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Sliders, Type, Frame, Music, Play, AlertCircle, RefreshCw, Layers } from "lucide-react";

export default function GeneratorForm({ activeTab, onTaskCreated }) {
  const [loading, setLoading] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingTerms, setGeneratingTerms] = useState(false);
  const [bgmFiles, setBgmFiles] = useState([]);
  const [videoMaterials, setVideoMaterials] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState(false);

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
        <div className="glass-card rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Sparkles className="h-5 w-5 text-pink-400" />
            <h2 className="text-md font-bold text-white">✍️ Script & Visual Strategy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Video Subject</label>
              <input
                type="text"
                value={formData.video_subject}
                onChange={(e) => handleFieldChange("video_subject", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
                placeholder="e.g. History of Bitcoin"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Language</label>
              <select
                value={formData.video_language}
                onChange={(e) => handleFieldChange("video_language", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="en-US">English 🇺🇸 (en-US)</option>
                <option value="hi-IN">Hindi 🇮🇳 (hi-IN)</option>
                <option value="zh-CN">Chinese 🇨🇳 (zh-CN)</option>
                <option value="ru-RU">Russian ru (ru-RU)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Script Writing Prompt</label>
            <textarea
              value={formData.video_script_prompt}
              onChange={(e) => handleFieldChange("video_script_prompt", e.target.value)}
              rows={2}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              placeholder="Outline your script requirements..."
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Paragraphs count:</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.paragraph_number}
                onChange={(e) => handleFieldChange("paragraph_number", parseInt(e.target.value) || 1)}
                className="w-16 glass-input px-3 py-1.5 rounded-lg text-sm text-center text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateScript}
              disabled={generatingScript || !formData.video_subject}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/35 transition-all shadow-md cursor-pointer"
            >
              {generatingScript ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generatingScript ? "Writing Script..." : "AI Generate Script"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Video Narration Script</label>
            <textarea
              value={formData.video_script}
              onChange={(e) => handleFieldChange("video_script", e.target.value)}
              rows={5}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              placeholder="Narration script text lines..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">Search Keywords (CSV)</label>
                <button
                  type="button"
                  onClick={handleGenerateTerms}
                  disabled={generatingTerms || !formData.video_script}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {generatingTerms ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Auto Keywords
                </button>
              </div>
              <input
                type="text"
                value={formData.video_terms}
                onChange={(e) => handleFieldChange("video_terms", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
                placeholder="e.g. coffee shop, espresso, cozy table"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="match_materials_to_script"
                checked={formData.match_materials_to_script}
                onChange={(e) => handleFieldChange("match_materials_to_script", e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="match_materials_to_script" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Match materials sequence to script chronological order
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. Video Settings view */}
      {activeTab === "video" && (
        <div className="glass-card rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Frame className="h-5 w-5 text-amber-400" />
            <h2 className="text-md font-bold text-white">🎞️ Video Format & Layout</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Video Source</label>
              <select
                value={formData.video_source}
                onChange={(e) => handleFieldChange("video_source", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="pexels">Pexels (Free Stock)</option>
                <option value="pixabay">Pixabay (Free Stock)</option>
                <option value="coverr">Coverr (Free Stock)</option>
                <option value="g-veo">Google Veo (AI Video)</option>
                <option value="local">Local Files Folder</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Aspect Ratio</label>
              <select
                value={formData.video_aspect}
                onChange={(e) => handleFieldChange("video_aspect", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="9:16">Portrait (9:16) - TikTok/Reels</option>
                <option value="16:9">Landscape (16:9) - YouTube</option>
                <option value="1:1">Square (1:1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Max Clip Duration (sec)</label>
              <input
                type="number"
                min={2}
                max={15}
                value={formData.video_clip_duration}
                onChange={(e) => handleFieldChange("video_clip_duration", parseInt(e.target.value) || 5)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Video Border Width</label>
              <select
                value={formData.border_width}
                onChange={(e) => handleFieldChange("border_width", parseInt(e.target.value) || 0)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
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
              <label className="text-xs font-semibold text-slate-400">Border Frame Color</label>
              <select
                value={formData.border_color}
                onChange={(e) => handleFieldChange("border_color", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Logo/Watermark Path (Optional)</label>
              <input
                type="text"
                value={formData.watermark_path}
                onChange={(e) => handleFieldChange("watermark_path", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
                placeholder="e.g. storage/local_videos/logo.png"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Clips Transition Style</label>
              <select
                value={formData.video_transition_mode}
                onChange={(e) => handleFieldChange("video_transition_mode", e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              >
                <option value="none">None (Cut)</option>
                <option value="shuffle">Shuffle Modes</option>
                <option value="fade-in">Fade In</option>
                <option value="fade-out">Fade Out</option>
                <option value="slide-in">Slide In</option>
              </select>
            </div>
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

          {/* Trigger button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.video_script}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl text-md font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-800 disabled:to-slate-800/80 transition-all shadow-lg shadow-emerald-500/25 disabled:shadow-none cursor-pointer"
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
