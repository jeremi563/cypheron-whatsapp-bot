import pkg from 'gifted-dls'
const { youtube } = pkg
import config from '../../config.js'

export default {
  name: 'yt',
  ownerOnly: false,
  description: 'Download YouTube video or audio',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.slice(config.prefix.length + 'yt'.length).trim().split(' ')
    const type = args[0]?.toLowerCase()
    const url = args[1]

    if (!type || !url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a type and YouTube URL.

*Usage:*
- ${config.prefix}yt video <url> — download video
- ${config.prefix}yt audio <url> — download audio

*Example:*
${config.prefix}yt video https://youtube.com/watch?v=xxxxx
${config.prefix}yt audio https://youtube.com/watch?v=xxxxx`,
        quoted: msg
      })
      return
    }

    if (type !== 'video' && type !== 'audio') {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid type. Use *video* or *audio*.\n\n*Usage:* ${config.prefix}yt video/audio <url>`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Downloading YouTube ${type}...`,
        quoted: msg
      })

      const result = await youtube(url, type === 'audio' ? 'mp3' : 'mp4')

      if (!result || !result.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.',
          quoted: msg
        })
        return
      }

      const data = result.data

      if (type === 'audio') {
        await sock.sendMessage(chatJid, {
          audio: { url: data.download_url },
          mimetype: 'audio/mp4',
          ptt: false,
          quoted: msg
        })
      } else {
        await sock.sendMessage(chatJid, {
          video: { url: data.download_url },
          caption:
`✅ *YouTube Video Downloaded!*

🎬 *Title:* ${data.title || 'Unknown'}
⏱️ *Duration:* ${data.duration || 'Unknown'}
👁️ *Views:* ${data.views || 0}

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