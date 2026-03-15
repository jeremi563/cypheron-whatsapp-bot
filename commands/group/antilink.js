import config from '../../config.js'

// store which groups have antilink enabled
const antilinkGroups = new Map()

// detect if a message contains a link
function containsLink(text) {
  const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|net|org|io|co|me|ly|xyz|info|online|site|web|app|dev)[^\s]*)/gi
  return linkRegex.test(text)
}

// detect WhatsApp group links specifically
function containsGroupLink(text) {
  return text.includes('chat.whatsapp.com')
}

export default {
  name: 'antilink',
  ownerOnly: false,
  description: 'Toggle auto delete links in group',
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
║      🔗 ANTI LINK       ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}antilink on — enable anti link
- ${config.prefix}antilink off — disable anti link

*Status:* ${antilinkGroups.get(chatJid) ? '🟢 ON' : '🔴 OFF'}

_When enabled, any message containing a link will be automatically deleted and the sender will be warned._`,
        quoted: msg
      })
      return
    }

    antilinkGroups.set(chatJid, option === 'on')

    await sock.sendMessage(chatJid, {
      text: `${option === 'on' ? '✅' : '🔴'} Anti link is now *${option.toUpperCase()}* for this group.`,
      quoted: msg
    })
  }
}

// ✅ exported function to check messages for links
export async function checkAntiLink(sock, msg, chatJid, sender) {
  if (!antilinkGroups.get(chatJid)) return
  if (!chatJid.endsWith('@g.us')) return

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || ''

  if (!containsLink(text)) return

  try {
    // check if bot is admin
    const groupMetadata = await sock.groupMetadata(chatJid)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botParticipant = groupMetadata.participants.find(p => p.id === botId)

    if (!botParticipant?.admin) return

    // check if sender is admin — dont delete admin messages
    const senderParticipant = groupMetadata.participants.find(p => p.id === sender)
    if (senderParticipant?.admin) return

    // delete the message
    await sock.sendMessage(chatJid, {
      delete: msg.key
    })

    // warn the sender
    await sock.sendMessage(chatJid, {
      text: `⚠️ @${sender.replace('@s.whatsapp.net', '')} Links are not allowed in this group!`,
      mentions: [sender]
    })
  } catch (err) {
    console.error('Antilink error:', err.message)
  }
}