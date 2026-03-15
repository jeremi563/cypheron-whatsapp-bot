import config from '../../config.js'

let autorecordingEnabled = false

export function isAutorecordingEnabled() {
  return autorecordingEnabled
}

export async function sendRecording(sock, chatJid) {
  if (!autorecordingEnabled) return
  try {
    await sock.sendPresenceUpdate('recording', chatJid)
    // stop recording after 3 seconds
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
║    🎙️  AUTO RECORDING   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}autorecording on — enable auto recording
- ${config.prefix}autorecording off — disable auto recording

*Status:* ${autorecordingEnabled ? '🟢 ON' : '🔴 OFF'}

_When enabled the bot will appear to be recording audio whenever someone sends a message_`,
        quoted: msg
      })
      return
    }

    if (option === 'on') {
      if (autorecordingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto recording is already *ON!*\nType *${config.prefix}autorecording off* to disable.`,
          quoted: msg
        })
        return
      }

      autorecordingEnabled = true

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    🎙️  AUTO RECORDING   ║
╚════════════════════════╝

✅ *Auto recording is now ON!*

The bot will appear to be recording audio whenever someone sends a message in both private and group chats.

Type *${config.prefix}autorecording off* to disable.`,
        quoted: msg
      })

    } else if (option === 'off') {
      if (!autorecordingEnabled) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ Auto recording is already *OFF!*\nType *${config.prefix}autorecording on* to enable.`,
          quoted: msg
        })
        return
      }

      autorecordingEnabled = false

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    🎙️  AUTO RECORDING   ║
╚════════════════════════╝

🔴 *Auto recording is now OFF!*

Type *${config.prefix}autorecording on* to enable.`,
        quoted: msg
      })
    }
  }
}