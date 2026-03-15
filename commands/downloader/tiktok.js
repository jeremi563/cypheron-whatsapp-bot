import pkg from 'gifted-dls'
const { tiktok } = pkg
import config from '../../config.js'

export default {
  name: 'tiktok',
  ownerOnly: false,
  description: 'Download TikTok video without watermark',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const url = text.slice(config.prefix.length + 'tiktok'.length).trim()

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a TikTok URL.

*Usage:* ${config.prefix}tiktok <url>
*Example:* ${config.prefix}tiktok https://www.tiktok.com/@user/video/123`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading TikTok video...',
        quoted: msg
      })

      const result = await tiktok(url)

      if (!result || !result.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download TikTok video. Please check the URL and try again.',
          quoted: msg
        })
        return
      }

      const data = result.data

      // send video without watermark
      await sock.sendMessage(chatJid, {
        video: { url: data.video_nowm || data.video },
        caption:
`✅ *TikTok Video Downloaded!*

👤 *Author:* ${data.author?.nickname || 'Unknown'}
💬 *Caption:* ${data.title || 'No caption'}
❤️ *Likes:* ${data.stats?.likeCount || 0}
💬 *Comments:* ${data.stats?.commentCount || 0}

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