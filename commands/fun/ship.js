import config from '../../config.js'

function getShipEmoji(percentage) {
  if (percentage >= 90) return '💍 Soulmates!'
  if (percentage >= 75) return '❤️ Perfect match!'
  if (percentage >= 60) return '😍 Great chemistry!'
  if (percentage >= 45) return '🙂 Pretty good!'
  if (percentage >= 30) return '😐 It could work...'
  if (percentage >= 15) return '😬 Hmm... maybe not'
  return '💔 Not a good match!'
}

function getShipBar(percentage) {
  const filled = Math.floor(percentage / 10)
  const empty = 10 - filled
  return '❤️'.repeat(filled) + '🖤'.repeat(empty)
}

export default {
  name: 'ship',
  ownerOnly: false,
  description: 'Calculate love percentage between two people',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    // need exactly two mentions
    if (mentions.length < 2) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please mention two people to ship!

*Usage:* ${config.prefix}ship @person1 @person2
*Example:* ${config.prefix}ship @john @jane`,
        quoted: msg
      })
      return
    }

    const person1 = mentions[0]
    const person2 = mentions[1]
    const number1 = person1.replace('@s.whatsapp.net', '')
    const number2 = person2.replace('@s.whatsapp.net', '')

    // generate a consistent percentage based on both numbers
    const combined = number1 + number2
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash)
    }
    const percentage = Math.abs(hash % 101)

    const emoji = getShipEmoji(percentage)
    const bar = getShipBar(percentage)

    await sock.sendMessage(chatJid, {
      text:
`╔════════════════════════╗
║      💕 SHIP METER      ║
╚════════════════════════╝

@${number1}
💞 + 💞
@${number2}

${bar}
💯 *${percentage}%* compatibility

${emoji}

_Love calculator powered by Cypheron 💕_`,
      mentions: [person1, person2],
      quoted: msg
    })
  }
}