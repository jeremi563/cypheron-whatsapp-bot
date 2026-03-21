import pkg from 'gifted-baileys'
import pino from 'pino'
import { isAntiViewOnceGroupEnabled } from '../owner/antiviewonce.js'

const { downloadMediaMessage } = pkg

export default {
  name: 'vv',
  ownerOnly: false,
  description: 'Reveal a view once message in group',
  async execute(sock, chatJid, sender, msg, commands, args) {

    // ✅ only works in groups
    const isGroup = chatJid.endsWith('@g.us')

    if (!isGroup) {
      await sock.sendMessage(chatJid, {
        text: '❌ This command only works in group chats.'
      }, { quoted: msg })
      return
    }

    // ✅ check if group anti view once is enabled
    if (!isAntiViewOnceGroupEnabled()) {
      await sock.sendMessage(chatJid, {
        text: '❌ Anti view once is not enabled for groups.\n\nAsk the owner to run *!antiviewonce group on*'
      }, { quoted: msg })
      return
    }

    // ✅ check if replying to a message
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo
    const quotedMsg = contextInfo?.quotedMessage

    if (!quotedMsg) {
      await sock.sendMessage(chatJid, {
        text: '❌ Please reply to a view once message with *.vv*'
      }, { quoted: msg })
      return
    }

    // ✅ unwrap view once message from quoted context
    const viewOnceMsg =
      quotedMsg?.viewOnceMessage?.message ||
      quotedMsg?.viewOnceMessageV2?.message ||
      quotedMsg?.viewOnceMessageV2Extension?.message

    if (!viewOnceMsg) {
      await sock.sendMessage(chatJid, {
        text: '❌ The replied message is not a view once message.'
      }, { quoted: msg })
      return
    }

    try {
      // ✅ get media inside view once
      const mediaMsg =
        viewOnceMsg.imageMessage ||
        viewOnceMsg.videoMessage ||
        viewOnceMsg.audioMessage

      if (!mediaMsg) {
        await sock.sendMessage(chatJid, {
          text: '❌ Could not extract media from view once message.'
        }, { quoted: msg })
        return
      }

      // ✅ remove viewOnce flag before downloading
      mediaMsg.viewOnce = false

      // ✅ reconstruct the original message for downloading
      const targetMsg = {
        key: {
          remoteJid: chatJid,
          fromMe: false,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant || undefined
        },
        message: {
          // ✅ wrap back into original view once container
          viewOnceMessageV2: {
            message: viewOnceMsg
          }
        }
      }

      const buffer = await downloadMediaMessage(
        targetMsg,
        'buffer',
        {},
        {
          logger: pino({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      )

      const senderNumber = sender.replace('@s.whatsapp.net', '').replace('@lid', '')

      // ✅ resend as normal media
      if (viewOnceMsg.imageMessage) {
        await sock.sendMessage(chatJid, {
          image: buffer,
          caption: `👁️ *View Once revealed by @${senderNumber}*`,
          mentions: [sender]
        })
      } else if (viewOnceMsg.videoMessage) {
        await sock.sendMessage(chatJid, {
          video: buffer,
          caption: `👁️ *View Once revealed by @${senderNumber}*`,
          mentions: [sender]
        })
      } else if (viewOnceMsg.audioMessage) {
        await sock.sendMessage(chatJid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: viewOnceMsg.audioMessage.ptt || false
        })
      }

      log.success(`👁️ View once revealed by ${senderNumber} in ${chatJid}`)

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to reveal view once: ${err.message}`
      }, { quoted: msg })
    }
  }
}