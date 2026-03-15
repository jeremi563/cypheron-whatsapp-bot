import config from '../../config.js'

// track which chats have autotyping enabled
let autotypingEnabled = false

export function isAutotypingEnabled() {
  return autotypingEnabled
}

export async function sendTyping(sock, chatJid) {
  if (!autotypingEnabled) return
  try {
    await sock.sendPresenceUpdate('composing', chatJid)
    // stop typing after 3 seconds
    setTimeout(async () => {
      try {
        await sock.sendPresenceUpdate('paused', chatJid)
      } catch {}
    }, 3000)
  } catch (err) {
    console.error('Autotyping error:', err.message)
  }
}

export default {
  name: 'autotyping',
  ownerOnly: true,
  description: 'Toggle auto typing indicator when someone messages',
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
║     ⌨️  AUTO TYPING     ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autotyping on — enable auto typing
- ${config.prefix}autotyping off — disable auto typing

*Status:* ${autotypingEnabled ? '🟢 ON' : '🔴 OFF'}

_When enabled the bot will appear to be typing whenever someone sends a message_`,
        quoted: msg
      })
      return
    }

    if (option === 'on') {
      if (autotypingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto typing is already *ON!*\nType *${config.prefix}autotyping off* to disable.`,
          quoted: msg
        })
        return
      }

      autotypingEnabled = true

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⌨️  AUTO TYPING     ║
╚════════════════════════╝

✅ *Auto typing is now ON!*

The bot will appear to be typing whenever someone sends a message in both private and group chats.

Type *${config.prefix}autotyping off* to disable.`,
        quoted: msg
      })

    } else if (option === 'off') {
      if (!autotypingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto typing is already *OFF!*\nType *${config.prefix}autotyping on* to enable.`,
          quoted: msg
        })
        return
      }

      autotypingEnabled = false

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⌨️  AUTO TYPING     ║
╚════════════════════════╝

🔴 *Auto typing is now OFF!*

Type *${config.prefix}autotyping on* to enable.`,
        quoted: msg
      })
    }
  }
}