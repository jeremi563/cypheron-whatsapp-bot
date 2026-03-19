import config from '../../config.js'

export default {
  name: 'base64',
  ownerOnly: false,
  description: 'Encode or decode base64',
  async execute(sock, chatJid, sender, msg, commands, args) {
    const action = args[0]?.toLowerCase()
    const content = args.slice(1).join(' ')

    if (!action || (action !== 'encode' && action !== 'decode') || !content) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide an action and content.

*Usage:*
- ${config.prefix}base64 encode <text>
- ${config.prefix}base64 decode <base64>`
      }, { quoted: msg })
      return
    }

    try {
      let result
      if (action === 'encode') {
        result = Buffer.from(content).toString('base64')
      } else {
        result = Buffer.from(content, 'base64').toString('utf8')
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║       🔢 BASE64         ║
╚════════════════════════╝

⚡ *Action:* ${action.toUpperCase()}

📝 *Input:*
\`\`\`
${content}
\`\`\`

✅ *Result:*
\`\`\`
${result}
\`\`\``
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to ${action}: ${err.message}`
      }, { quoted: msg })
    }
  }
}