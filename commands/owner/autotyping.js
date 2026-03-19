import config from '../../config.js'

// ✅ read initial state from config
let autotypingEnabled = config.autoTyping

export function isAutotypingEnabled() {
  return autotypingEnabled
}

export async function sendTyping(sock, chatJid) {
  if (!autotypingEnabled) return
  try {
    await sock.sendPresenceUpdate('composing', chatJid)
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
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║     ⌨️  AUTO TYPING     ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autotyping on
- ${config.prefix}autotyping off

*Status:* ${autotypingEnabled ? '🟢 ON' : '🔴 OFF'}

_When enabled the bot appears to be typing when someone sends a message_`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (autotypingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto typing is already *ON!*`
        }, { quoted: msg })
        return
      }
      autotypingEnabled = true
      await sock.sendMessage(chatJid, {
        text:
`✅ *Auto typing is now ON!*

The bot will appear to be typing whenever someone sends a message.

Type *${config.prefix}autotyping off* to disable.`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!autotypingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto typing is already *OFF!*`
        }, { quoted: msg })
        return
      }
      autotypingEnabled = false
      await sock.sendMessage(chatJid, {
        text: `🔴 *Auto typing is now OFF!*`
      }, { quoted: msg })
    }
  }
}