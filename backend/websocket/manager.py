import asyncio
import json
from typing import Set, Optional
import websockets
from core.firebase import firebase_manager
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, Set[dict]] = {}
        self.yjs_connections: dict[str, Optional[websockets.WebSocketClientProtocol]] = {}
    
    async def connect(self, websocket, note_id: str, user_id: str):
        """Register a new client connection"""
        await websocket.accept()
        
        if note_id not in self.active_connections:
            self.active_connections[note_id] = set()
        
        self.active_connections[note_id].add({
            "websocket": websocket,
            "user_id": user_id,
        })
        
        # Try to connect to Yjs server for this note
        await self._ensure_yjs_connection(note_id)
        
        return True
    
    def disconnect(self, note_id: str, websocket):
        """Remove a client connection"""
        if note_id in self.active_connections:
            self.active_connections[note_id] = {
                conn for conn in self.active_connections[note_id]
                if conn["websocket"] != websocket
            }
            
            if not self.active_connections[note_id]:
                del self.active_connections[note_id]
    
    async def _ensure_yjs_connection(self, note_id: str):
        """Ensure connection to Yjs server for this note"""
        if note_id in self.yjs_connections and self.yjs_connections[note_id]:
            return
        
        try:
            from core.config import get_settings
            settings = get_settings()
            yjs_url = f"{settings.YJS_SERVER_URL}/{note_id}"
            
            # This is a placeholder - actual Yjs integration comes later
            # For MVP, we just track connections
            self.yjs_connections[note_id] = None
        except Exception as e:
            print(f"Failed to connect to Yjs: {e}")
    
    async def broadcast(self, note_id: str, message: dict, sender_id: Optional[str] = None):
        """Broadcast message to all clients in a room"""
        if note_id not in self.active_connections:
            return
        
        message_str = json.dumps(message)
        disconnected = []
        
        for connection in self.active_connections[note_id]:
            try:
                websocket = connection["websocket"]
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error sending message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected
        for conn in disconnected:
            self.disconnect(note_id, conn["websocket"])
    
    async def send_personal(self, websocket, message: dict):
        """Send message to specific connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending personal message: {e}")


manager = ConnectionManager()