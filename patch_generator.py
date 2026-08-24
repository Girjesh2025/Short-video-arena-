import re

path = "/root/MoneyPrinterTurbo2026/webui-next/src/components/GeneratorForm.js"
with open(path, "r") as f:
    content = f.read()

# 1. Add TTS_SERVERS constant and previewAudio state
tts_consts = """
const TTS_SERVERS = [
  { id: "azure-tts-v1", icon: "🔵", name: "Azure TTS V1", desc: "Neural voices" },
  { id: "openai-tts", icon: "🟢", name: "OpenAI TTS", desc: "GPT voices" },
  { id: "gemini-tts", icon: "✨", name: "Gemini TTS", desc: "Google AI voices" },
  { id: "elevenlabs", icon: "⚡", name: "ElevenLabs", desc: "Ultra-realistic" },
  { id: "chatterbox", icon: "🎤", name: "Chatterbox", desc: "Local TTS" },
];
"""
if "TTS_SERVERS" not in content:
    content = content.replace("export default function GeneratorForm", tts_consts + "\nexport default function GeneratorForm")

# 2. Add formData.tts_server
if "tts_server:" not in content:
    content = content.replace('voice_name: "en-US-AvaMultilingualNeural-Female",', 'tts_server: "azure-tts-v1",\n    voice_name: "en-US-AvaMultilingualNeural-Female",')

# 3. Fix fetchVoices
fetch_voices_old = """      const configRes = await axios.get("/api/v1/config");
      const provider = configRes.data?.data?.app?.llm_provider || "azure-tts-v1";
      
      const response = await axios.get("/api/v1/voices", {
        params: { 
          provider: provider.includes("azure") ? provider : "azure-tts-v1",
          language: formData.video_language.split("-")[0] // e.g. en, hi, zh
        }
      });"""
fetch_voices_new = """      const response = await axios.get("/api/v1/voices", {
        params: { 
          provider: formData.tts_server,
          language: formData.video_language.split("-")[0] // e.g. en, hi, zh
        }
      });"""
content = content.replace(fetch_voices_old, fetch_voices_new)

# 4. Add dependencies to useEffect
content = content.replace("}, [formData.video_language]);", "}, [formData.video_language, formData.tts_server]);")

# 5. Add preview state
if "const [previewAudio, setPreviewAudio]" not in content:
    content = content.replace("const [loadingFonts, setLoadingFonts] = useState(false);", "const [loadingFonts, setLoadingFonts] = useState(false);\n  const [previewAudio, setPreviewAudio] = useState(null);\n  const [previewLoading, setPreviewLoading] = useState(false);")

# 6. Add handlePreviewVoice function
preview_func = """
  const handlePreviewVoice = async (e) => {
    e.preventDefault();
    setPreviewLoading(true);
    setPreviewAudio(null);
    try {
      const res = await fetch("/api/v1/preview_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_script: formData.video_script || "This is a voice preview. Testing audio output quality.",
          voice_name: formData.voice_name,
          voice_rate: formData.voice_rate,
          voice_volume: formData.voice_volume,
          bgm_type: "none",
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewAudio(url);
      } else {
        alert("Preview generated error.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
    setPreviewLoading(false);
  };
"""
if "handlePreviewVoice" not in content:
    content = content.replace("  const handlePresetChange = ", preview_func + "\n  const handlePresetChange = ")

# 7. Replace the Audio tab UI
audio_ui_old = """          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>"""

audio_ui_new = """
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">TTS Server</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TTS_SERVERS.map(srv => (
                <div
                  key={srv.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${formData.tts_server === srv.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-slate-900 hover:border-white/30'}`}
                  onClick={() => handleFieldChange("tts_server", srv.id)}
                >
                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-2xl">{srv.icon}</span>
                    <span className="text-xs font-bold text-white">{srv.name}</span>
                  </div>
                </div>
              ))}
            </div>
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

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePreviewVoice}
              disabled={previewLoading || !formData.voice_name}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/35 transition-all shadow-md flex items-center gap-2"
            >
              {previewLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {previewLoading ? "Synthesizing..." : "Preview Voice"}
            </button>
            {previewAudio && (
              <audio src={previewAudio} autoPlay controls className="h-10 outline-none" />
            )}
          </div>
"""
content = content.replace(audio_ui_old, audio_ui_new)

with open(path, "w") as f:
    f.write(content)

print("GeneratorForm patched successfully.")
