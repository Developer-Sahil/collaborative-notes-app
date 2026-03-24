# iDraft - Collaborative Notes

A premium, real-time collaborative notes application featuring a modern **Glassmorphism** UI. Built with Next.js 14, FastAPI, and Yjs for seamless synchronization.

## ✨ Features

- **Premium UI**: Sophisticated Glassmorphism design system with radial gradients and backdrop blurs.
- **Real-time Collaboration**: Live note editing powered by Yjs and WebSocket protocols.
- **Secure Auth**: Integration with Firebase Authentication for user-specific workspaces.
- **Responsive Workspace**: Modern dashboard with activity tracking and document management.

## 📂 Structure

- **frontend/**: Next.js (App Router) frontend with Tailwind CSS.
- **backend/**: FastAPI (Python 3.12) backend managing Firestore metadata.
- **yjs-server/**: Dedicated Yjs WebSocket server for document sync.

## 🚀 Setup & Running

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

## 🛠 Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Firebase Client SDK, Lucide Icons.
- **Backend**: FastAPI, Firebase Admin SDK, Pydantic.
- **Real-time**: Yjs, y-websocket.
