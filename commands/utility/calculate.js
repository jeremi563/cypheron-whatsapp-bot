import config from '../../config.js'

export default {
  name: 'calculate',
  ownerOnly: false,
  description: 'Perform math calculations',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const expression = text.slice(config.prefix.length + 'calculate'.length).trim()

    if (!expression) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide a math expression.

*Usage:* ${config.prefix}calculate <expression>

*Examples:*
- ${config.prefix}calculate 2 + 2
- ${config.prefix}calculate 10 * 5
- ${config.prefix}calculate 100 / 4
- ${config.prefix}calculate 2 ** 10
- ${config.prefix}calculate Math.sqrt(144)
- ${config.prefix}calculate Math.PI * 5 ** 2`,
        quoted: msg
      })
      return
    }

    try {
      // sanitize the expression — only allow safe math characters
      const sanitized = expression.replace(/[^0-9+\-*/().,%^ MathsqrtceilflooroundPIabspow\s]/g, '')

      if (!sanitized) {
        await sock.sendMessage(chatJid, {
          text: '❌ Invalid expression. Only mathematical operations are allowed.',
          quoted: msg
        })
        return
      }

      const result = eval(sanitized)

      if (result === undefined || result === null || isNaN(result)) {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not calculate. Please check your expression.',
          quoted: msg
        })
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
\`\`\``,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Invalid expression.

*Error:* ${err.message}

*Valid examples:*
- ${config.prefix}calculate 2 + 2
- ${config.prefix}calculate 10 * 5 - 3
- ${config.prefix}calculate Math.sqrt(16)`,
        quoted: msg
      })
    }
  }
}