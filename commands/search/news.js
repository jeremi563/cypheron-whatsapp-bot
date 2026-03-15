import config from '../../config.js'

export default {
  name: 'news',
  ownerOnly: false,
  description: 'Get latest news',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const topic = text.slice(config.prefix.length + 'news'.length).trim()

    if (!config.gnewsApiKey) {
      await sock.sendMessage(chatJid, {
        text: '❌ News API key not configured. Please add GNEWS_API_KEY to your .env file.',
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Fetching ${topic ? `news about *${topic}*` : 'latest news'}...`,
        quoted: msg
      })

      const query = topic
        ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=5&apikey=${config.gnewsApiKey}`
        : `https://gnews.io/api/v4/top-headlines?lang=en&max=5&apikey=${config.gnewsApiKey}`

      const response = await fetch(query)
      const data = await response.json()

      if (!data.articles || data.articles.length === 0) {
        await sock.sendMessage(chatJid, {
          text: `❌ No news found${topic ? ` for *${topic}*` : ''}. Please try a different topic.`,
          quoted: msg
        })
        return
      }

      const articles = data.articles.slice(0, 5)
      const newsList = articles.map((article, index) => {
        return `*${index + 1}. ${article.title}*\n📰 ${article.source.name}\n🔗 ${article.url}`
      }).join('\n\n')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       📰 LATEST NEWS    ║
╚════════════════════════╝

${topic ? `🔍 *Topic: ${topic}*\n\n` : '🌍 *Top Headlines*\n\n'}${newsList}

_News powered by GNews API_`,
        detectLinks: true,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to fetch news: ${err.message}`,
        quoted: msg
      })
    }
  }
}