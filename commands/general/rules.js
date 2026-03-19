import config from '../../config.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'rules',
  ownerOnly: false,
  description: 'Show bot usage rules',
  async execute(sock, chatJid, sender, msg) {
    const image = readFileSync(join(__dirname, '../../assets/bot.jpg'))

    const textData =
`╭━━ [ 🤖 *CYPHERON BOT* ] ━━
┃
┃ 📋 *Bot Rules*
┃
┃ 1️⃣ Do not spam commands
┃ 2️⃣ Do not use the bot for illegal activities
┃ 3️⃣ Do not abuse or harass other users
┃ 4️⃣ Do not attempt to hack or exploit the bot
┃ 5️⃣ Respect the bot owner and other users
┃ 6️⃣ Do not share your Session ID with anyone
┃ 7️⃣ Use commands responsibly
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *Violation of these rules may result in being blocked.*

_Thank you for using Cypheron! 🤖_`

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