import config from '../../config.js'

export default {
  name: 'info',
  ownerOnly: false,
  description: 'Show bot information',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

*Bot Information*

🤖 *Name:* ${config.botName}
⚡ *Prefix:* ${config.prefix}
🌐 *Platform:* WhatsApp
📚 *Library:* Gifted Baileys
💻 *Runtime:* Node.js
🔧 *Version:* 1.0.0

_Type ${config.prefix}menu to see all commands_`
    }, { quoted: msg })
  }
}