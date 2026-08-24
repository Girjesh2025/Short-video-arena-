import { Sparkles, Sliders, Volume2, Type, Cpu, Mic, Video, Settings, FolderGit } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "script", label: "Script & Topic", icon: Sparkles, color: "text-pink-400" },
    { id: "video", label: "Video Settings", icon: Sliders, color: "text-amber-400" },
    { id: "audio", label: "Audio Settings", icon: Volume2, color: "text-blue-400" },
    { id: "subtitle", label: "Subtitle Settings", icon: Type, color: "text-purple-400" },
    { id: "compiler", label: "Video Compiler", icon: Cpu, color: "text-emerald-400" },
    { id: "text_to_audio", label: "Text to Audio", icon: Mic, color: "text-cyan-400" },
    { id: "saved", label: "Saved Videos", icon: Video, color: "text-indigo-400" },
    { id: "system", label: "System Settings", icon: Settings, color: "text-slate-400" },
    { id: "library", label: "Assets Library", icon: FolderGit, color: "text-orange-400" },
  ];

  return (
    <aside className="w-64 bg-[#030712]/60 border-r border-white/5 p-6 flex flex-col gap-6 backdrop-blur-xl h-screen sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <span className="text-white font-extrabold text-xl">V</span>
        </div>
        <div>
          <h2 className="text-md font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Video Arena 🦊
          </h2>
          <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">
            Premium Video Studio
          </p>
        </div>
      </div>

      <hr className="border-white/5 my-2" />

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                isActive
                  ? "bg-gradient-to-r from-pink-500/10 to-amber-500/5 border-pink-500/25 border-l-4 border-l-pink-500 text-white shadow-lg shadow-pink-500/5 font-extrabold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border-transparent hover:translate-x-1"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? item.color : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Block */}
      <div className="mt-auto p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          System Status
        </div>
        <div className="flex flex-col gap-1.5 text-xs font-medium">
          <div className="flex justify-between items-center text-slate-400">
            <span>🟢 API Gateway</span>
            <span className="text-emerald-400 font-semibold">Online</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>⚡ Render Engine</span>
            <span className="text-indigo-400 font-semibold">Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
