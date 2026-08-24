import { useState, useEffect } from "react";
import axios from "axios";
import { Film, Trash2, Download, Search, RefreshCw, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function VideoGallery() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedScripts, setExpandedScripts] = useState({});

  useEffect(() => {
    fetchTasks();
  }, [searchQuery]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/tasks", {
        params: { search: searchQuery },
      });
      if (response.data && response.data.data) {
        setTasks(response.data.data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved videos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`/api/v1/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete video: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleScript = (taskId) => {
    setExpandedScripts((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or script..."
            className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs text-white"
          />
        </div>

        <button
          type="button"
          onClick={fetchTasks}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3 w-5 ${loading ? "animate-spin" : ""}`} />
          Reload Gallery
        </button>
      </div>

      {/* Videos List Grid */}
      {tasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
          <Film className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold">No saved videos found.</p>
          <p className="text-xs text-slate-600 mt-1">Go to the Generator tab to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task.task_id}
              className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all flex flex-col space-y-4"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-white text-md uppercase tracking-wide">
                    {task.subject || "No Subject"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.time)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(task.task_id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative w-full rounded-xl overflow-hidden bg-black/60 border border-white/5 flex justify-center items-center h-[260px]">
                <video
                  src={`/stream/${task.task_id}/final-1.mp4`}
                  controls
                  preload="metadata"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Collapsible Script Content */}
              <div className="space-y-2 flex-1">
                <button
                  type="button"
                  onClick={() => toggleScript(task.task_id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="h-3 w-3" />
                  <span>{expandedScripts[task.task_id] ? "Hide Script" : "Show Script"}</span>
                  {expandedScripts[task.task_id] ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>

                {expandedScripts[task.task_id] && (
                  <p className="text-xs text-slate-400 leading-relaxed bg-black/30 border border-white/5 rounded-xl p-3.5 max-h-36 overflow-y-auto font-medium">
                    {task.script || "No script details saved."}
                  </p>
                )}
              </div>

              {/* Download Trigger */}
              <a
                href={`/download/${task.task_id}/final-1.mp4`}
                download
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
              >
                <Download className="h-4 w-4" />
                Download MP4 Video
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
