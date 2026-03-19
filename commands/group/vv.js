import { downloadMediaMessage } from 'gifted-baileys'
import pino from 'pino'
import { isAntiViewOnceGroupEnabled } from '../owner/antiviewonce.js'

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
        text: '❌ Anti view once is not enabled for groups.'
      }, { quoted: msg })
      return
    }

    // ✅ check if replying to a message
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quotedMsg) {
      await sock.sendMessage(chatJid, {
        text: '❌ Please reply to a view once message with *.vv*'
      }, { quoted: msg })
      return
    }

    // ✅ check if quoted message is view once
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
      // ✅ get the actual media message inside view once
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

      // ✅ remove viewOnce flag so it can be downloaded
      mediaMsg.viewOnce = false

      const targetMsg = {
        key: msg.message.extendedTextMessage.contextInfo.stanzaId,
        message: viewOnceMsg
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

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to reveal view once: ${err.message}`
      }, { quoted: msg })
    }
  }
}