import config from '../../config.js'

export default {
  name: 'date',
  ownerOnly: false,
  description: 'Get the current date',
  async execute(sock, chatJid, sender, msg) {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: config.timezone
    })
    await sock.sendMessage(chatJid, {
      text: `📅 Today is: *${today}*`
    }, { quoted: msg })
  }
}