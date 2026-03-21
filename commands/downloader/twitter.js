import config from '../../config.js'

export default {
  name: 'twitter',
  ownerOnly: false,
  description: 'Download Twitter/X videos',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const url = args[0]

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a Twitter/X URL.

*Usage:* ${config.prefix}twitter <url>
*Example:* ${config.prefix}twitter https://twitter.com/user/status/xxxxx`
      }, { quoted: msg })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Twitter/X video...'
      }, { quoted: msg })

      const response = await fetch(
        `https://twitsave.com/info?url=${encodeURIComponent(url)}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }
      )

      const html = await response.text()

      const videoMatch = html.match(/href="(https:\/\/video\.twimg\.com[^"]+\.mp4[^"]*)"/)

      if (!videoMatch || !videoMatch[1]) {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not extract video. The tweet may have no video or be private.'
        }, { quoted: msg })
        return
      }

      const videoUrl = videoMatch[1]

      const textMatch = html.match(/<p class="leading-snug[^"]*"[^>]*>([\s\S]*?)<\/p>/)
      const tweetText = textMatch
        ? textMatch[1].replace(/<[^>]+>/g, '').trim()
        : 'No text'

      await sock.sendMessage(chatJid, {
        video: { url: videoUrl },
        caption:
`✅ *Twitter/X Video Downloaded!*

💬 *Tweet:* ${tweetText.slice(0, 100)}${tweetText.length > 100 ? '...' : ''}

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