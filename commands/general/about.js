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

    const textData =
`╔════════════════════════════╗
║     🤖 *CYPHERON BOT*      ║
║   _Your WhatsApp Assistant_ ║
╚════════════════════════════╝

*Cypheron* is a powerful WhatsApp automation bot built with Node.js and Gifted Baileys — always online, never sleeping.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ *What I Can Do:*

⚡ Auto react to messages
👁️ Auto view and like statuses
🤖 Auto updating bio with live clock
💬 Auto welcome messages
📡 Contact presence tracker
🔒 Anti delete and anti view once
🛡️ Anti link and anti spam protection
🎵 Media conversion and downloading
⬇️ Download from TikTok, YouTube, Instagram and more
👥 Full group management
🔍 Search — weather, news, movies, lyrics
🎮 Fun — facts, memes, truth, ship
🔧 Utility — QR, calculator, password and more

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍💻 *Developer:* Jeremia Obed
🛠️ *Built with:* Node.js & Gifted Baileys
📦 *Version:* 1.0.0
🌍 *Platform:* WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 *Links:*

📢 *Channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

🔑 *Get Session ID:*
https://cypheron-session.onrender.com

🐙 *GitHub:*
https://github.com/jeremi563/cypheron-whatsapp-bot

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Powered by Cypheron Bot 🤖_`

    await sock.sendMessage(chatJid, {
      text: textData,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: '🤖 Cypheron Bot — Your WhatsApp Assistant',
          body: 'v1.0.0 | Built by Jeremia Obed',
          thumbnail: image,
          sourceUrl: 'https://github.com/jeremi563/cypheron-whatsapp-bot',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg })

  }
}