import config from '../../config.js'

export default {
  name: 'groupinfo',
  ownerOnly: false,
  description: 'Show group information',
  async execute(sock, chatJid, sender, msg) {

    // only works in groups
    if (!chatJid.endsWith('@g.us')) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command can only be used in groups.',
        quoted: msg
      })
      return
    }

    try {
      const groupMetadata = await sock.groupMetadata(chatJid)
      const admins = groupMetadata.participants
        .filter(p => p.admin)
        .map(p => `@${p.id.replace('@s.whatsapp.net', '')}`)
        .join('\n')

      const totalMembers = groupMetadata.participants.length
      const totalAdmins = groupMetadata.participants.filter(p => p.admin).length
      const createdAt = new Date(groupMetadata.creation * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      📊 GROUP INFO      ║
╚════════════════════════╝

📌 *Name:* ${groupMetadata.subject}
📝 *Description:*
${groupMetadata.desc || 'No description set'}

👥 *Members:* ${totalMembers}
👑 *Admins:* ${totalAdmins}
📅 *Created:* ${createdAt}

👑 *Admin List:*
${admins || 'None'}`,
        mentions: groupMetadata.participants
          .filter(p => p.admin)
          .map(p => p.id),
        quoted: msg
      })
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to get group info: ${err.message}`,
        quoted: msg
      })
    }
  }
}