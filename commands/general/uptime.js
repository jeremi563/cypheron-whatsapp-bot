import os from 'os'
import config from '../../config.js'

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

function formatBytes(bytes) {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(2)} KB`
}

export default {
  name: 'uptime',
  ownerOnly: false,
  description: 'Show system uptime and memory usage',
  async execute(sock, chatJid, sender, msg) {
    const systemUptime = formatUptime(os.uptime())
    const totalMem = formatBytes(os.totalmem())
    const freeMem = formatBytes(os.freemem())
    const usedMem = formatBytes(os.totalmem() - os.freemem())
    const platform = os.platform()
    const cpuModel = os.cpus()[0]?.model || 'Unknown'

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

📊 *System Information*

🖥️ *Platform:* ${platform}
💻 *CPU:* ${cpuModel}
⏱️ *System Uptime:* ${systemUptime}

💾 *Memory Usage:*
├ Total: ${totalMem}
├ Used: ${usedMem}
└ Free: ${freeMem}

_Cypheron running smoothly! 🚀_`,
      quoted: msg
    })
  }
}