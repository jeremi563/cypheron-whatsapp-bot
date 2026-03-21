import config from '../../config.js'

export default {
  name: 'hidetag',
  ownerOnly: false,
  description: 'Tag all members silently without listing numbers',
  async execute(sock, chatJid, sender, msg, commands, args) {

    // ✅ only works in groups
    const isGroup = chatJid.endsWith('@g.us')

    if (!isGroup) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command only works in group chats.'
      }, { quoted: msg })
      return
    }

    try {
      const groupMetadata = await sock.groupMetadata(chatJid)
      const participants = groupMetadata.participants

      // ✅ get custom message from args or use default
      const customMessage = args.length > 0 ? args.join(' ') : '📢 Attention everyone!'

      // ✅ build mentions list — hidden, no numbers shown
      const mentions = participants.map(p => p.id)

      await sock.sendMessage(chatJid, {
        text: customMessage,
        mentions: [...mentions, sender]
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to hidetag: ${err.message}`
      }, { quoted: msg })
    }
  }
}
