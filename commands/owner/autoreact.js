import config from '../../config.js'

let autoReactEnabled = config.autoReact

export default {
  name: 'autoreact',
  ownerOnly: true,
  description: 'Toggle auto react to private messages',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autoreact on — enable auto react
- ${config.prefix}autoreact off — disable auto react

*Status:* ${autoReactEnabled ? '🟢 ON' : '🔴 OFF'}

*Current Emojis:*
${config.reactEmojis.join(' ')}`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (autoReactEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto react is already *ON!*\nType *${config.prefix}autoreact off* to disable.`
        }, { quoted: msg })
        return
      }

      autoReactEnabled = true
      config.autoReact = true

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

✅ *Auto react is now ON!*

Every private message will be reacted to with a random emoji from:
${config.reactEmojis.join(' ')}

Type *${config.prefix}autoreact off* to disable.`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!autoReactEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto react is already *OFF!*\nType *${config.prefix}autoreact on* to enable.`
        }, { quoted: msg })
        return
      }

      autoReactEnabled = false
      config.autoReact = false

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

🔴 *Auto react is now OFF!*

Type *${config.prefix}autoreact on* to enable.`
      }, { quoted: msg })
    }
  }
}