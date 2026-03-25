# Collaborative Notes: Interview Preparation Guide

This guide is curated for developers who want to deeply understand the architecture, trade-offs, and design choices behind the **Collaborative Notes App**.

---

## 🏗 System Architecture

The application is heavily distributed across three pillars to ensure fault tolerance, performance, and immediate real-time feedback.

1.  **Frontend**: Next.js (App Router) with TipTap
2.  **Metadata Backend**: FastAPI (Python) interacting with Firebase Auth and Firestore.
3.  **Real-Time Layer**: Standalone Node.js server using `y-websocket`.

### Why separate the Meta Backend and the Real-time Layer?
- **Scaling Profiles**: REST APIs (FastAPI) are stateless and easily horizontally scalable (e.g., using Kubernetes + Load Balancer). WebSocket servers are inherently stateful. Keeping them separate means you can scale the stateless API based on RPS, and specifically configure sticky sessions or Redis Pub/Sub for the WebSocket servers.
- **Technology Alignment**: Yjs natively supports Node.js WebSocket providers optimally (`y-websocket`). Trying to force Yjs sync logic into Python's `asyncio` is possible using `y-py`, but relying on the reference Node implementation prevents protocol fragmentation.

---

## 🧠 Real-time Synchronization: CRDTs vs. OT

We use **Yjs**, which implements **CRDTs (Conflict-free Replicated Data Types)**. It's vital to understand the difference between CRDT and OT (Operational Transformation).

### Operational Transformation (OT)
- **Used by**: Google Docs natively.
- **How it works**: Requires a central, authoritative server to resolve concurrency. If User A deletes character 5 and User B inserts at character 5, the server uses a transformation matrix to figure out who "wins" and adjusts User B's index.
- **Downside**: High computing cost on the server, scaling is significantly harder due to centralized locking.

### Conflict-free Replicated Data Types (CRDTs)
- **Used by**: This Project, Figma (to an extent), Apple Notes.
- **How it works**: Distributed by native design. Every character has a unique, absolute identifier mathematically structured (often like a fractional tree). If User A and User B edit simultaneously, their clients merge the states locally via math operations that are **commutative** (order doesn't matter).
- **Benefit**: Server only acts as a dumb relay (forwarding messages). The clients do the heavy lifting. This allows for seamless offline capability because clients can merge states natively when reconnected.

---

## 📡 WebSocket Lifecycle & Presence Awareness

We handle live synchronization natively within `Editor.tsx`:

1.  **Y.Doc Initialization**: We instantiate a local `Y.Doc` representing the user's view of the text.
2.  **Provider Connection**: The `WebsocketProvider` binds the `Y.Doc` to the `ws://...` endpoint.
3.  **Awareness Protocol**: Yjs has an "Awareness" side-channel. This broadcasts cursor positions and metadata (like user names and custom tailwind colors string-hashed from UIDs) without cluttering the actual document history.
4.  **Debounced Persistence**: To not hammer Firestore APIs, the `Editor.tsx` listens to the TipTap `'update'` hook. A `5000ms` debounce is implemented natively so saving the HTML structure to the backend only happens after typing stops. 

---

## 🔐 Security & Database Concurrency

### 1. Role-Based Access Control (RBAC)
Documents use a defined `"permissions"` map (`{ "uid": "owner" | "editor" | "viewer" }`). This ensures fine-grained control handled proactively by FastAPI interceptors or route conditionals.

### 2. Firestore Transactions 
**Interview Scenario**: What happens if User A adds User B as a collaborator, and User C simultaneously adds User D? 
- If we do `read -> append to array -> write`, User C's save will overwrite User A's changes (Race condition). 
- **Solution**: We use `@firestore.transactional` in `note_service.py` to acquire a pessimistic lock on the document reference during updates, guaranteeing serializability.

### 3. Secure Public Sharing
Public links generate a decoupled `share_token` (so iterating document IDs doesn't leak paths) and use an `expires_at` logic constraint handled cleanly via the `datetime.now(timezone.utc)` bounds in Python.

---

## 📚 Possible Interview Follow-Ups

-   **"How would you handle Redis scaling for Yjs WebSockets?"**
    *Answer:* Using `y-redis`, we'd pipe the awareness updates and state vector exchanges through a Redis stream, allowing users connecting to different horizontal WebSocket instances to still sync.
-   **"Why use Firebase for Auth but a custom FastAPI backend?"**
    *Answer:* Firebase Auth provides secure, compliant JWTs out-of-the-box, preventing us from manually handling sensitive passwords. Passing this JWT to our custom backend gives us flexibility over our data models while offloading auth liability.

