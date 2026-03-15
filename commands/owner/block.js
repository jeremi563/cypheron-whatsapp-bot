import config from '../../config.js'

export default {
  name: 'block',
  ownerOnly: true,
  description: 'Block a user',
  async execute(sock, chatJid, sender, msg) {

    // get mentioned user or quoted message sender
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant

    const target = mentionedJid || quotedSender

    if (!target) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please mention a user or reply to their message.

*Usage:*
- ${config.prefix}block @user
- Reply to a message with ${config.prefix}block`,
        quoted: msg
      })
      return
    }

    // prevent blocking yourself
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    if (target === botNumber) {
      await sock.sendMessage(chatJid, {
        text: '❌ You cannot block the bot itself.',
        quoted: msg
      })
      return
    }

    // prevent blocking the owner
    if (target === config.owner) {
      await sock.sendMessage(chatJid, {
        text: '❌ You cannot block the bot owner.',
        quoted: msg
      })
      return
    }

    try {
      await sock.updateBlockStatus(target, 'block')
      const targetNumber = target.replace('@s.whatsapp.net', '')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       🚫 BLOCKED        ║
╚════════════════════════╝

✅ Successfully blocked @${targetNumber}

_They can no longer send messages to this number._`,
        mentions: [target],
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to block user: ${err.message}`,
        quoted: msg
      })
    }
  }
}