import pkg from 'gifted-dls'
const { facebook } = pkg
import config from '../../config.js'

export default {
  name: 'facebook',
  ownerOnly: false,
  description: 'Download Facebook videos',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const url = text.slice(config.prefix.length + 'facebook'.length).trim()

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a Facebook video URL.

*Usage:* ${config.prefix}facebook <url>
*Example:* ${config.prefix}facebook https://www.facebook.com/watch?v=xxxxx`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Facebook video...',
        quoted: msg
      })

      const result = await facebook(url)

      if (!result || !result.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.',
          quoted: msg
        })
        return
      }

      const data = result.data

      await sock.sendMessage(chatJid, {
        video: { url: data.hd || data.sd || data.url },
        caption:
`✅ *Facebook Video Downloaded!*

🎬 *Title:* ${data.title || 'No title'}
📹 *Quality:* ${data.hd ? 'HD' : 'SD'}

_Downloaded by Cypheron Bot 🤖_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`,
        quoted: msg
      })
    }
  }
}