import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Cypheron Bot</title></head>
      <body style="background:#0a0a0a;color:#00ff00;font-family:monospace;text-align:center;padding:50px">
        <h1>🤖 CYPHERON BOT</h1>
        <p>✅ Bot is running!</p>
        <p>Built with Node.js & Gifted Baileys</p>
      </body>
    </html>
  `)
})

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    bot: 'Cypheron',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

export function startKeepAlive() {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✅ Keep-alive server running on port ${PORT}\x1b[0m`)
  })
}