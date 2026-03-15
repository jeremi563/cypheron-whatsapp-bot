import config from '../../config.js'

export default {
  name: 'about',
  ownerOnly: false,
  description: 'About this bot',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

*About Cypheron Bot*

Cypheron is a powerful WhatsApp automation bot built with Node.js and Gifted Baileys.

*What I can do:*
⚡ Auto react to messages
👁️ Auto view statuses
❤️ Auto like statuses
📡 Track contact presence
🤖 Auto update bio
💬 Auto welcome messages
📋 And much more!

*Developer:* Jeremia Obed
*Built with:* ❤️ and Node.js

🔗 *GitHub Repo:*
https://github.com/jeremi563/my-bot

📢 *Join our channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438`,
detectLinks: true,
      quoted: msg
    })
  }
}