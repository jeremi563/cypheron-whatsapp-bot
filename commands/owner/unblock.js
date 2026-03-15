import config from '../../config.js'

export default {
  name: 'unblock',
  ownerOnly: true,
  description: 'Unblock a user',
  async execute(sock, chatJid, sender, msg) {

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant

    const target = mentionedJid || quotedSender

    if (!target) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please mention a user or reply to their message.

*Usage:*
- ${config.prefix}unblock @user
- Reply to a message with ${config.prefix}unblock`,
        quoted: msg
      })
      return
    }

    try {
      await sock.updateBlockStatus(target, 'unblock')
      const targetNumber = target.replace('@s.whatsapp.net', '')

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