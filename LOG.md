# Project Log

## [2026-03-23]
- Initialized the collaborative-notes-app project structure.
- Created `frontend/`, `backend/`, and `yjs-server/` directories.
- Frontend Bug Fixes:
    - Renamed `frontend/styles/global.css` to `frontend/styles/globals.css` to match layout imports.
    - Updated `next.config.js` and `tailwind.config.js` to CommonJS (`module.exports`) to prevent ESM errors.
    - Implemented the missing `frontend/app/editor/page.tsx` for real-time note editing.
    - Cleaned up obsolete `experimental: { appDir: true }` from `next.config.js`.
- Created boilerplate/placeholder files for Next.js, FastAPI, and Yjs server.
- Created `.github/workflows` for CI/CD.
- Created `README.md`.
- Completed `.env.local` and `backend/.env` setups.
- Resolved all lint errors in the frontend.

## [2026-03-24]
- Fixed `npm start` error in `yjs-server`.
- Resolved `ERR_PACKAGE_PATH_NOT_EXPORTED` by removing invalid require of `y-websocket/bin/server`.
- Removed unused and broken `Encoder`/`Decoder` references in `server.js`.
- Fixed Backend initialization bugs (Firebase credentials and FastAPI imports).

## [2026-03-24] - 2
- Created root `.gitignore` file to protect `.env` files and `firebase-key.json`.
- Terminated all active server processes (Frontend, Backend, and Yjs-server) as requested.


## [2026-03-24] - 3
- **UI Modernization (Glassmorphism)**:
    - Implemented a premium "iDraft" inspired design system in `globals.css` using radial gradients and glassmorphism tokens.
    - Redesigned **Dashboard**, **Login**, and **Editor** pages for high-end aesthetics.
    - Standardized typography using the `Inter` variable font.
- **Frontend Bug Fixes**:
    - Fixed `next/google` font resolve error in `layout.tsx`.
    - Relocated `globals.css` to `app/styles/` to fix Next.js 14 build pathing issues.
    - Added missing `postcss.config.js` to enable Tailwind CSS processing.
    - Deferred API and WebSocket initialization until authentication state is resolved to prevent 403 errors.
- **Backend Stability**:
    - Fixed startup crash on Windows caused by emoji characters in print statements (`UnicodeEncodeError`).
    - Enhanced logging in the notes router for better debugging.
    - Optimized Firebase initialization singleton.

## [2026-03-24] - Phase 2
- **Phase 2.1 — Yjs Integration**:
    - Installed `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`, `y-websocket`.
    - Rewrote `Editor.tsx` to use real `Y.Doc` and `WebsocketProvider` connecting to the Yjs server on `ws://localhost:1234`.
    - TipTap now uses the `Collaboration` extension for CRDT-based conflict-free editing (history disabled in favour of Yjs undo manager).
- **Phase 2.2 — Presence Awareness**:
    - Added `CollaborationCursor` extension binding each user's Firebase display name and a deterministic color to their cursor.
    - Created `components/PresenceAvatars.tsx` showing live collaborator avatars in the editor toolbar from Yjs awareness state.
    - Added collaboration cursor CSS (`.collaboration-cursor__caret`, `.collaboration-cursor__label`) to `globals.css`.
- **Bug Fixes**:
    - Fixed 500 Internal Server Error in `api/v1/notes` by correcting the Firestore query operator from `"array-contains"` to `"array_contains"` (Python SDK requirement).
    - Resolved process conflicts by killing stale backend instances on port 8000.
    - Fixed `TypeError: Cannot read properties of undefined (reading 'awareness')` in `Editor.tsx` by initializing Yjs provider/doc using `useMemo`.
    - Resolved missing peer dependency build errors by installing `@tiptap/y-tiptap` and `y-prosemirror`.
    - Pinned `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-cursor` to `^2` to match the project's TipTap version.

#### 2.3 Sharing & Permissions
- **Sharing Infrastructure**:
    - Updated backend models to include `is_public`, `share_token`, and `permissions` mapping.
    - Implemented role-based access control (Owner/Editor/Viewer).
    - Added backend route for resolving public access via share tokens.
- **Frontend Sharing UI**:
    - Created a modern `ShareModal` for managing document access.
    - Added support for inviting collaborators by email (resolving to UID on the backend).
    - Implemented one-click "Copy Link" for public sharing.
- **Public Viewing**:
    - Created a new `/share/[token]` route allowing secure public viewing of notes without login.
    - Updated `Editor.tsx` to handle "Anonymous Guest" awareness for public viewers.

