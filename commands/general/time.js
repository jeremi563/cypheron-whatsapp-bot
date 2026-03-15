export default {
  name: 'time',
  ownerOnly: false,
  description: 'Get the current time',
  async execute(sock, chatJid, sender, msg) {
    const now = new Date().toLocaleTimeString()
    await sock.sendMessage(chatJid, { 
      text: `🕐 Current time is: ${now}`,
      quoted: msg
    })
  }
}