import { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Save, Loader2, Key, Sliders, Shield } from "lucide-react";

export default function SystemSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const llmProviders = [
    { id: "openai", label: "OpenAI" },
    { id: "aihubmix", label: "AIHubMix (Recommended)" },
    { id: "aimlapi", label: "AIML API" },
    { id: "evolink", label: "EvoLink" },
    { id: "moonshot", label: "Moonshot" },
    { id: "azure", label: "Azure" },
    { id: "qwen", label: "Qwen" },
    { id: "deepseek", label: "DeepSeek" },
    { id: "modelscope", label: "ModelScope" },
    { id: "gemini", label: "Gemini" },
    { id: "grok", label: "Grok" },
    { id: "groq", label: "Groq" },
    { id: "ollama", label: "Ollama" },
    { id: "litellm", label: "LiteLLM" }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/config");
      setConfig(response.data?.data || {});
    } catch (err) {
      console.error("Failed to load config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await axios.post("/api/v1/config", config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save configuration: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAppFieldChange = (name, value) => {
    setConfig((prev) => ({
      ...prev,
      app: { ...prev.app, [name]: value }
    }));
  };

  const handleUiFieldChange = (name, value) => {
    setConfig((prev) => ({
      ...prev,
      ui: { ...prev.ui, [name]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading system configuration...</span>
      </div>
    );
  }

  const currentProvider = config.app?.llm_provider || "openai";
  const apiKeyKey = `${currentProvider}_api_key`;
  const baseUrlKey = `${currentProvider}_base_url`;
  const modelNameKey = `${currentProvider}_model_name`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
      {/* 1. LLM Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <Sliders className="h-5 w-5 text-indigo-400" />
          <h2 className="text-md font-bold text-white">Large Language Model (LLM) Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">LLM Provider</label>
            <select
              value={currentProvider}
              onChange={(e) => handleAppFieldChange("llm_provider", e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white bg-slate-900"
            >
              {llmProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Model Name</label>
            <input
              type="text"
              value={config.app?.[modelNameKey] || ""}
              onChange={(e) => handleAppFieldChange(modelNameKey, e.target.value)}
              placeholder="e.g. gpt-4o-mini"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">API Key</label>
            <input
              type="password"
              value={config.app?.[apiKeyKey] || ""}
              onChange={(e) => handleAppFieldChange(apiKeyKey, e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Base URL (Optional)</label>
            <input
              type="text"
              value={config.app?.[baseUrlKey] || ""}
              onChange={(e) => handleAppFieldChange(baseUrlKey, e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Media API keys */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <Key className="h-5 w-5 text-indigo-400" />
          <h2 className="text-md font-bold text-white">Media API Credentials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Pexels Stock Key</label>
            <input
              type="password"
              value={config.app?.pexels_api_keys || ""}
              onChange={(e) => handleAppFieldChange("pexels_api_keys", e.target.value)}
              placeholder="Pexels authorization token..."
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Pixabay Stock Key</label>
            <input
              type="password"
              value={config.app?.pixabay_api_keys || ""}
              onChange={(e) => handleAppFieldChange("pixabay_api_keys", e.target.value)}
              placeholder="Pixabay API key..."
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Coverr Stock Key</label>
            <input
              type="password"
              value={config.app?.coverr_api_keys || ""}
              onChange={(e) => handleAppFieldChange("coverr_api_keys", e.target.value)}
              placeholder="Coverr API token..."
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Gemini API Key</label>
            <input
              type="password"
              value={config.app?.gemini_api_key || ""}
              onChange={(e) => handleAppFieldChange("gemini_api_key", e.target.value)}
              placeholder="Gemini API auth key..."
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Basic System Preferences */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h2 className="text-md font-bold text-white">System Dashboard Preferences</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.app?.hide_config || false}
              onChange={(e) => handleAppFieldChange("hide_config", e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-300">Hide Basic Settings in Panels</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.ui?.hide_log || false}
              onChange={(e) => handleUiFieldChange("hide_log", e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-300">Hide Render Process Output Logs</span>
          </label>
        </div>
      </div>

      {/* Trigger Actions */}
      <div className="flex justify-between items-center pt-4">
        {saveSuccess ? (
          <span className="text-xs font-bold text-emerald-400 animate-pulse">
            ✓ Settings Saved Successfully!
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800/80 transition-all shadow-md cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving Configuration..." : "Save System Settings"}
        </button>
      </div>
    </div>
  );
}
