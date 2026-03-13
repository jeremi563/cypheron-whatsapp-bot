export default {
  name: 'hello',
  ownerOnly: false,
  description: 'Greet the bot',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, { 
      text: `👋 Hello @${sender.split('@')[0]}! I am Cypheron, your WhatsApp bot.`,
      mentions: [sender],
      quoted: msg
    })
  }
}