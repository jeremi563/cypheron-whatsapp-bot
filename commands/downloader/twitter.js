import pkg from 'gifted-dls'
const { twitter } = pkg
import config from '../../config.js'

export default {
  name: 'twitter',
  ownerOnly: false,
  description: 'Download Twitter/X videos',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const url = text.slice(config.prefix.length + 'twitter'.length).trim()

    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a Twitter/X URL.

*Usage:* ${config.prefix}twitter <url>
*Example:* ${config.prefix}twitter https://twitter.com/user/status/xxxxx`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Downloading Twitter/X video...',
        quoted: msg
      })

      const result = await twitter(url)

      if (!result || !result.data) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to download. Please check the URL and try again.',
          quoted: msg
        })
        return
      }

      const data = result.data

      await sock.sendMessage(chatJid, {
        video: { url: data.url || data.hd || data.sd },
        caption:
`✅ *Twitter/X Video Downloaded!*

💬 *Tweet:* ${data.text || 'No text'}
👤 *Author:* ${data.author || 'Unknown'}

_Downloaded by Cypheron Bot 🤖_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to download: ${err.message}`,
        quoted: msg
      })
    }
  }
}
