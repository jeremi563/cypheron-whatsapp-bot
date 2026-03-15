import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const PORT = 3000

app.use(express.static(join(__dirname, 'public')))

// shared state between server and bot
export const serverState = {
  method: 'qr',
  phone: null,
  socket: null,
  pairingCodeRequested: false,
  requestPairingCode: null, // callback set by index.js
}

export function startServer() {
  return new Promise((resolve) => {
    httpServer.listen(PORT, () => {
      console.log(`\x1b[32m✅ Connection panel at: http://localhost:${PORT}\x1b[0m`)
    })

    io.on('connection', (socket) => {
      serverState.socket = socket
      socket.emit('status', 'WAITING FOR CONNECTION')

      // user selected QR method
      socket.on('use-qr', () => {
        serverState.method = 'qr'
        serverState.phone = null
        serverState.pairingCodeRequested = false
        socket.emit('status', 'WAITING FOR QR CODE')
        resolve({ method: 'qr' })
      })

      // user submitted phone number for pairing
      socket.on('request-pair-code', (phone) => {
        // clean the number — remove all non numeric characters
        const cleanPhone = phone.replace(/[^0-9]/g, '')

        if (!cleanPhone || cleanPhone.length < 7) {
          socket.emit('pair-error', 'Invalid phone number. Use country code + number only.')
          return
        }

        serverState.method = 'pair'
        serverState.phone = cleanPhone
        serverState.pairingCodeRequested = false

        socket.emit('status', 'GENERATING PAIRING CODE...')

        // resolve so bot knows to use pairing method
        resolve({ method: 'pair', phone: cleanPhone })
      })
    })
  })
}

export function sendQR(qrImage) {
  if (serverState.socket) {
    serverState.socket.emit('qr', qrImage)
  }
}

export function sendPairCode(code) {
  if (serverState.socket) {
    serverState.socket.emit('pair-code', code)
  }
}

export function sendConnected() {
  io.emit('connected')
}

export function sendStatus(message) {
  io.emit('status', message.toUpperCase())
}

export function sendError(message) {
  if (serverState.socket) {
    serverState.socket.emit('pair-error', message)
  }
}