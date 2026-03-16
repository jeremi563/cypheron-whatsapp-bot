export default {
  name: 'whoami',
  ownerOnly: false,
  description: 'Show your WhatsApp JID',
  async execute(sock, chatJid, sender, msg) {
    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║       🔍 WHO AM I       ║
╚════════════════════════╝

📱 *Your JID:*
\`\`\`
${sender}
\`\`\`

💬 *Chat JID:*
\`\`\`
${chatJid}
\`\`\`

🔑 *Message Key:*
\`\`\`
${JSON.stringify(msg.key, null, 2)}
\`\`\``,
      quoted: msg
    })
  }
}