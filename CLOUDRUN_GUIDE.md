# ☁️ Cloud Run Deployment Guide: Web Console Edition

This guide details exactly how to deploy the **Collaborative Notes App** using the Google Cloud Console, leveraging **Secret Manager** for your service account keys.

---

## 🏗 Prerequisites

1.  **Secret Manager Configured**: You've already uploaded your `firebase-key.json` to a secret in Secret Manager.
2.  **Enabled APIs**: 
    - [Cloud Run API](https://console.cloud.google.com/apis/library/run.googleapis.com)
    - [Cloud Build API](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)
    - [Artifact Registry API](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com)

---

## 🛠 Step 1: Deploy the Metadata Backend (FastAPI)

1.  Navigate to **[Cloud Run](https://console.cloud.google.com/run)** and click **CREATE SERVICE**.
2.  **Source Option**: Select "Continuously deploy new revisions from a source repository" (if linked) OR "Deploy one revision from an existing container image".
    *   *Console Hack*: Use **"Deploy from source code"** (experimental) if you want the console to handle the build.
3.  **Service Name**: `notes-backend`
4.  **Region**: Select your closest region (e.g., `us-central1`).
5.  **Authentication**: Select **"Allow unauthenticated invocations"** (to make it public).
6.  **Configuration -> Container(s)**:
    *   **Port**: `8080`
    *   **Variables & Secrets**:
        - Click **REFERENCE A SECRET**.
        - **Secret**: Select your firebase-key secret.
        - **Reference Type**: "Exposed as a volume" (Mount path: `/app/secrets/firebase-key.json`) OR "Exposed as environment variable".
        - *Recommendation*: Use **Volume Mount** for keys.
7.  **Environment Variables**:
    - `FIREBASE_AUTH_KEY_PATH`: `/app/secrets/firebase-key.json`
8.  Click **CREATE**.

---

## 📡 Step 2: Deploy the Real-Time Server (Yjs)

1.  Click **CREATE SERVICE**.
2.  **Service Name**: `notes-yjs-server`
3.  **Authentication**: Select **"Allow unauthenticated invocations"**.
4.  **Configuration -> Container(s)**:
    - **Port**: `8080` (Cloud Run convention).
5.  **Scaling**: 
    - Set **Minimum Instances** to `1` if you want zero latency on socket connections, but `0` saves money.
6.  Click **CREATE**.
7.  **Note**: Copy the URL (e.g., `https://notes-yjs-server-xxxx.a.run.app`). You'll need this for the frontend.

---

## 🎨 Step 3: Deploy the Frontend (Next.js)

The frontend needs the Backend and Yjs URLs at build time to hardcode them into the client-side bundles.

1.  Click **CREATE SERVICE**.
2.  **Service Name**: `notes-frontend`
3.  **Authentication**: Select **"Allow unauthenticated invocations"**.
4.  **Configuration -> Container(s)**:
    - **Port**: `3000` (Matches our Dockerfile EXPOSE).
5.  **Variables & Secrets**:
    - `NEXT_PUBLIC_BACKEND_URL`: URL of the backend service (`Step 1`).
    - `NEXT_PUBLIC_YJS_WEBSOCKET_URL`: `wss://[YJS_SERVER_URL]` (ensure it starts with `wss://`).
6.  Click **CREATE**.

---

## 🔐 Binding Secrets correctly

If you mounted the secret as a **volume** at `/app/secrets/firebase-key.json`, make sure your backend `NoteService` or `FirebaseManager` looks for it at that exact path. 

Update your `.env` (or environment variables in Console) to point `GOOGLE_APPLICATION_CREDENTIALS` to this path.

---

## ✅ Post-Deployment Checklist

- [ ] Check Logs for the Backend to see if Firebase successfully initialized.
- [ ] Verify the Frontend landing page loads.
- [ ] Open a Note and check if your cursor color appears (indicates Yjs WebSocket is alive).
