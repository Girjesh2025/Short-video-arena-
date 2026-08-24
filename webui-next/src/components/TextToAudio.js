import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Mic, Play, Download, AlertCircle, RefreshCw } from "lucide-react";

const VOICE_LANGS = [
  { label: "All Languages", filter: null },
  { label: "Hindi 🇮🇳", filter: ["hi-IN"] },
  { label: "English 🇺🇸", filter: ["en-US","en-GB","en-AU","en-IN"] },
  { label: "Chinese 🇨🇳", filter: ["zh-CN","zh-TW","zh-HK"] },
  { label: "Spanish 🇪🇸", filter: ["es-ES","es-MX"] },
  { label: "Japanese 🇯🇵", filter: ["ja-JP"] },
];

export default function TextToAudio() {
  const [text, setText] = useState("");
  const [provider, setProvider] = useState("azure-tts-v1");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [voiceLang, setVoiceLang] = useState("");

  const getFilteredVoices = () => {
    if (!voiceLang) return voices;
    const activeLangObj = VOICE_LANGS.find(l => l.label === voiceLang);
    if (!activeLangObj || !activeLangObj.filter) return voices;
    return voices.filter(v => activeLangObj.filter.some(prefix => v.includes(prefix)));
  };
  const filteredVoices = getFilteredVoices();

  useEffect(() => {
    if (filteredVoices.length > 0 && !filteredVoices.includes(selectedVoice)) {
      setSelectedVoice(filteredVoices[0]);
    }
  }, [voiceLang, voices, selectedVoice]);
  
  // Running task state
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");


  const providers = [
    { id: "azure-tts-v1", label: "Azure TTS V1" },
    { id: "azure-tts-v2", label: "Azure TTS V2" },
    { id: "siliconflow", label: "SiliconFlow TTS" },
    { id: "gemini-tts", label: "Gemini TTS" },
    { id: "mimo-tts", label: "Xiaomi MiMo TTS" },
    { id: "elevenlabs", label: "ElevenLabs" },
    { id: "chatterbox", label: "Chatterbox" }
  ];

  // Fetch voices when provider changes
  useEffect(() => {
    fetchVoices();
  }, [provider]);

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await axios.get("/api/v1/voices", {
        params: { provider }
      });
      const voiceList = response.data?.data?.voices || [];
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0]);
      } else {
        setSelectedVoice("");
      }
    } catch (err) {
      console.error("Failed to fetch voices", err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      alert("Please enter some text to synthesize!");
      return;
    }
    if (!selectedVoice) {
      alert("Please select a voice speaker!");
      return;
    }

    setSynthesizing(true);
    setAudioUrl(null);
    setErrorMsg("");
    setProgress(0);

    try {
      const payload = {
        video_script: text,
        voice_name: selectedVoice,
        voice_volume: volume,
        voice_rate: speed,
        bgm_type: "none",
        video_source: "local"
      };

      const response = await axios.post("/api/v1/audio", payload);
      const tid = response.data?.data?.task_id;
      if (tid) {
        setTaskId(tid);
        pollTask(tid);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
      setSynthesizing(false);
    }
  };

  const pollTask = (tid) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/v1/tasks/${tid}`);
        const task = response.data?.data;
        if (task) {
          setProgress(task.progress || 0);
          if (task.state === 1) { // 1 = TASK_STATE_COMPLETE
            // Success
            clearInterval(interval);
            setSynthesizing(false);
            // The backend does not automatically map audio_file to a URI in get_task, so we construct it.
            // Or if it did, we could use task.audio_file. For safety, we use the known path.
            setAudioUrl(`/tasks/${tid}/audio.mp3`);
          } else if (task.state === -1) { // -1 = TASK_STATE_FAILED
            // Failed
            clearInterval(interval);
            setSynthesizing(false);
            setErrorMsg(task.error || "Speech synthesis failed.");
          }
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 1000);
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
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <Mic className="h-5 w-5 text-indigo-400" />
          <h2 className="text-md font-bold text-white">Text to Audio Synth</h2>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Input Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Enter the text you want to convert to speech..."
            className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">TTS Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Voice Language</label>
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
            >
              {VOICE_LANGS.map(l => (
                <option key={l.label} value={l.label}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">
              Voice Speaker {loadingVoices && "(loading...)"}
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
              disabled={loadingVoices || filteredVoices.length === 0}
            >
              {filteredVoices.map((v) => (
                <option key={v} value={v}>
                  {friendlyVoiceName(v)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vol/Speed Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-semibold text-slate-400">Voice Volume</label>
              <span className="text-xs text-slate-300 font-bold">{volume}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-semibold text-slate-400">Voice Speed</label>
              <span className="text-xs text-slate-300 font-bold">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Synthesis Button */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={synthesizing || !text.trim()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800/80 transition-all shadow-md cursor-pointer"
          >
            {synthesizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            {synthesizing ? `Synthesizing (${progress}%)` : "Synthesize Speech"}
          </button>
        </div>
      </div>

      {/* Synthesis Result */}
      {audioUrl && (
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <div className="text-center space-y-1">
            <h4 className="font-bold text-white text-sm">Audio Synthesized Successfully!</h4>
            <p className="text-xs text-slate-400">Listen below or download the file.</p>
          </div>
          <audio src={audioUrl} controls className="w-full max-w-md outline-none" />
          <a
            href={audioUrl}
            download="synthesized_speech.mp3"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Audio File
          </a>
        </div>
      )}

      {errorMsg && (
        <div className="glass-card rounded-2xl p-6 flex items-start gap-3 border border-rose-500/10 bg-rose-500/5 text-rose-400 animate-in fade-in duration-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Synthesis Failed</h4>
            <p className="text-xs mt-1 text-rose-400/80">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
