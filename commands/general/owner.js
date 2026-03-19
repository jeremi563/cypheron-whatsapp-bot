import config from '../../config.js'

export default {
  name: 'owner',
  ownerOnly: false,
  description: 'Get bot owner contact',
  async execute(sock, chatJid, sender, msg) {
    const ownerNumber = config.owner.replace('@s.whatsapp.net', '')

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

👤 *Bot Owner*

📱 *Contact:* @${ownerNumber}

📢 *Channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

_Contact the owner for support or inquiries_`,
      mentions: [config.owner]
    }, { quoted: msg })
  }
}