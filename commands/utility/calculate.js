import config from '../../config.js'

export default {
  name: 'calculate',
  ownerOnly: false,
  description: 'Perform math calculations',
  async execute(sock, chatJid, sender, msg, commands, args) {
    const expression = args.join(' ')

    if (!expression) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a math expression.

*Usage:* ${config.prefix}calculate <expression>
*Example:* ${config.prefix}calculate 2 + 2`
      }, { quoted: msg })
      return
    }

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().,%^ MathsqrtceilflooroundPIabspow\s]/g, '')
      const result = eval(sanitized)

      if (result === undefined || result === null || isNaN(result)) {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not calculate. Please check your expression.'
        }, { quoted: msg })
        return
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      🧮 CALCULATOR      ║
╚════════════════════════╝

📝 *Expression:*
\`\`\`
${expression}
\`\`\`

✅ *Result:*
\`\`\`
${result}
\`\`\``
      }, { quoted: msg })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Invalid expression: ${err.message}`
      }, { quoted: msg })
    }
  }
}