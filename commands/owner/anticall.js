import config from '../../config.js'

let antiCallEnabled = config.antiCall || false

export function isAntiCallEnabled() {
  return antiCallEnabled
}

export default {
  name: 'anticall',
  ownerOnly: true,
  description: 'Toggle auto reject incoming calls',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      📵 ANTI CALL       ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}anticall on — enable auto reject
- ${config.prefix}anticall off — disable auto reject

*Status:* ${antiCallEnabled ? '🟢 ON' : '🔴 OFF'}

*How it works:*
📞 Voice calls → Auto rejected
📹 Video calls → Auto rejected

_Caller sees a busy signal and the call is rejected silently._`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (antiCallEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Anti call is already *ON!*\nType *${config.prefix}anticall off* to disable.`
        }, { quoted: msg })
        return
      }

      antiCallEnabled = true
      config.antiCall = true

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      📵 ANTI CALL       ║
╚════════════════════════╝

✅ *Anti call is now ON!*

All incoming voice and video calls will be automatically rejected.

Type *${config.prefix}anticall off* to disable.`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!antiCallEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Anti call is already *OFF!*\nType *${config.prefix}anticall on* to enable.`
        }, { quoted: msg })
        return
      }

      antiCallEnabled = false
      config.antiCall = false

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      📵 ANTI CALL       ║
╚════════════════════════╝

🔴 *Anti call is now OFF!*

Incoming calls will no longer be rejected.

Type *${config.prefix}anticall on* to enable.`
      }, { quoted: msg })
    }
  }
}