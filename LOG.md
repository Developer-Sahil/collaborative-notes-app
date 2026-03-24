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
