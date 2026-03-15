import pkg from 'gifted-dls'
const { instagram } = pkg
import config from '../../config.js'

export default {
  name: 'instagram',
  ownerOnly: false,
  description: 'Download Instagram posts and reels',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const url = text.slice(config.prefix.length + 'instagram'.length).trim()

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide an Instagram URL.

*Usage:* ${config.prefix}instagram <url>
*Example:* ${config.prefix}instagram https://www.instagram.com/p/xxxxx`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Instagram content...',
        quoted: msg
      })

      const result = await instagram(url)

      if (!result || !result.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.',
          quoted: msg
        })
        return
      }

      const data = result.data

      // handle video posts
      if (data.type === 'video' || data.video_url) {
        await sock.sendMessage(chatJid, {
          video: { url: data.video_url || data.url },
          caption:
`✅ *Instagram Video Downloaded!*

💬 *Caption:* ${data.caption || 'No caption'}

_Downloaded by Cypheron Bot 🤖_`,
          quoted: msg
        })
      } else {
        // handle image posts
        await sock.sendMessage(chatJid, {
          image: { url: data.url || data.image_url },
          caption:
`✅ *Instagram Image Downloaded!*

💬 *Caption:* ${data.caption || 'No caption'}

_Downloaded by Cypheron Bot 🤖_`,
          quoted: msg
        })
      }

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`,
        quoted: msg
      })
    }
  }
}