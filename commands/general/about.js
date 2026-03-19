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
`╭━━ [ 🤖 *CYPHERON BOT* ] ━━
┃
┃ *About Cypheron Bot*
┃
┃ Cypheron is a powerful WhatsApp automation bot built with Node.js and Gifted Baileys.
┃
┃ *What I can do:*
┃ ⚡ Auto react to messages
┃ 👁️ Auto view statuses
┃ ❤️ Auto like statuses
┃ 📡 Track contact presence
┃ 🤖 Auto update bio
┃ 💬 Auto welcome messages
┃ 📋 And much more!
┃
┃ *Developer:* Jeremia Obed
┃ *Built with:* ❤️ and Node.js
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *Channel:* wa.me/channel/0029VbCHhynLSmbdAmqOD438

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