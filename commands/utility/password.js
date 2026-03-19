import config from '../../config.js'

export default {
  name: 'password',
  ownerOnly: false,
  description: 'Generate a strong password',
  async execute(sock, chatJid, sender, msg, commands, args) {
    const length = parseInt(args[0]) || 16

    if (length < 6) {
      await sock.sendMessage(chatJid, {
        text: '❌ Password length must be at least 6 characters.'
      }, { quoted: msg })
      return
    }

    if (length > 64) {
      await sock.sendMessage(chatJid, {
        text: '❌ Password length cannot exceed 64 characters.'
      }, { quoted: msg })
      return
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const allChars = lowercase + uppercase + numbers + symbols

    let password =
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      symbols[Math.floor(Math.random() * symbols.length)]

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('')

    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^a-zA-Z0-9]/.test(password)
    const strength = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length

    const strengthLabel =
      strength === 4 && length >= 16 ? '🟢 Very Strong' :
      strength === 4 ? '🟡 Strong' :
      strength === 3 ? '🟠 Medium' : '🔴 Weak'

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║   🔐 PASSWORD GENERATOR ║
╚════════════════════════╝

🔑 *Your Password:*
\`\`\`
${password}
\`\`\`

📏 *Length:* ${length} characters
💪 *Strength:* ${strengthLabel}

⚠️ *Never share your password!*`
    }, { quoted: msg })
  }
}