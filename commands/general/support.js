import config from '../../config.js'

export default {
  name: 'support',
  ownerOnly: false,
  description: 'Get support information',
  async execute(sock, chatJid, sender, msg) {
    const ownerNumber = config.owner.replace('@s.whatsapp.net', '')

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

🆘 *Support*

Need help with Cypheron?

📱 *Contact Owner:*
@${ownerNumber}

📢 *Channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

📋 *Common Issues:*
- Bot not responding → Check if bot is online
- Command not working → Check prefix is *${config.prefix}*
- Session expired → Get new session ID

_We are happy to help! 🤖_`,
      mentions: [config.owner]
    }, { quoted: msg })
  }
}