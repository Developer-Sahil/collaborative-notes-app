# Collaborative Notes

A premium, real-time collaborative notes application featuring a modern **Glassmorphism** UI. Built with Next.js 14, FastAPI, and Yjs for seamless synchronization and concurrency control.

## ✨ Features

- **Premium UI**: Sophisticated Glassmorphism design system with radial gradients and backdrop blurs.
- **Real-time Collaboration**: Live note editing via CRDT conflict resolution using Yjs and WebSockets.
- **Secure Auth**: Integration with Firebase Authentication for user-specific JWT validated workspaces.
- **Role-based Access**: Add collaborators by email or generate secure share tokens with built-in expiration (`expires_at`).
- **Data Integrity**: Firestore architecture utilizing `@firestore.transactional` logic for race-condition prevention during concurrent updates.

## 📂 Structure

- **frontend/**: Next.js (App Router) frontend with Tailwind CSS. Includes specialized hooks for CRDT connection state management.
- **backend/**: FastAPI (Python 3.12) backend managing Firestore metadata, roles, and transaction states.
- **yjs-server/**: Dedicated standalone Node.js Yjs WebSocket server for high-throughput document sync logic.

## 🚀 Setup & Running

### Requirements
Ensure you configure the `.env.local` inside `frontend/` and `.env` inside `backend/` using their respective `.example` files. The frontend dynamically consumes `NEXT_PUBLIC_YJS_WEBSOCKET_URL` for real-time routing.

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Yjs Server
```bash
cd yjs-server
npm install
npm start
```

## ☁️ Deployment

For professional deployment to **Google Cloud Run** using the Console and Secret Manager, see our comprehensive:
👉 **[Cloud Run Deployment Guide](CLOUDRUN_GUIDE.md)**

## 🛠 Tech Stack
- **Frontend**: Next.js, Tailwind CSS, TipTap, Firebase Client SDK, Zustand.
- **Backend**: FastAPI, Firebase Admin SDK (Firestore), Pydantic.
- **Real-time Engine**: Yjs, y-websocket, y-prosemirror.
