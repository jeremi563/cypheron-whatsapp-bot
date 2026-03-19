import config from '../../config.js'

export default {
  name: 'shortlink',
  ownerOnly: false,
  description: 'Shorten a URL',
  async execute(sock, chatJid, sender, msg, commands, args) {
    const url = args[0]

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a valid URL.

*Usage:* ${config.prefix}shortlink <url>
*Example:* ${config.prefix}shortlink https://github.com/jeremi563`
      }, { quoted: msg })
      return
    }

    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
      )
      const shortUrl = await response.text()

      if (!shortUrl || !shortUrl.startsWith('http')) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to shorten URL. Please try again.'
        }, { quoted: msg })
        return
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      🔗 URL SHORTENER   ║
╚════════════════════════╝

📎 *Original:*
${url}

✅ *Shortened:*
${shortUrl}

_Powered by TinyURL_`
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to shorten URL: ${err.message}`
      }, { quoted: msg })
    }
  }
}