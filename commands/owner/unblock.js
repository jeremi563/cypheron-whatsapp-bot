import config from '../../config.js'

export default {
  name: 'unblock',
  ownerOnly: true,
  description: 'Unblock a user',
  async execute(sock, chatJid, sender, msg, commands, args) {

    // ✅ method 1: @mention
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    // ✅ method 2: reply to a message (works in groups AND private)
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant
    const quotedRemoteJid = msg.message?.extendedTextMessage?.contextInfo?.remoteJid

    // ✅ method 3: plain number argument e.g. !unblock 254712345678
    let argTarget = null
    if (args && args.length > 0) {
      const rawNumber = args[0].replace(/[^0-9]/g, '')
      if (rawNumber.length >= 7) {
        argTarget = rawNumber + '@s.whatsapp.net'
      }
    }

    const target = mentionedJid || quotedParticipant || quotedRemoteJid || argTarget

    if (!target) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please mention a user, reply to their message, or provide a number.

*Usage:*
- ${config.prefix}unblock @user
- Reply to a message with ${config.prefix}unblock
- ${config.prefix}unblock 254712345678`,
        quoted: msg
      })
      return
    }

    try {
      await sock.updateBlockStatus(target, 'unblock')
      const targetNumber = target.replace('@s.whatsapp.net', '').replace('@lid', '')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ✅ UNBLOCKED       ║
╚════════════════════════╝

✅ Successfully unblocked @${targetNumber}

_They can now send messages to this number again._`,
        mentions: [target],
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to unblock user: ${err.message}`,
        quoted: msg
      })
    }
  }
}