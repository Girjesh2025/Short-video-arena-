# VPS Connection & Session Configuration Reference

This file serves as a reference for future AI assistant sessions. It stores login credentials, repository paths, and a log of all modifications made during our June/July 2026 development.

---

## 🔑 VPS Credentials & Access Info

| Property | Value |
| :--- | :--- |
| **IP Address (Host)** | `222.167.207.161` |
| **Username** | `root` |
| **Password** | `Demo@123` |
| **WebUI Port** | `8501` |
| **Application Web URL** | `http://222.167.207.161:8501` |

---

## 📁 Project Directory Structure on VPS

*   **Project Root**: `/root/VideoArena`
*   **WebUI Entry Point**: `/root/VideoArena/webui/Main.py`
*   **Fonts Directory**: `/root/VideoArena/resource/fonts/`
*   **Task Output Directory**: `/root/VideoArena/storage/tasks/`
*   **API / Background Services**: `/root/VideoArena/app/services/`
    *   *Video Assembly*: `app/services/video.py`
    *   *Task Pipeline Manager*: `app/services/task.py`
    *   *Speech / TTS*: `app/services/voice.py`
    *   *Transcription / Subtitles*: `app/services/subtitle.py`

---

## ⚙️ PM2 Process Management on VPS

Both the backend API and frontend interfaces are managed by PM2.

*   `0`: `video-arena-api` (FastAPI backend)
*   `1`: `video-arena-nextui` (Next.js premium interface)
*   `2`: `video-arena-webui` (Streamlit interface)

### Useful PM2 Commands:
*   View status: `pm2 list`
*   Restart services: `pm2 restart all`
*   Monitor logs: `pm2 logs`

---

## 🛠️ Modifications Log (June/July 2026)

### 1. Caption Presets (Hormozi, TikTok, Minimalist, Karaoke)
*   Added pre-configured settings dropdown at the top of Subtitle Settings.
*   Added automatic manual override detection: switching sliders or colors switches the dropdown to `Custom (Manual)` immediately.
*   Stroke color and width selections are now persistent in config.

### 2. Hindi Subtitle Support (Devanagari Font Fix)
*   Downloaded a valid **`NotoSansDevanagari-Bold.ttf`** font (225KB) directly to the VPS fonts folder, replacing an empty 0-byte file.
*   Updated `Main.py` default font logic so that selecting `Hindi (India) 🇮🇳` voice language automatically selects `NotoSansDevanagari-Bold.ttf` as the default font.

### 3. Glassmorphic SaaS Dashboard UI
*   Upgraded WebUI CSS to a sleek dark SaaS style: translucent container cards, neon pink top-borders, left border accents on headers, and focused glowing input borders.
*   Turned standard radio list navigation into clickable item cards (dots hidden completely).
*   Capped vertical video height previews at `260px` in Saved Videos and set details column ratio to `[3, 1]` to prevent layout stretching.
*   Added 4-card **Metrics Dashboard Bar** at the top showing Model, Subtitle preset, total count of Saved Videos (read from disk), and Render Engine status.

### 4. Dynamic Word-by-Word Subtitles
*   Added word-by-word splitting and proportional timestamp interpolation in `video.py`.
*   **TikTok Style**: 2 words at a time with spring scale pop.
*   **Hormozi Style**: 1 word at a time, bouncing and cycling through white, green, and yellow highlights.
*   **Spring Bounce**: Implemented spring-up scaling using MoviePy v2 compatibility (`.resized()`).

### 5. Progressive Checklist Tracker
*   Replaced the basic Streamlit info status box with a glassmorphic checklist tracking each compile phase (Scripting, Voice, Whisper Subtitles, Downloads, Rendering) dynamically synced with task progress and ETA remaining.
