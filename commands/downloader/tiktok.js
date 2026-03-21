import config from '../../config.js'

export default {
  name: 'tiktok',
  ownerOnly: false,
  description: 'Download TikTok video without watermark',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const url = args[0]

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a TikTok URL.

*Usage:* ${config.prefix}tiktok <url>
*Example:* ${config.prefix}tiktok https://www.tiktok.com/@user/video/123`
      }, { quoted: msg })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading TikTok video...'
      }, { quoted: msg })

      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!data || data.code !== 0 || !data.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.'
        }, { quoted: msg })
        return
      }

      const video = data.data

      await sock.sendMessage(chatJid, {
        video: { url: video.play || video.wmplay },
        caption:
`✅ *TikTok Video Downloaded!*

👤 *Author:* ${video.author?.nickname || 'Unknown'}
💬 *Title:* ${video.title || 'No caption'}
❤️ *Likes:* ${video.digg_count || 0}
💬 *Comments:* ${video.comment_count || 0}
▶️ *Views:* ${video.play_count || 0}

━━━━━━━━━━━━━━━━━━━━━━━━
📢 *Follow our channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

_Downloaded by Cypheron Bot 🤖_`
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`
      }, { quoted: msg })
    }
  }
}