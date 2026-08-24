import { useState, useEffect } from "react";
import axios from "axios";
import { FolderGit, Upload, Play, Volume2, Film, Check, RefreshCw, Music } from "lucide-react";

export default function LibraryManager() {
  const [bgmFiles, setBgmFiles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [bgmLoading, setBgmLoading] = useState(false);
  const [matLoading, setMatLoading] = useState(false);

  // Uploading States
  const [uploadingBgm, setUploadingBgm] = useState(false);
  const [uploadingMat, setUploadingMat] = useState(false);

  useEffect(() => {
    fetchBgmList();
    fetchVideoMaterials();
  }, []);

  const fetchBgmList = async () => {
    setBgmLoading(true);
    try {
      const response = await axios.get("/musics");
      if (response.data && response.data.data) {
        setBgmFiles(response.data.data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBgmLoading(false);
    }
  };

  const fetchVideoMaterials = async () => {
    setMatLoading(true);
    try {
      const response = await axios.get("/video_materials");
      if (response.data && response.data.data) {
        setMaterials(response.data.data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatLoading(false);
    }
  };

  const handleBgmUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".mp3")) {
      alert("Only MP3 music files are supported!");
      return;
    }
    setUploadingBgm(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/musics", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchBgmList();
    } catch (err) {
      alert("Upload Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingBgm(false);
    }
  };

  const handleMaterialUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["mp4", "mov", "avi", "flv", "mkv", "jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      alert(`Only files with extensions ${allowed.join(", ")} are allowed!`);
      return;
    }
    setUploadingMat(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/video_materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchVideoMaterials();
    } catch (err) {
      alert("Upload Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingMat(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* 1. BGM Track Library */}
      <div className="glass-card rounded-2xl p-6 space-y-6 flex flex-col h-[70vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-indigo-400" />
            <h2 className="text-md font-bold text-white">Background Music Library</h2>
          </div>
          <button
            type="button"
            onClick={fetchBgmList}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${bgmLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Upload Zone */}
        <label className="relative flex flex-col items-center justify-center p-6 border border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl bg-white/[0.01] hover:bg-indigo-500/[0.02] transition-all cursor-pointer group">
          <input type="file" accept=".mp3" onChange={handleBgmUpload} className="hidden" />
          <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-300">
            {uploadingBgm ? "Uploading track..." : "Click to upload BGM (.mp3)"}
          </span>
        </label>

        {/* BGM Lists */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {bgmFiles.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No custom background music tracks found.</p>
          ) : (
            bgmFiles.map((track) => (
              <div
                key={track.file}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors max-w-xs truncate">
                      {track.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formatSize(track.size)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Video Materials Library */}
      <div className="glass-card rounded-2xl p-6 space-y-6 flex flex-col h-[70vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-indigo-400" />
            <h2 className="text-md font-bold text-white">Video Materials Library</h2>
          </div>
          <button
            type="button"
            onClick={fetchVideoMaterials}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${matLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Upload Zone */}
        <label className="relative flex flex-col items-center justify-center p-6 border border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl bg-white/[0.01] hover:bg-indigo-500/[0.02] transition-all cursor-pointer group">
          <input
            type="file"
            accept=".mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png"
            onChange={handleMaterialUpload}
            className="hidden"
          />
          <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-300">
            {uploadingMat ? "Uploading material..." : "Click to upload media (mp4/jpg/etc.)"}
          </span>
        </label>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {materials.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No custom video materials found.</p>
          ) : (
            materials.map((file) => (
              <div
                key={file.file}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors max-w-xs truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formatSize(file.size)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
