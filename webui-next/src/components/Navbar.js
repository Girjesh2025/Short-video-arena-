import { Sparkles, Video, FolderGit, HelpCircle } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "generator", label: "Video Generator", icon: Sparkles },
    { id: "saved", label: "Saved Videos", icon: Video },
    { id: "library", label: "BGM & Assets", icon: FolderGit },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-xl">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Video Arena
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Premium Video Studio
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white border border-white/10 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