## [2026-03-25]
- **Verification: Share Access Functionality**:
    - Identified and fixed missing `get_note_by_share_token` method in `NoteService` (backend) which was causing public shared links to 404.
    - Added `self.auth = firebase_auth` to `FirebaseManager` to allow resolving user emails for invitations.
    - Verified Role-Based Access Control (Owner/Editor/Viewer) and public sharing using automated verification scripts.
    - Improved `ShareModal` UX with overlay click-to-close and enhanced glassmorphism backdrop.
    - Confirmed public route `/share/[token]` correctly loads notes in read-only mode for anonymous users.
- **Server Maintenance**:
    - Started Frontend (Next.js), Backend (FastAPI), and Yjs standalone servers.
    - Added root `frontend/app/page.tsx` redirecting to `/login` to prevent empty root 404.
    - Resolved "Unexpected end of array" errors caused by protocol mismatches between custom server and standard frontend provider.
- **UI Modernization**:
    - Created a high-impact, premium Landing Page at the root (`/`) featuring glassmorphism, background gradients, and feature highlights.
    - Updated `AuthGuard` to correctly handle public routes for the landing page (`/`) and shared documents (`/share/*`).
    - Implemented modern layout with Lucide icons and Tailwind animations.
- **Protocol Fixes**:
    - Rewrote `yjs-server/server.js` using `y-websocket/bin/utils` to correctly handle the standard protocol (Sync/Awareness).
    - Resolved "Unexpected end of array" errors caused by protocol mismatches between custom server and standard frontend provider.

## [2026-03-25] - 2
- **Documentation & Knowledge Base**:
    - Created `AUDIT.md` providing a comprehensive system audit and actionable recommendations for security, architecture, and code quality.
    - Created `LEARNING.md` as a detailed guide for beginners, explaining the full-stack architecture, Yjs collaboration, and the project's tech stack.
## [2026-03-25] - 3
- **Audit Recommendations Addressed**:
    - **Backend Code Quality**: Added missing `HTTPException` import and implemented transactional safety using Firestore for `add_collaborator_by_email` in `note_service.py`. Removed unreachable `return` block in `notes.py`.
    - **Architecture & Security**: Removed unused Yjs wrapper endpoint from `main.py` reducing attack surfaces, and implemented `expires_at` logic for public share tokens.
    - **Frontend Refactoring**: Added `NEXT_PUBLIC_YJS_WEBSOCKET_URL` to `.env.local` to remove hardcoded ws locations. Optimized `Editor.tsx` auto-save logic to leverage TipTap's `update` event rather than cyclic getHTML checks.
    - Updated `AUDIT.md` to mark vulnerabilities and architecture items as resolved.
    - Expanded `LEARNING.md` substantially to act as an interview preparation guide, outlining CRDT vs OT concepts, and deep-diving into WebSocket scaling.
    - Polished `README.md` to formally highlight new security features and environmental requisites.
- **UI & Layout Cleanup**:
    - Removed dummy metadata cards and unresolved navigation links from `Dashboard` (`dashboard/page.tsx`).
    - Stripped placeholder anchor links from the `Landing Page` (`features`, `privacy`, `twitter`) to ensure a completely professional, production-ready aesthetic.

## [2026-03-26]
- **Full-Stack Deployment Automation**:
    - Finalized a unified **GitHub Actions CI/CD pipeline** (`deploy-all.yml`) that builds and deploys **Frontend (Next.js)**, **Backend (FastAPI)**, and **Yjs Server (Node.js)** in parallel.
    - Switched from raw `gcloud` commands to [google-github-actions/deploy-cloudrun] for higher stability and better IAM handling.
    - Integrated **Secret Manager** volume mounting (`/app/secrets/firebase-key.json`) for the FastAPI backend, resolving startup-level security issues.
    - Refactored `Backend` initialization logic (`core/config.py`, `core/firebase.py`) to natively support mounted secret files, eliminating the need for scattered environment variables.
    - Configured dynamic build-time injection of service URLs into the Frontend container to ensure proper inter-service communication.
- **Infrastructure Hardening**:
    - Resolved widespread IAM permission issues (`Storage Admin`, `Artifact Registry Admin`, `Service Usage Consumer`, `Secret Manager Secret Accessor`).
    - Standardized service deployments in the `us-central1` region on **Google Cloud Run**.
    - Enabled `suppress-logs` and direct directory context (`cd`) in build scripts to bypass runner-level log streaming limitations.
    鼓
