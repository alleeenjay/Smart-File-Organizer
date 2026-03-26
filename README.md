diff --git a/README.md b/README.md
index aa30115930d00392ae204265dfb51d35de690d58..afa5e559a7bb13bd2914d3f9031f65bd5c5ebe4b 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,194 @@
-# Smart-File-Organizer
-An app that helps users manage, organize, search, preview, tag, and clean up files on their computer in a simple and modern interface.
+# Smart File Organizer
+
+Smart File Organizer is a desktop-first file management app built with **Electron + React + TypeScript**. It scans local folders, indexes file metadata, supports everyday file operations, and provides cleanup/organization workflows like duplicate detection, large-file discovery, empty-folder detection, and rule-based auto-organization.
+
+---
+
+## 1) Stack Choice and Why
+
+### Chosen stack
+- **Electron** (desktop shell + secure native capabilities)
+- **React + TypeScript** (maintainable UI and type-safe state/logic)
+- **Vite** (fast DX for renderer)
+- **Zustand** (lightweight state management)
+
+### Why this is practical
+- Works very well on **Windows** today.
+- Same Electron architecture can be packaged for **macOS/Linux** with minimal code changes.
+- Secure IPC model isolates file-system access in the main process.
+- Minimal dependency surface to keep maintenance low.
+
+---
+
+## 2) Architecture Overview
+
+### Process boundaries
+- **Main process (`electron/`)**
+  - Owns all direct file-system access.
+  - Performs scan/index/duplicate detection and file operations.
+  - Persists local metadata + settings in app data.
+- **Preload (`electron/preload.ts`)**
+  - Exposes a small, controlled API via `contextBridge`.
+- **Renderer (`src/`)**
+  - UI only (dashboard, file browser, preview, filters, auto-organize).
+  - Calls secure APIs exposed by preload.
+
+### Security model
+- `contextIsolation: true`
+- `nodeIntegration: false`
+- `sandbox: true`
+- Renderer cannot directly access Node APIs.
+
+### Data stored locally
+- `settings.json` (scan roots, theme, default view)
+- `metadata.json` (tags + favorite flags per file path)
+
+---
+
+## 3) Project Structure
+
+```text
+Smart-File-Organizer/
+├─ electron/
+│  ├─ main.ts            # Electron entry + BrowserWindow setup
+│  ├─ preload.ts         # Secure bridge API
+│  ├─ ipc.ts             # IPC handlers
+│  ├─ fileService.ts     # Scanning, duplicate detection, file ops, auto-organize
+│  ├─ store.ts           # Local settings/metadata persistence
+│  └─ types.ts           # Shared main-process types
+├─ src/
+│  ├─ components/
+│  │  ├─ Sidebar.tsx
+│  │  ├─ Dashboard.tsx
+│  │  ├─ FileToolbar.tsx
+│  │  ├─ FileList.tsx
+│  │  ├─ BulkActions.tsx
+│  │  ├─ PreviewPanel.tsx
+│  │  └─ AutoOrganizePanel.tsx
+│  ├─ styles/app.css
+│  ├─ store.ts           # Global app state + filtering/sorting selectors
+│  ├─ types.ts
+│  ├─ App.tsx
+│  └─ main.tsx
+├─ package.json
+├─ tsconfig.json
+├─ tsconfig.electron.json
+└─ vite.config.ts
+```
+
+---
+
+## 4) Features Implemented (MVP + Advanced)
+
+### Core browsing and metadata
+- Folder picker + recursive scan.
+- Displays: name, path, type, size, created date, modified date, tags, favorite status.
+- Sidebar navigation (Dashboard / Files / Auto-Organize).
+- Table and grid views.
+
+### File operations
+- Create folder
+- Rename file/folder
+- Move
+- Copy
+- Delete
+- Bulk select + bulk operations
+
+### Organization and cleanup
+- Smart category detection by file type
+- Custom tags
+- Favorites
+- Recent files (dashboard)
+- Duplicate detection (size + content sample hash)
+- Empty folder detection (scan output)
+- Large file finder (top large files)
+
+### Search/filter/sort
+- Search by filename
+- Filters by type, tag, folder, size range (available in state and UI core)
+- Sort by name, size, type, modified date
+
+### Preview support
+- Image preview (`img`)
+- PDF basic preview (`iframe`)
+- Text/code preview (`readFile` excerpt)
+- Audio/video preview (`audio` / `video`)
+
+### Auto-Organize + undo
+- Rule modes: by type, extension, month, year
+- Preview move plan before apply
+- Apply plan
+- Undo latest auto-organize operation
+
+### Dashboard
+- Total file count
+- Total storage
+- File type breakdown
+- Duplicate groups count
+- Large files count
+- Recent activity
+
+---
+
+## 5) Robust Error Handling
+
+- Scan gracefully skips inaccessible files/folders.
+- Operation errors are captured and surfaced in UI.
+- Handles permission-denied/locked paths as failed operations without crashing app.
+- JSON store parsing failures fallback safely to defaults.
+
+---
+
+## 6) Run, Build, and Setup
+
+## Prerequisites
+- Node.js 20+
+- npm 10+
+
+## Install
+```bash
+npm install
+```
+
+## Run in development
+```bash
+npm run dev
+```
+
+## Build
+```bash
+npm run build
+```
+
+## Preview renderer only
+```bash
+npm run preview
+```
+
+---
+
+## 7) Implementation Notes and Phasing
+
+This repo is implemented in a runnable MVP-first way, then extended with:
+1. scan + list + operations,
+2. tagging/favorites + dashboard,
+3. preview panel,
+4. auto-organize preview/apply/undo,
+5. cleanup analytics (duplicates/large/empty).
+
+Potential next improvements:
+- richer duplicate hash strategy for very large files,
+- saved filter presets,
+- virtualized tables for very large directories,
+- optional thumbnail caching,
+- packaging with electron-builder.
+
+---
+
+## 8) UI Notes / Screenshot Description
+
+If screenshots are not generated in your environment, expected UI layout:
+- Left sidebar with app title, “Choose Folders”, and navigation.
+- Files page includes search/filter/sort toolbar, bulk action row, file table or grid, and preview/details panel on the right.
+- Auto-Organize page shows rule controls and a move-plan preview list before apply.
+- Dashboard shows summary cards and recent activity list.
