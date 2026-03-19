import config from '../../config.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'owner',
  ownerOnly: false,
  description: 'Get bot owner contact',
  async execute(sock, chatJid, sender, msg) {
    const ownerNumber = config.owner.replace('@s.whatsapp.net', '')
    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))

    const textData =
`╭━━ [ 🤖 *CYPHERON BOT* ] ━━
┃
┃ 👤 *Bot Owner*
┃
┃ 📱 *Contact:* @${ownerNumber}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *Channel:* wa.me/channel/0029VbCHhynLSmbdAmqOD438

_Contact the owner for support or inquiries_`

    await sock.sendMessage(chatJid, {
      text: textData,
      mentions: [config.owner],
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