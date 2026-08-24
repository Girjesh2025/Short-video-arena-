import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default function TaskProgress({ taskId, onTaskComplete, onReset }) {
  const [progress, setProgress] = useState(0);
  const [stateCode, setStateCode] = useState(1); // 1 = pending, 2 = processing, 3 = complete, 4 = failed
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    { name: "Initializing task parameters...", minProgress: 0, maxProgress: 5 },
    { name: "Generating video script using LLM...", minProgress: 6, maxProgress: 10 },
    { name: "Generating chronological search terms...", minProgress: 11, maxProgress: 20 },
    { name: "Generating voice audio narration (TTS)...", minProgress: 21, maxProgress: 30 },
    { name: "Generating and aligning subtitles...", minProgress: 31, maxProgress: 40 },
    { name: "Downloading high-quality video materials from Pexels...", minProgress: 41, maxProgress: 50 },
    { name: "Combining video clips, syncing audio and rendering final MP4...", minProgress: 51, maxProgress: 99 },
  ];

  // Tick the elapsed timer
  useEffect(() => {
    let timer;
    if (stateCode <= 2) {
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stateCode]);

  // Poll the task status every 1 second
  useEffect(() => {
    if (!taskId) return;

    let active = true;
    const checkStatus = async () => {
      try {
        const response = await axios.get(`/api/v1/tasks/${taskId}`);
        if (!active) return;

        const task = response.data?.data;
        if (task) {
          setProgress(task.progress || 0);
          setStateCode(task.state || 2);

          if (task.state === 3) {
            // Success
            clearInterval(polling);
            onTaskComplete(task);
          } else if (task.state === 4) {
            // Failed
            clearInterval(polling);
            setErrorMsg(task.error || "Generation encountered an unknown error.");
          }
        }
      } catch (err) {
        console.error("Task query failed", err);
      }
    };

    // Trigger initial check
    checkStatus();

    const polling = setInterval(checkStatus, 1000);

    return () => {
      active = false;
      clearInterval(polling);
    };
  }, [taskId]);

  const getStepStatus = (step) => {
    if (stateCode === 4) return "failed";
    if (progress >= step.maxProgress) return "completed";
    if (progress >= step.minProgress && progress < step.maxProgress) return "active";
    return "pending";
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Estimate remaining time
  const getEta = () => {
    if (progress < 5) return "Calculating...";
    const estimatedTotal = (elapsed * 100) / progress;
    const remaining = Math.max(0, Math.round(estimatedTotal - elapsed));
    return formatTime(remaining);
  };

  return (
    <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Video Generation Process</h3>
          <p className="text-xs text-slate-400 mt-1">Task ID: {taskId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-400">
            Elapsed: <span className="text-slate-200 font-bold">{formatTime(elapsed)}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-semibold text-slate-400">Overall Progress</span>
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {progress}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {stateCode <= 2 && (
          <p className="text-[10px] text-slate-500 text-right">
            Estimated Remaining: <span className="text-slate-400 font-semibold">{getEta()}</span>
          </p>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-4 pt-2">
        {steps.map((step, idx) => {
          const status = getStepStatus(step);
          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                status === "completed"
                  ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                  : status === "active"
                  ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-500/5"
                  : status === "failed"
                  ? "bg-rose-500/5 border-rose-500/10 text-rose-400"
                  : "bg-transparent border-transparent text-slate-500"
              }`}
            >
              <div className="pt-0.5">
                {status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {status === "active" && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
                {status === "failed" && <XCircle className="h-4 w-4 text-rose-500" />}
                {status === "pending" && (
                  <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium">{step.name}</div>
            </div>
          );
        })}
      </div>

      {/* Completion or Error Banners */}
      {stateCode === 3 && (
        <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-white text-md">Rendering Completed!</h4>
            <p className="text-xs text-slate-400 mt-1">Your video is ready and saved in your library.</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer"
          >
            Create Another Video
          </button>
        </div>
      )}

      {stateCode === 4 && (
        <div className="flex flex-col items-center justify-center p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-white text-md">Generation Failed</h4>
            <p className="text-xs text-rose-400/80 mt-1 max-w-sm mx-auto">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
          >
            Go Back & Retry
          </button>
        </div>
      )}
    </div>
  );
}
