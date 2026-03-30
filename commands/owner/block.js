import config from '../../config.js'

export default {
  name: 'block',
  ownerOnly: true,
  description: 'Block a user',
  async execute(sock, chatJid, sender, msg, commands, args) {

    // ✅ method 1: @mention
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    // ✅ method 2: reply to a message (works in groups AND private)
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant
    const quotedRemoteJid = msg.message?.extendedTextMessage?.contextInfo?.remoteJid

    // ✅ method 3: plain number argument e.g. !block 254712345678
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
- ${config.prefix}block @user
- Reply to a message with ${config.prefix}block
- ${config.prefix}block 254712345678`,
        quoted: msg
      })
      return
    }

    // ✅ normalize JIDs for safe comparison
    const normalizeJid = (jid) => jid?.split(':')[0]?.split('@')[0]?.replace(/\D/g, '') || ''

    // ✅ prevent blocking the bot itself
    const botNumber = sock.user?.id ? normalizeJid(sock.user.id) : ''
    if (botNumber && normalizeJid(target) === botNumber) {
      await sock.sendMessage(chatJid, {
        text: '❌ You cannot block the bot itself.',
        quoted: msg
      })
      return
    }

    // ✅ prevent blocking the owner
    if (config.owner && normalizeJid(target) === normalizeJid(config.owner)) {
      await sock.sendMessage(chatJid, {
        text: '❌ You cannot block the bot owner.',
        quoted: msg
      })
      return
    }

    try {
      await sock.updateBlockStatus(target, 'block')
      const targetNumber = target.replace('@s.whatsapp.net', '').replace('@lid', '')

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