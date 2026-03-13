import config from '../config.js'
import {
  startTracking,
  stopTracking,
  getTrackedContacts,
  getPresenceData,
  getAllPresenceData,
  formatDuration,
  formatTime
} from '../presence.js'

export default {
  name: 'track',
  ownerOnly: true,
  description: 'Track online presence of contacts',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const args = text.trim().split(' ')
    const option = args[1]?.toLowerCase()

    // show help if no option provided
    if (!option) {
      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

*Usage:*
- ${config.prefix}track add <number>
- ${config.prefix}track remove <number>
- ${config.prefix}track list
- ${config.prefix}track report
- ${config.prefix}track report <number>
- ${config.prefix}track clear

*Example:*
${config.prefix}track add 254712345678

_Number format: country code + number_
_No + sign, no spaces_`,
        quoted: msg
      })
      return
    }

    // --- ADD A CONTACT TO TRACK ---
    if (option === 'add') {
      const number = args[2]

      if (!number) {
        await sock.sendMessage(chatJid, {
          text: `❌ Please provide a number.\nExample: *${config.prefix}track add 254712345678*`,
          quoted: msg
        })
        return
      }

      // clean the number and build JID
      const cleanNumber = number.replace(/[^0-9]/g, '')
      const jid = `${cleanNumber}@s.whatsapp.net`

      // subscribe to their presence
      await sock.subscribeToPresenceUpdates(jid)

      // start tracking
      startTracking(jid)

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

✅ *Now tracking:* +${cleanNumber}

The bot will now monitor when this
contact comes online and goes offline.

Type *${config.prefix}track report* to see data.`,
        quoted: msg
      })

    // --- REMOVE A CONTACT FROM TRACKING ---
    } else if (option === 'remove') {
      const number = args[2]

      if (!number) {
        await sock.sendMessage(chatJid, {
          text: `❌ Please provide a number.\nExample: *${config.prefix}track remove 254712345678*`,
          quoted: msg
        })
        return
      }

      const cleanNumber = number.replace(/[^0-9]/g, '')
      const jid = `${cleanNumber}@s.whatsapp.net`

      stopTracking(jid)

      await sock.sendMessage(chatJid, {
        text: `🗑️ Stopped tracking: *+${cleanNumber}*`,
        quoted: msg
      })

    // --- LIST ALL TRACKED CONTACTS ---
    } else if (option === 'list') {
      const tracked = getTrackedContacts()

      if (tracked.length === 0) {
        await sock.sendMessage(chatJid, {
          text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

⚠️ No contacts being tracked.

Add one with:
*${config.prefix}track add <number>*`,
          quoted: msg
        })
        return
      }

      const list = tracked
        .map((jid, index) => {
          const data = getPresenceData(jid)
          const number = jid.replace('@s.whatsapp.net', '')
          const status = data?.isOnline ? '🟢 Online' : '🔴 Offline'
          return `│  ${index + 1}. +${number} — ${status}`
        })
        .join('\n')

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

*Tracked Contacts (${tracked.length}):*

${list}

Type *${config.prefix}track report* for full details.`,
        quoted: msg
      })

    // --- GENERATE FULL REPORT ---
    } else if (option === 'report') {
      const specificNumber = args[2]

      if (specificNumber) {

        // report for a specific contact
        const cleanNumber = specificNumber.replace(/[^0-9]/g, '')
        const jid = `${cleanNumber}@s.whatsapp.net`
        const data = getPresenceData(jid)

        if (!data) {
          await sock.sendMessage(chatJid, {
            text: `❌ *+${cleanNumber}* is not being tracked.\nAdd them with: *${config.prefix}track add ${cleanNumber}*`,
            quoted: msg
          })
          return
        }

        // build sessions list
        const sessionsList = data.sessions.length > 0
          ? data.sessions
              .slice(-5) // show last 5 sessions only
              .map((s, i) =>
                `│  ${i + 1}. ${formatTime(s.from)} → ${formatTime(s.to)} (${formatDuration(s.duration)})`
              )
              .join('\n')
          : '│  No sessions recorded yet'

        await sock.sendMessage(chatJid, {
          text:
`╔════════════════════════╗
║   📡 PRESENCE REPORT    ║
╚════════════════════════╝

👤 *Number:* +${cleanNumber}
📶 *Status:* ${data.isOnline ? '🟢 Currently Online' : '🔴 Currently Offline'}
🕐 *Last Online:* ${formatTime(data.lastOnline)}
👁️ *Last Seen:* ${formatTime(data.lastSeen)}
⏱️ *Total Online Time:* ${formatDuration(data.totalOnlineTime)}
📊 *Total Sessions:* ${data.sessions.length}

╔════════════════════════╗
║   🕐 LAST 5 SESSIONS    ║
╠════════════════════════╣
${sessionsList}
╚════════════════════════╝`,
          quoted: msg
        })

      } else {

        // full report for all tracked contacts
        const allData = getAllPresenceData()

        if (allData.length === 0) {
          await sock.sendMessage(chatJid, {
            text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

⚠️ No contacts being tracked yet.

Add one with:
*${config.prefix}track add <number>*`,
            quoted: msg
          })
          return
        }

        const reportLines = allData.map((data, index) => {
          const number = data.jid.replace('@s.whatsapp.net', '')
          return (
`┌─ *${index + 1}. +${number}*
│  Status: ${data.isOnline ? '🟢 Online' : '🔴 Offline'}
│  Last Online: ${formatTime(data.lastOnline)}
│  Last Seen: ${formatTime(data.lastSeen)}
│  Total Online: ${formatDuration(data.totalOnlineTime)}
│  Sessions: ${data.sessions.length}
└────────────────────`
          )
        }).join('\n\n')

        await sock.sendMessage(chatJid, {
          text:
`╔════════════════════════╗
║   📡 PRESENCE REPORT    ║
╚════════════════════════╝

📊 *Tracking ${allData.length} contact(s)*
🕐 *Generated:* ${new Date().toLocaleTimeString()}

${reportLines}

_Type ${config.prefix}track report <number>_
_for a detailed individual report_`,
          quoted: msg
        })
      }

    // --- CLEAR ALL TRACKED CONTACTS ---
    } else if (option === 'clear') {
      const tracked = getTrackedContacts()

      if (tracked.length === 0) {
        await sock.sendMessage(chatJid, {
          text: `⚠️ No contacts are currently being tracked.`,
          quoted: msg
        })
        return
      }

      // stop tracking all contacts
      tracked.forEach(jid => stopTracking(jid))

      await sock.sendMessage(chatJid, {
        text:
`╔════════════════════════╗
║   📡 PRESENCE TRACKER   ║
╚════════════════════════╝

🗑️ *All tracked contacts cleared!*

${tracked.length} contact(s) removed from tracking.`,
        quoted: msg
      })

    } else {
      await sock.sendMessage(chatJid, {
        text: `❌ Unknown option. Type *${config.prefix}track* to see all options.`,
        quoted: msg
      })
    }

  }
}