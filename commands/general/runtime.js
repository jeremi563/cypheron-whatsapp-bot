import config from '../../config.js'

const startTime = Date.now()

function formatRuntime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export default {
  name: 'runtime',
  ownerOnly: false,
  description: 'Show how long the bot has been running',
  async execute(sock, chatJid, sender, msg) {
    const uptime = Date.now() - startTime
    const runtime = formatRuntime(uptime)

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

⏱️ *Bot Runtime*

🟢 *Status:* Online
⏰ *Running for:* ${runtime}
📅 *Started at:* ${new Date(startTime).toLocaleString('en-US', { timeZone: config.timezone })}`
    }, { quoted: msg })
  }
}