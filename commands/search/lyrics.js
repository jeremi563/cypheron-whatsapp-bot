import config from '../../config.js'

export default {
  name: 'lyrics',
  ownerOnly: false,
  description: 'Get song lyrics',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const query = text.slice(config.prefix.length + 'lyrics'.length).trim()

    if (!query) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide artist and song name.

*Usage:* ${config.prefix}lyrics <artist> - <song>
*Example:* ${config.prefix}lyrics Ed Sheeran - Shape of You`,
        quoted: msg
      })
      return
    }

    // split by dash to get artist and title
    const parts = query.split('-')
    if (parts.length < 2) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please use the correct format.

*Usage:* ${config.prefix}lyrics <artist> - <song>
*Example:* ${config.prefix}lyrics Ed Sheeran - Shape of You`,
        quoted: msg
      })
      return
    }

    const artist = parts[0].trim()
    const title = parts.slice(1).join('-').trim()

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Searching lyrics for *${title}* by *${artist}*...`,
        quoted: msg
      })

      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      )
      const data = await response.json()

      if (!data.lyrics) {
        await sock.sendMessage(chatJid, {
          text: `❌ Lyrics not found for *${title}* by *${artist}*. Please check the spelling.`,
          quoted: msg
        })
        return
      }

      // trim lyrics if too long
      let lyrics = data.lyrics.trim()
      if (lyrics.length > 3000) {
        lyrics = lyrics.substring(0, 3000) + '\n\n_...lyrics truncated due to length_'
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       🎵 LYRICS         ║
╚════════════════════════╝

🎵 *${title}*
👤 *Artist:* ${artist}

━━━━━━━━━━━━━━━━━━━━━━━━

${lyrics}

━━━━━━━━━━━━━━━━━━━━━━━━
_Powered by lyrics.ovh_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to fetch lyrics: ${err.message}`,
        quoted: msg
      })
    }
  }
}
