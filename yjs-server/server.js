const WebSocket = require('ws')
const http = require('http')
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection

const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT || 1234
const HOST = process.env.HOST || '0.0.0.0'

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ status: 'ok' }))
    return
  }
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Yjs WebSocket Server')
})

const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth here
  const handleAuth = (ws) => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(PORT, HOST, () => {
  console.log(`[Yjs] Standalone server running on ${HOST}:${PORT}`)
  console.log(`[Yjs] Protocol: y-websocket protocol v1 compatible`)
})

// Error handling for global process
process.on('uncaughtException', (err) => {
  console.error('[Yjs] Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Yjs] Unhandled Rejection at:', promise, 'reason:', reason)
})
