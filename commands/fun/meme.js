import config from '../../config.js'

export default {
  name: 'meme',
  ownerOnly: false,
  description: 'Get a random meme',
  async execute(sock, chatJid, sender, msg) {

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Fetching a meme...',
        quoted: msg
      })

      // fetch from free meme API
      const response = await fetch('https://meme-api.com/gimme')
      const data = await response.json()

      if (!data || !data.url) {
        await sock.sendMessage(chatJid, {
          text: '❌ Failed to fetch meme. Please try again.',
          quoted: msg
        })
        return
      }

      await sock.sendMessage(chatJid, {
        image: { url: data.url },
        caption:
`😂 *${data.title}*

👍 ${data.ups} upvotes
📌 r/${data.subreddit}

_Type ${config.prefix}meme for another meme!_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to fetch meme: ${err.message}`,
        quoted: msg
      })
    }
  }
}
