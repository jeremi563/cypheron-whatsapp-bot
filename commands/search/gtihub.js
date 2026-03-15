import config from '../../config.js'

export default {
  name: 'github',
  ownerOnly: false,
  description: 'Search GitHub repositories',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const query = text.slice(config.prefix.length + 'github'.length).trim()

    if (!query) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a search query.

*Usage:* ${config.prefix}github <query>
*Example:* ${config.prefix}github whatsapp bot nodejs`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: `⏳ Searching GitHub for *${query}*...`,
        quoted: msg
      })

      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CypheronBot'
          }
        }
      )

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        await sock.sendMessage(chatJid, {
          text: `❌ No repositories found for *${query}*.`,
          quoted: msg
        })
        return
      }

      const repos = data.items.slice(0, 5)
      const repoList = repos.map((repo, index) => {
        return (
`*${index + 1}. ${repo.full_name}*
📝 ${repo.description || 'No description'}
⭐ ${repo.stargazers_count.toLocaleString()} stars | 🍴 ${repo.forks_count.toLocaleString()} forks
💻 ${repo.language || 'Unknown'}
🔗 ${repo.html_url}`
        )
      }).join('\n\n')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     🐙 GITHUB SEARCH    ║
╚════════════════════════╝

🔍 *Query:* ${query}
📊 *Total Results:* ${data.total_count.toLocaleString()}

${repoList}

_Powered by GitHub API_`,
        detectLinks: true,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to search GitHub: ${err.message}`,
        quoted: msg
      })
    }
  }
}