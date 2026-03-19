import config from '../../config.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'about',
  ownerOnly: false,
  description: 'About this bot',
  async execute(sock, chatJid, sender, msg) {

    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))

    await sock.sendMessage(chatJid, {
      image: image,
      caption:
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

📢 https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438`
    }, { quoted: msg })

  }
}