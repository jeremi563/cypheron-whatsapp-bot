import config from '../../config.js'

export default {
  name: 'getid',
  ownerOnly: true,
  description: 'Get chat or group ID',
  async execute(sock, chatJid, sender, msg) {

    const isGroup = chatJid.endsWith('@g.us')

    if (isGroup) {
      try {
        const groupMetadata = await sock.groupMetadata(chatJid)

        await sock.sendMessage(chatJid, {
          text:
`╔════════════════════════╗
║       🔍 GROUP ID       ║
╚════════════════════════╝

📌 *Group Name:* ${groupMetadata.subject}
🔑 *Group ID:*
\`\`\`
${chatJid}
\`\`\`
👥 *Members:* ${groupMetadata.participants.length}`,
          quoted: msg
        })
      } catch (err) {
        await sock.sendMessage(chatJid, {
          text: `❌ Failed to get group ID: ${err.message}`,
          quoted: msg
        })
      }
    } else {
      const senderNumber = sender.replace('@s.whatsapp.net', '')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       🔍 CHAT ID        ║
╚════════════════════════╝

📱 *Number:* +${senderNumber}
🔑 *Chat ID:*
\`\`\`
${chatJid}
\`\`\`
👤 *Your JID:*
\`\`\`
${sender}
\`\`\``,
        quoted: msg
      })
    }
  }
}
