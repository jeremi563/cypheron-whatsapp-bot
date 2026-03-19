import config from '../../config.js'

// ✅ read initial state from config
let autorecordingEnabled = config.autoRecording

export function isAutorecordingEnabled() {
  return autorecordingEnabled
}

export async function sendRecording(sock, chatJid) {
  if (!autorecordingEnabled) return
  try {
    await sock.sendPresenceUpdate('recording', chatJid)
    setTimeout(async () => {
      try {
        await sock.sendPresenceUpdate('paused', chatJid)
      } catch {}
    }, 3000)
  } catch (err) {
    console.error('Autorecording error:', err.message)
  }
}

export default {
  name: 'autorecording',
  ownerOnly: true,
  description: 'Toggle auto recording indicator when someone messages',
  async execute(sock, chatJid, sender, msg, commands, args) {

    const option = args[0]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    🎙️  AUTO RECORDING   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autorecording on
- ${config.prefix}autorecording off

*Status:* ${autorecordingEnabled ? '🟢 ON' : '🔴 OFF'}

_When enabled the bot appears to be recording when someone sends a message_`
      }, { quoted: msg })
      return
    }

    if (option === 'on') {
      if (autorecordingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto recording is already *ON!*`
        }, { quoted: msg })
        return
      }
      autorecordingEnabled = true
      await sock.sendMessage(chatJid, {
        text:
`✅ *Auto recording is now ON!*

Type *${config.prefix}autorecording off* to disable.`
      }, { quoted: msg })

    } else if (option === 'off') {
      if (!autorecordingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto recording is already *OFF!*`
        }, { quoted: msg })
        return
      }
      autorecordingEnabled = false
      await sock.sendMessage(chatJid, {
        text: `🔴 *Auto recording is now OFF!*`
      }, { quoted: msg })
    }
  }
}