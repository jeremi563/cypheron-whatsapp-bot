import express from 'express'

const app = express()

// ✅ use port 3001 if PORT is already taken by web panel
// on Render PORT env var is set — use it
// locally use 3001 to avoid clash with server.js on 3000
const PORT = process.env.KEEP_ALIVE_PORT || process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Cypheron Bot</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #0a0a0a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
          }
          h1 { font-size: 2.5em; margin-bottom: 10px; }
          p { font-size: 1.1em; margin: 8px 0; opacity: 0.8; }
          .badge {
            display: inline-block;
            background: #00ff00;
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 15px;
          }
          .links { margin-top: 30px; }
          .links a {
            color: #00ff00;
            text-decoration: none;
            margin: 0 10px;
            opacity: 0.7;
          }
          .links a:hover { opacity: 1; }
        </style>
      </head>
      <body>
        <h1>🤖 CYPHERON BOT</h1>
        <p>✅ Bot is running!</p>
        <p>Built with Node.js & Gifted Baileys</p>
        <p>Developed by <strong>Jeremia Obed</strong></p>
        <div class="badge">🟢 ONLINE</div>
        <div class="links">
          <a href="https://github.com/jeremi563/cypheron-whatsapp-bot" target="_blank">🐙 GitHub</a>
          <a href="https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438" target="_blank">📢 Channel</a>
          <a href="https://cypheron-session.onrender.com" target="_blank">🔑 Session ID</a>
        </div>
      </body>
    </html>
  `)
})

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Cypheron',
    version: '1.0.0',
    developer: 'Jeremia Obed',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

export function startKeepAlive() {
  // ✅ handle port already in use gracefully
  const server = app.listen(PORT, () => {
    console.log(`\x1b[32m✅ Keep-alive server running on port ${PORT}\x1b[0m`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // ✅ try next port if current one is busy
      const newPort = parseInt(PORT) + 1
      console.log(`\x1b[33m⚠️  Port ${PORT} in use — trying port ${newPort}\x1b[0m`)
      app.listen(newPort, () => {
        console.log(`\x1b[32m✅ Keep-alive server running on port ${newPort}\x1b[0m`)
      })
    } else {
      console.error(`\x1b[31m❌ Keep-alive server error: ${err.message}\x1b[0m`)
    }
  })
}