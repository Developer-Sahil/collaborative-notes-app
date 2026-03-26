# Project Audit Report & Recommendations

This document provides a comprehensive audit of the **Collaborative Notes App** and lists key recommendations for improving security, stability, performance, and code quality.

## 📋 Summary of Findings

The project demonstrates a solid architecture using modern technologies like Next.js, FastAPI, and Yjs. However, several critical issues were identified regarding code quality, architecture redundancy, and environment configuration.

---

## 🛠 Recommendations

### 1. Fix Critical Code Issues ✅ [RESOLVED]
- **Missing Imports**: `backend/services/note_service.py` uses `HTTPException` in several methods but lacks the import. 
  - *Action*: Added `from fastapi import HTTPException` to the top of `note_service.py`.
- **Dead Code**: `backend/routes/notes.py` had a redundant, unreachable `return` statement at the very end of the file.
  - *Action*: Removed line 127 in `backend/routes/notes.py`.

### 2. Standardize Environment Configuration ✅ [RESOLVED]
- **Hardcoded URLs**: In `frontend/components/Editor.tsx`, the Yjs WebSocket URL (`ws://localhost:1234`) was hardcoded.
  - *Action*: Moved this to `NEXT_PUBLIC_YJS_WEBSOCKET_URL` in `.env.local` and `.env.local.example`.
- **Consistent .env Usage**: Ensure all services (Frontend, Backend, Yjs-Server) have fully populated `.env.example` files to simplify developer onboarding.

### 3. Architecture Consolidation ✅ [RESOLVED]
- **Redundant WebSockets**: The backend (`main.py`) defined a FastAPI WebSocket endpoint at `/api/v1/ws/{note_id}` that wasn't used.
  - *Action*: Removed the unused endpoint to reduce attack surface since we use a standalone Yjs server.

### 4. Database Stability & Concurrency 🔄 [PARTIAL]
- **Firestore Transactions**: Operations like `add_collaborator_by_email` performed a "read-then-write" which is prone to race conditions.
  - *Action*: Migrated `add_collaborator_by_email` to use `@firestore.transactional`. *(Note: other endpoints remain untested for strict concurrency)*.
- **Data Validation**: Both frontend and backend should implement more rigorous validation (e.g., Pydantic models for every field, Zod for frontend).

### 5. Implement Testing Suite
The project currently relies on manual verification scripts (`verify_*_script.py`).
- *Action*: Implement `pytest` for backend API testing and `Vitest`/`Testing-Library` for frontend unit testing.

### 6. Security Enhancements 🔄 [PARTIAL]
- **Token Expiration**: Public sharing originally used tokens that never expired.
  - *Action*: Implemented an `expires_at` logic on the notes API routes so token verification rejects expired data.
- **CORS Policy**: Ensure `ALLOWED_ORIGINS` in the backend is strictly defined in production.

### 7. Performance & Developer Experience (DX) 🔄 [PARTIAL]
- **Editor Auto-save**: The 5-second auto-save debounce was decoupled from editor changes.
  - *Action*: Refactored `Editor.tsx` to debounce using TipTap's native `"update"` event listener, freeing up React cycles mapping `getHTML()`.
### 8. Cloud-Native Automation & Deployment ✅ [RESOLVED]
- **Unified CI/CD**: Manual deployments were prone to environment drift and configuration errors.
    - *Action*: Implemented a robust GitHub Actions workflow (`deploy-all.yml`) for parallel service deployment to Google Cloud Run.
- **Service-to-Service Communication**: Service URLs were previously hardcoded or manual.
    - *Action*: Configured dynamic build-time injection for the Frontend and output-based URL resolution in the workflow.

### 9. Secret Management & Compliance ✅ [RESOLVED]
- **Local JSON Keys**: The project initially stored sensitive `firebase-key.json` files in the source tree.
    - *Action*: Migrated all credentials to **GCP Secret Manager**. Implemented volume mounting in Cloud Run to securely inject secrets without exposing them as environment variables.
- **IAM Hardening**: Multiple permission gaps (Storage, Artifact Registry, Secret Manager) were identified and bridged during the cloud migration.
    - *Action*: Documented required IAM roles and standardized the service account permissions across all three micro-services.
- **Dockerization**: Dockerfiles were optimized (multi-stage for Frontend, slim images for Backend/Yjs) to ensure minimal footprint and fast cold starts on Cloud Run.
