import config from '../../config.js'

export default {
  name: 'shortlink',
  ownerOnly: false,
  description: 'Shorten a URL',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const url = text.slice(config.prefix.length + 'shortlink'.length).trim()

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a valid URL.

*Usage:* ${config.prefix}shortlink <url>
*Example:* ${config.prefix}shortlink https://github.com/jeremi563/my-bot`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Shortening URL...',
        quoted: msg
      })

      // use tinyurl free API — no key needed
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
      )

      const shortUrl = await response.text()

      if (!shortUrl || !shortUrl.startsWith('http')) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to shorten URL. Please try again.',
          quoted: msg
        })
        return
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      🔗 URL SHORTENER   ║
╚════════════════════════╝

📎 *Original URL:*
${url}

✅ *Shortened URL:*
${shortUrl}

_Powered by TinyURL_`,
        detectLinks: true,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to shorten URL: ${err.message}`,
        quoted: msg
      })
    }
  }
}
