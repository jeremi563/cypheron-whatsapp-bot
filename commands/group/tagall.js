import config from '../../config.js'

export default {
  name: 'tagall',
  ownerOnly: false,
  description: 'Tag all members in a group',
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
      // ✅ get group metadata
      const groupMetadata = await sock.groupMetadata(chatJid)
      const participants = groupMetadata.participants
      const groupName = groupMetadata.subject

      // ✅ get custom message from args or use default
      const customMessage = args.length > 0 ? args.join(' ') : '📢 Attention everyone!'

      // ✅ build mentions list
      const mentions = participants.map(p => p.id)

      // ✅ build tag list
      const tagList = participants.map(p => {
        const number = p.id.replace('@s.whatsapp.net', '').replace('@lid', '')
        return `@${number}`
      }).join('\n')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      📢 TAG ALL         ║
╚════════════════════════╝

👥 *Group:* ${groupName}
👤 *Tagged by:* @${sender.replace('@s.whatsapp.net', '').replace('@lid', '')}
📊 *Members:* ${participants.length}

💬 *Message:*
${customMessage}

━━━━━━━━━━━━━━━━━━━━━━━━

${tagList}

━━━━━━━━━━━━━━━━━━━━━━━━
📢 *Follow our channel:*
https://whatsapp.com/channel/0029VbCHhynLSmbdAmqOD438`,
        mentions: [...mentions, sender]
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to tag all members: ${err.message}`
      }, { quoted: msg })
    }
  }
}