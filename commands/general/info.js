import config from '../../config.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'info',
  ownerOnly: false,
  description: 'Show bot information',
  async execute(sock, chatJid, sender, msg) {
    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))
    
    const textData =
`╭━━ [ 🤖 *CYPHERON BOT* ] ━━
┃
┃ *Bot Information*
┃
┃ 🤖 *Name:* ${config.botName}
┃ ⚡ *Prefix:* [ ${config.prefix} ]
┃ 🌐 *Platform:* WhatsApp
┃ 📚 *Library:* Gifted Baileys
┃ 💻 *Runtime:* Node.js
┃ 🔧 *Version:* 1.0.0
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*_Tap the image above to view our Source Code!_* 🐙`

    await sock.sendMessage(chatJid, {
      text: textData,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "🤖 Cypheron Bot",
          body: "v1.0.0 | Official Bot",
          thumbnail: image,
          sourceUrl: "https://github.com/jeremi563/cypheron-whatsapp-bot",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg })
  }
}