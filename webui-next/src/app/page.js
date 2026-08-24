"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import GeneratorForm from "@/components/GeneratorForm";
import TaskProgress from "@/components/TaskProgress";
import LibraryManager from "@/components/LibraryManager";
import VideoGallery from "@/components/VideoGallery";
import TextToAudio from "@/components/TextToAudio";
import SystemSettings from "@/components/SystemSettings";

export default function Home() {
  const [activeTab, setActiveTab] = useState("script");
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Metrics states
  const [modelName, setModelName] = useState("AI Model");
  const [captionStyle, setCaptionStyle] = useState("Standard");
  const [savedCount, setSavedCount] = useState(0);

  // Fetch metrics on tab change or mount
  useEffect(() => {
    fetchMetrics();
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      // 1. Fetch config to get active LLM model and subtitle preset
      const configRes = await axios.get("/api/v1/config");
      const config = configRes.data?.data;
      if (config) {
        const provider = config.app?.llm_provider || "openai";
        const model = config.app?.[`${provider}_model_name`] || "gpt-3.5-turbo";
        setModelName(model);
        
        const style = config.ui?.caption_style || "standard";
        const styleLabels = { standard: "Standard", tiktok: "TikTok Bounce", hormozi: "Hormozi Glow" };
        setCaptionStyle(styleLabels[style] || "Standard");
      }

      // 2. Fetch tasks count
      const tasksRes = await axios.get("/api/v1/tasks");
      const tasks = tasksRes.data?.data?.tasks || [];
      setSavedCount(tasks.length);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    }
  };

  const handleTaskCreated = (taskId) => {
    setCurrentTaskId(taskId);
  };

  const handleTaskComplete = (taskData) => {
    console.log("Task Completed!", taskData);
    fetchMetrics();
  };

  const handleResetTask = () => {
    setCurrentTaskId(null);
    fetchMetrics();
  };

  const isFormTab = ["script", "video", "audio", "subtitle", "compiler"].includes(activeTab);

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 font-sans">
      {/* Sidebar Panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 border-b border-white/5 bg-[#030712]/60 backdrop-blur-xl sticky top-0 z-40 flex flex-col gap-5">
          {/* Dashboard Title & Description */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                Control Dashboard <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2.5 py-0.5 rounded-full vertical-middle ml-2 select-none">Console v1.0</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Create, customize, and publish high-quality short videos.
              </p>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-1">
            {/* Card 1: AI Model Status */}
            <div className="relative overflow-hidden group bg-slate-950/45 border border-white/5 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 hover:-translate-y-0.5 select-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-lg text-pink-500 border border-pink-500/10 group-hover:scale-105 transition-all duration-300">
                  ⚡
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">AI Model Status</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 truncate max-w-[150px] group-hover:text-white transition-all">{modelName}</div>
                </div>
              </div>
            </div>

            {/* Card 2: Caption Style */}
            <div className="relative overflow-hidden group bg-slate-950/45 border border-white/5 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 select-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg text-amber-500 border border-amber-500/10 group-hover:scale-105 transition-all duration-300">
                  🎨
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Caption Style</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 group-hover:text-white transition-all">{captionStyle}</div>
                </div>
              </div>
            </div>

            {/* Card 3: Saved Videos */}
            <div className="relative overflow-hidden group bg-slate-950/45 border border-white/5 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 select-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-500 border border-blue-500/10 group-hover:scale-105 transition-all duration-300">
                  📁
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Saved Videos</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 group-hover:text-white transition-all">{savedCount} Videos</div>
                </div>
              </div>
            </div>

            {/* Card 4: Render Engine */}
            <div className="relative overflow-hidden group bg-slate-950/45 border border-white/5 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 select-none">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg text-emerald-500 border border-emerald-500/10 group-hover:scale-105 transition-all duration-300">
                  🎬
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Render Engine</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 group-hover:text-white transition-all">MoviePy v2 Active</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          {/* 1. If currently displaying a running compile task progress */}
          {currentTaskId ? (
            <TaskProgress
              taskId={currentTaskId}
              onTaskComplete={handleTaskComplete}
              onReset={handleResetTask}
            />
          ) : (
            /* 2. Otherwise render the active section */
            <>
              {isFormTab && (
                <GeneratorForm
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onTaskCreated={handleTaskCreated}
                />
              )}
              {activeTab === "text_to_audio" && <TextToAudio />}
              {activeTab === "saved" && <VideoGallery />}
              {activeTab === "system" && <SystemSettings />}
              {activeTab === "library" && <LibraryManager />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
