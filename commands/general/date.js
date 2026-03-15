export default {
  name: 'date',
  ownerOnly: false,
  description: 'Get the current date',
  async execute(sock, chatJid, sender, msg) {
    const today = new Date().toLocaleDateString()
    await sock.sendMessage(chatJid, { 
      text: `📅 Today's date is: ${today}`,
      quoted: msg
    })
  }
}