# 🧠 VideoArena Project Brain & Context Reference

This file serves as a memory buffer and technical status board for the **VideoArena** workspace. It captures all architectural updates, current features, state persistence, VPS configurations, and recent bug fixes so that any future AI assistant session can immediately resume work with full context.

---

## 🔑 Active VPS Configuration
*   **Active IP Address**: `222.167.207.161`
*   **SSH Access**: `ssh root@222.167.207.161` (Password: `Demo@123`)
*   **Port Mapping**:
    *   `3000`: Premium NextUI App (`http://222.167.207.161:3000`)
    *   `8501`: Streamlit legacy/internal webui (`http://222.167.207.161:8501`)
    *   `8000`: FastAPI Backend Engine API

---

## 📁 Repository Directories (VPS)
*   **Project Root**: `/root/VideoArena`
*   **FastAPI Backend Service**: `/root/VideoArena/app`
*   **Next.js Frontend (NextUI)**: `/root/VideoArena/webui-next`
*   **Streamlit UI**: `/root/VideoArena/webui`

---

## ⚙️ PM2 Processes on VPS
Three background processes manage the services:
1.  **`video-arena-api`** (FastAPI backend server)
2.  **`video-arena-nextui`** (Next.js client interface)
3.  **`video-arena-webui`** (Streamlit sidebar workspace)

*Quick commands:*
*   Check processes: `pm2 list`
*   Restart NextUI build: `pm2 restart video-arena-nextui`
*   Monitor server logs: `pm2 logs`

---

## 🛠️ Key Feature Enhancements & Modifications

### 1. Codebase Rebranding (`VideoArena`)
*   Rebranded the entire backend codebase and repo configuration from `MoneyPrinterTurbo2026` to `VideoArena`.

### 2. Expanded Video & Model Sources
*   Integrated **Google Veo** and **Google Flux** support inside the video generation modules to allow next-generation video source options.

### 3. Metric Info Cards in Saved Videos
*   Added a beautiful premium dashboard header inside the **Saved Videos** menu containing statistical analytics cards:
    *   *Total Videos Count*
    *   *Total Duration (Estimated)*
    *   *Disk Space Utilized*
    *   *Active API Statuses*

### 4. Router & Tab Persistence Fix
*   Fixed the refresh redirect issue: The application now tracks the user's active sidebar tab inside browser `localStorage`.
*   Hard-refreshing the page retains the exact active section/menu (e.g., staying on "Saved Videos" or "Social Accounts") instead of redirecting the user back to the Home/Generator page.

### 5. Social Media Accounts Connection (`Social Accounts`)
*   Created a modern, high-end integration section for connecting third-party platforms.
*   Supports toggle configurations for **YouTube Shorts**, **Instagram Reels**, **Facebook Reels**, and **TikTok Feed**.
*   Users can manage Client IDs, API Keys, and Developer Credentials, as well as toggle global upload status and auto-upload triggers.
*   **Bug Fix (Critical React Crash Resolved)**: Fixed a runtime component crash where Lucide brand icons (ForwardRef objects) were rendered directly as children. Defined standard React wrapper elements (e.g. `TikTokLogo`) and standardized rendering using `<Logo className="..." />`.

---

## 💡 Instructions for Future AI Assistant Sessions
1.  **Always refer to this file (`brain.md`)** alongside [vps_credentials.md](file:///Users/girjesh/Desktop/cloudonfire/vps_credentials.md) before making structural edits.
2.  All frontend builds must be compiled on the VPS:
    ```bash
    cd /root/VideoArena/webui-next && npm run build && pm2 restart video-arena-nextui
    ```
3.  Always ensure custom JSX tags and Lucide Icon objects inside map-rendering loops are correctly evaluated as React components to avoid client-side error boundaries.
