import config from '../../config.js'

export default {
  name: 'time',
  ownerOnly: false,
  description: 'Get the current time',
  async execute(sock, chatJid, sender, msg) {
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: config.timezone
    })
    await sock.sendMessage(chatJid, {
      text: `🕐 Current time is: *${now}*`
    }, { quoted: msg })
  }
}