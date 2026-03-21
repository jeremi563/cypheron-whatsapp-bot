import config from '../../config.js'

export default {
  name: 'instagram',
  ownerOnly: false,
  description: 'Download Instagram posts and reels',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const url = args[0]

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide an Instagram URL.

*Usage:* ${config.prefix}instagram <url>
*Example:* ${config.prefix}instagram https://www.instagram.com/p/xxxxx`
      }, { quoted: msg })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Instagram content...'
      }, { quoted: msg })

      const response = await fetch('https://snapinsta.app/api/ajaxSearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `q=${encodeURIComponent(url)}&t=media&lang=en`
      })

      const data = await response.json()

      if (!data || data.status !== 'ok') {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.'
        }, { quoted: msg })
        return
      }

      const html = data.data
      const videoMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/)
      const imageMatch = html.match(/src="(https:\/\/[^"]+\.jpg[^"]*)"/)

      const channelCaption =
`\n━━━━━━━━━━━━━━━━━━━━━━━━
📢 *Follow our channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

_Downloaded by Cypheron Bot 🤖_`

      if (videoMatch && videoMatch[1]) {
        await sock.sendMessage(chatJid, {
          video: { url: videoMatch[1] },
          caption: `✅ *Instagram Video Downloaded!*${channelCaption}`
        }, { quoted: msg })
      } else if (imageMatch && imageMatch[1]) {
        await sock.sendMessage(chatJid, {
          image: { url: imageMatch[1] },
          caption: `✅ *Instagram Image Downloaded!*${channelCaption}`
        }, { quoted: msg })
      } else {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not extract media. The post may be private.'
        }, { quoted: msg })
      }

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`
      }, { quoted: msg })
    }
  }
}