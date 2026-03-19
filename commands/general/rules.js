import config from '../../config.js'

export default {
  name: 'rules',
  ownerOnly: false,
  description: 'Show bot usage rules',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

📋 *Bot Rules*

1️⃣ Do not spam commands
2️⃣ Do not use the bot for illegal activities
3️⃣ Do not abuse or harass other users
4️⃣ Do not attempt to hack or exploit the bot
5️⃣ Respect the bot owner and other users
6️⃣ Do not share your Session ID with anyone
7️⃣ Use commands responsibly

⚠️ *Violation of these rules may result in being blocked.*

_Thank you for using Cypheron! 🤖_`
    }, { quoted: msg })
  }
}