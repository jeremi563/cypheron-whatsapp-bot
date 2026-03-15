import config from '../../config.js'

// store which groups have goodbye enabled
const goodbyeGroups = new Map()

export function isGoodbyeEnabled(groupJid) {
  return goodbyeGroups.get(groupJid) || false
}

export function handleGoodbye(sock, groupJid, participants, groupMetadata) {
  if (!goodbyeGroups.get(groupJid)) return

  for (const participant of participants) {
    const number = participant.replace('@s.whatsapp.net', '')
    sock.sendMessage(groupJid, {
      text:
`╔════════════════════════╗
║    👋 GOODBYE MESSAGE   ║
╚════════════════════════╝

@${number} has left *${groupMetadata.subject}*. 👋

We will miss you! Hope to see you again someday.`,
      mentions: [participant]
    })
  }
}

export default {
  name: 'goodbye',
  ownerOnly: false,
  description: 'Toggle goodbye message when members leave',
  async execute(sock, chatJid, sender, msg) {

    if (!chatJid.endsWith('@g.us')) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command can only be used in groups.',
        quoted: msg
      })
      return
    }

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    if (!option || (option !== 'on' && option !== 'off')) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║    👋 GOODBYE MESSAGE   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}goodbye on — enable goodbye
- ${config.prefix}goodbye off — disable goodbye

*Status:* ${goodbyeGroups.get(chatJid) ? '🟢 ON' : '🔴 OFF'}`,
        quoted: msg
      })
      return
    }

    goodbyeGroups.set(chatJid, option === 'on')

    await sock.sendMessage(chatJid, {
      text: `${option === 'on' ? '✅' : '🔴'} Goodbye message is now *${option.toUpperCase()}* for this group.`,
      quoted: msg
    })
  }
}