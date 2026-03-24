from fastapi import FastAPI, Depends, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket
from contextlib import asynccontextmanager
from core.config import get_settings
from core.security import verify_token
from routes import notes
from websocket.manager import manager
import json

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Collaborative Notes API starting...")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.websocket("/api/v1/ws/{note_id}")
async def websocket_endpoint(websocket: WebSocket, note_id: str):
    """
    WebSocket endpoint for real-time collaboration.
    
    Query params:
    - token: Firebase ID token
    """
    token = websocket.query_params.get("token")
    
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token required")
        return
    
    # Verify token
    decoded = verify_token.__wrapped__(token) if hasattr(verify_token, '__wrapped__') else None
    
    # Simplified verification for WebSocket
    try:
        from core.firebase import firebase_manager
        decoded = firebase_manager.verify_token(token)
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return
    
    if not decoded:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized")
        return
    
    user_id = decoded.get("uid")
    
    # Connect user
    await manager.connect(websocket, note_id, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "sync":
                # Broadcast sync updates to all clients
                await manager.broadcast(note_id, {
                    "type": "update",
                    "user_id": user_id,
                    "data": message.get("data"),
                })
            elif message.get("type") == "awareness":
                # Broadcast awareness (cursor position, etc)
                await manager.broadcast(note_id, {
                    "type": "awareness",
                    "user_id": user_id,
                    "data": message.get("data"),
                })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(note_id, websocket)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )