import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import config from '../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'menu',
  ownerOnly: false,
  description: 'Show all available commands',
  async execute(sock, chatJid, sender, msg, commands) {

    const now = new Date()
    const time = now.toLocaleTimeString()
    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // separate commands into owner only and public
    const ownerCommands = [...commands.values()]
      .filter(cmd => cmd.ownerOnly && cmd.name !== 'menu')
      .map((cmd, index) => `│  ${index + 1}. ${config.prefix}${cmd.name} — ${cmd.description}`)
      .join('\n')

    const publicCommands = [...commands.values()]
      .filter(cmd => !cmd.ownerOnly && cmd.name !== 'menu')
      .map((cmd, index) => `│  ${index + 1}. ${config.prefix}${cmd.name} — ${cmd.description}`)
      .join('\n')

    const menuText =
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

📅 ${date}
🕐 ${time}

╔════════════════════════╗
║    🌍 PUBLIC COMMANDS   ║
╠════════════════════════╣
${publicCommands}
╚════════════════════════╝

╔════════════════════════╗
║  👑 OWNER COMMANDS      ║
╠════════════════════════╣
${ownerCommands}
╚════════════════════════╝

╔════════════════════════╗
║  💡 Type any command   ║
║  above to get started  ║
╚════════════════════════╝

_Powered by Cypheron Bot_`

    const image = readFileSync(join(__dirname, '../assets/bot.jpg'))

    await sock.sendMessage(chatJid, {
      image: image,
      caption: menuText,
      quoted: msg
    })

  }
}
