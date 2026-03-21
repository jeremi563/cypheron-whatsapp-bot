import config from '../../config.js'
import ytdl from 'ytdl-core'

export default {
  name: 'yt',
  ownerOnly: false,
  description: 'Download YouTube video or audio',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const type = args[0]?.toLowerCase()
    const url = args[1]

    if (!type || !url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a type and YouTube URL.

*Usage:*
- ${config.prefix}yt video <url>
- ${config.prefix}yt audio <url>

*Example:*
${config.prefix}yt video https://youtube.com/watch?v=xxxxx
${config.prefix}yt audio https://youtube.com/watch?v=xxxxx`
      }, { quoted: msg })
      return
    }

    if (type !== 'video' && type !== 'audio') {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid type. Use *video* or *audio*.`
      }, { quoted: msg })
      return
    }

    if (!ytdl.validateURL(url)) {
      await sock.sendMessage(chatJid, {
        text: '❌ Invalid YouTube URL. Please check and try again.'
      }, { quoted: msg })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Downloading YouTube ${type}...`
      }, { quoted: msg })

      const info = await ytdl.getInfo(url)
      const title = info.videoDetails.title
      const duration = info.videoDetails.lengthSeconds
      const views = parseInt(info.videoDetails.viewCount).toLocaleString()
      const author = info.videoDetails.author.name

      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

      const channelLink =
`\n━━━━━━━━━━━━━━━━━━━━━━━━
📢 *Follow our channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438

_Downloaded by Cypheron Bot 🤖_`

      if (type === 'audio') {
        const audioFormat = ytdl.chooseFormat(info.formats, {
          quality: 'highestaudio',
          filter: 'audioonly'
        })

        if (!audioFormat) {
          await sock.sendMessage(chatJid, {
            text: '❌ No audio format available for this video.'
          }, { quoted: msg })
          return
        }

        await sock.sendMessage(chatJid, {
          audio: { url: audioFormat.url },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: msg })

        await sock.sendMessage(chatJid, {
          text:
`✅ *YouTube Audio Downloaded!*

🎵 *Title:* ${title}
👤 *Author:* ${author}
⏱️ *Duration:* ${durationStr}
▶️ *Views:* ${views}
${channelLink}`
        })

      } else {
        const videoFormat = ytdl.chooseFormat(info.formats, {
          quality: 'highest',
          filter: 'audioandvideo'
        })

        if (!videoFormat) {
          await sock.sendMessage(chatJid, {
            text: '❌ No video format available. Try audio instead.'
          }, { quoted: msg })
          return
        }

        await sock.sendMessage(chatJid, {
          video: { url: videoFormat.url },
          caption:
`✅ *YouTube Video Downloaded!*

🎬 *Title:* ${title}
👤 *Author:* ${author}
⏱️ *Duration:* ${durationStr}
▶️ *Views:* ${views}
${channelLink}`
        }, { quoted: msg })
      }

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`
      }, { quoted: msg })
    }
  }
}