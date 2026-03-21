import config from '../../config.js'

export default {
  name: 'facebook',
  ownerOnly: false,
  description: 'Download Facebook videos',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const url = args[0]

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a Facebook video URL.

*Usage:* ${config.prefix}facebook <url>
*Example:* ${config.prefix}facebook https://www.facebook.com/watch?v=xxxxx`
      }, { quoted: msg })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Facebook video...'
      }, { quoted: msg })

      const response = await fetch(`https://getfvid.com/downloader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `url=${encodeURIComponent(url)}`
      })

      const html = await response.text()

      const hdMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>.*?HD/s)
      const sdMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>.*?SD/s)
      const anyMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/)

      const videoUrl = hdMatch?.[1] || sdMatch?.[1] || anyMatch?.[1]
      const quality = hdMatch ? 'HD' : 'SD'

      if (!videoUrl) {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not extract video. The video may be private.'
        }, { quoted: msg })
        return
      }

      await sock.sendMessage(chatJid, {
        video: { url: videoUrl },
        caption:
`✅ *Facebook Video Downloaded!*

📹 *Quality:* ${quality}

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