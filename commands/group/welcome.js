import config from '../../config.js'

// store which groups have welcome enabled
const welcomeGroups = new Map()

export function isWelcomeEnabled(groupJid) {
  return welcomeGroups.get(groupJid) || false
}

export function handleWelcome(sock, groupJid, participants, groupMetadata) {
  if (!welcomeGroups.get(groupJid)) return

  for (const participant of participants) {
    const number = participant.replace('@s.whatsapp.net', '')
    sock.sendMessage(groupJid, {
      text:
`╔════════════════════════╗
║    👋 WELCOME MESSAGE   ║
╚════════════════════════╝

Welcome to *${groupMetadata.subject}* @${number}! 🎉

We are happy to have you here.
Please read the group rules and enjoy your stay!

Type *${config.prefix}rules* to see the rules.`,
      mentions: [participant]
    })
  }
}

export default {
  name: 'welcome',
  ownerOnly: false,
  description: 'Toggle welcome message for new members',
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
║    👋 WELCOME MESSAGE   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}welcome on — enable welcome
- ${config.prefix}welcome off — disable welcome

*Status:* ${welcomeGroups.get(chatJid) ? '🟢 ON' : '🔴 OFF'}`,
        quoted: msg
      })
      return
    }

    welcomeGroups.set(chatJid, option === 'on')

    await sock.sendMessage(chatJid, {
      text: `${option === 'on' ? '✅' : '🔴'} Welcome message is now *${option.toUpperCase()}* for this group.`,
      quoted: msg
    })
  }
}