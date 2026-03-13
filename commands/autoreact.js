import config from '../config.js'

export default {
  name: 'autoreact',
  ownerOnly: true,
  description: 'Toggle auto react to private messages',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autoreact on — enable auto react
- ${config.prefix}autoreact off — disable auto react

*Status:* ${config.autoReact ? '🟢 ON' : '🔴 OFF'}

*Current Emojis:*
${config.reactEmojis.join(' ')}`,
        quoted: msg
      })
      return
    }

    if (option === 'on') {
      if (config.autoReact) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto react is already *ON!*\nType *${config.prefix}autoreact off* to disable it.`,
          quoted: msg
        })
        return
      }

      config.autoReact = true

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

✅ *Auto react is now ON!*

Every private message will be
reacted to with a random emoji from:
${config.reactEmojis.join(' ')}

Type *${config.prefix}autoreact off* to disable.`,
        quoted: msg
      })

    } else if (option === 'off') {
      if (!config.autoReact) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto react is already *OFF!*\nType *${config.prefix}autoreact on* to enable it.`,
          quoted: msg
        })
        return
      }

      config.autoReact = false

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⚡ AUTO REACT       ║
╚════════════════════════╝

🔴 *Auto react is now OFF!*

Type *${config.prefix}autoreact on* to enable.`,
        quoted: msg
      })
    }

  }
}