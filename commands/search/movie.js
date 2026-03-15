import config from '../../config.js'

export default {
  name: 'movie',
  ownerOnly: false,
  description: 'Get movie information',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const movieName = text.slice(config.prefix.length + 'movie'.length).trim()

    if (!movieName) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a movie name.

*Usage:* ${config.prefix}movie <name>
*Example:* ${config.prefix}movie Avengers Endgame`,
        quoted: msg
      })
      return
    }

    if (!config.omdbApiKey) {
      await sock.sendMessage(chatJid, {
        text: '❌ Movie API key not configured. Please add OMDB_API_KEY to your .env file.',
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Searching for *${movieName}*...`,
        quoted: msg
      })

      const response = await fetch(
        `http://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${config.omdbApiKey}`
      )
      const data = await response.json()

      if (data.Response === 'False') {
        await sock.sendMessage(chatJid, {
          text: `❌ Movie *${movieName}* not found. Please check the spelling.`,
          quoted: msg
        })
        return
      }

      // send poster image if available
      if (data.Poster && data.Poster !== 'N/A') {
        await sock.sendMessage(chatJid, {
          image: { url: data.Poster },
          caption:
`╔════════════════════════╗
║       🎬 MOVIE INFO     ║
╚════════════════════════╝

🎬 *${data.Title}* (${data.Year})
⭐ *Rating:* ${data.imdbRating}/10
🎭 *Genre:* ${data.Genre}
🌍 *Language:* ${data.Language}
⏱️ *Runtime:* ${data.Runtime}
🎥 *Director:* ${data.Director}
🌟 *Cast:* ${data.Actors}
🏆 *Awards:* ${data.Awards}
🌍 *Country:* ${data.Country}
📅 *Released:* ${data.Released}
💰 *Box Office:* ${data.BoxOffice || 'N/A'}

📝 *Plot:*
${data.Plot}

_Powered by OMDB API_`,
          quoted: msg
        })
      } else {
        await sock.sendMessage(chatJid, {
          text:
`╔════════════════════════╗
║       🎬 MOVIE INFO     ║
╚════════════════════════╝

🎬 *${data.Title}* (${data.Year})
⭐ *Rating:* ${data.imdbRating}/10
🎭 *Genre:* ${data.Genre}
🌍 *Language:* ${data.Language}
⏱️ *Runtime:* ${data.Runtime}
🎥 *Director:* ${data.Director}
🌟 *Cast:* ${data.Actors}
🏆 *Awards:* ${data.Awards}
🌍 *Country:* ${data.Country}
📅 *Released:* ${data.Released}
💰 *Box Office:* ${data.BoxOffice || 'N/A'}

📝 *Plot:*
${data.Plot}

_Powered by OMDB API_`,
          quoted: msg
        })
      }

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to fetch movie info: ${err.message}`,
        quoted: msg
      })
    }
  }
}