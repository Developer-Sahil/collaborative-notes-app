"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { auth } from "@/lib/firebase";
import { WebSocketMessage } from "@/lib/types";

interface UseWebSocketOptions {
  noteId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  noteId,
  onMessage,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const { user, loading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    
    let isMounted = true;

    const connectWebSocket = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const wsProtocol =
          window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.host.replace("3000", "8000");
        const wsUrl = `${wsProtocol}//${wsHost}/api/v1/ws/${noteId}?token=${token}`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isMounted) {
            setIsConnected(true);
            onConnect?.();
          }
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            onMessage?.(message);
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
            onDisconnect?.();
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [noteId, user, loading, onMessage, onConnect, onDisconnect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
}