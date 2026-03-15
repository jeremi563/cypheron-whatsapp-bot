import config from '../../config.js'

export default {
  name: 'eval',
  ownerOnly: true,
  description: 'Run JavaScript code',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const code = text.slice(config.prefix.length + 'eval'.length).trim()

    if (!code) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide code to evaluate.

*Usage:* ${config.prefix}eval <code>
*Example:* ${config.prefix}eval 2 + 2`,
        quoted: msg
      })
      return
    }

    try {
      // evaluate the code
      let result = eval(code)

      // if result is a promise wait for it
      if (result instanceof Promise) {
        result = await result
      }

      // convert result to string
      if (typeof result === 'object') {
        result = JSON.stringify(result, null, 2)
      }

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ⚡ EVAL RESULT     ║
╚════════════════════════╝

*Input:*
\`\`\`
${code}
\`\`\`

*Output:*
\`\`\`
${result}
\`\`\``,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║      ❌ EVAL ERROR      ║
╚════════════════════════╝

*Input:*
\`\`\`
${code}
\`\`\`

*Error:*
\`\`\`
${err.message}
\`\`\``,
        quoted: msg
      })
    }
  }
}