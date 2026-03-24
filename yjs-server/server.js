const WebSocket = require("ws");
const http = require("http");
const Y = require("yjs");

const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 1234;
const HOST = process.env.HOST || "0.0.0.0";

// Create HTTP server
const server = http.createServer();

// Create WebSocket server with y-websocket support
const wss = new WebSocket.Server({ server });

// Map to store Y.Doc instances per note
const docMap = new Map();

/**
 * Get or create a Y.Doc for a note
 */
function getYDoc(roomName) {
  if (!docMap.has(roomName)) {
    docMap.set(roomName, new Y.Doc());
  }
  return docMap.get(roomName);
}

/**
 * Handle WebSocket connections
 */
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomName = url.pathname.slice(1); // Remove leading slash

  if (!roomName) {
    ws.close(1008, "Room name required");
    return;
  }

  console.log(`Client connected to room: ${roomName}`);

  // Get or create the Y.Doc for this room
  const ydoc = getYDoc(roomName);

  // Create a text type for collaborative editing
  let ytext = ydoc.getText("shared-text");


  // Send initial state to client
  try {
    const state = Y.encodeStateAsUpdate(ydoc);
    ws.send(state);
  } catch (error) {
    console.error("Error sending initial state:", error);
  }

  // Update handler - send changes to all clients in room
  const updateHandler = (update, origin) => {
    if (origin !== ws) {
      try {
        // Broadcast update to all clients
        wss.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client !== ws
          ) {
            client.send(update);
          }
        });
      } catch (error) {
        console.error("Error broadcasting update:", error);
      }
    }
  };

  ydoc.on("update", updateHandler);

  // Message handler - receive updates from client
  ws.on("message", (message) => {
    try {
      Y.applyUpdate(ydoc, new Uint8Array(message));
    } catch (error) {
      console.error("Error applying update:", error);
    }
  });

  // Cleanup on disconnect
  ws.on("close", () => {
    console.log(`Client disconnected from room: ${roomName}`);
    ydoc.off("update", updateHandler);

    // Optionally clean up empty docs (with a delay to allow reconnects)
    setTimeout(() => {
      if (wss.clients.size === 0) {
        console.log(`Cleaning up room: ${roomName}`);
        docMap.delete(roomName);
      }
    }, 5000);
  });

  // Error handling
  ws.on("error", (error) => {
    console.error(`WebSocket error in room ${roomName}:`, error);
  });
});

/**
 * Health check endpoint
 */
server.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Yjs WebSocket server running on ${HOST}:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Yjs server...");
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});