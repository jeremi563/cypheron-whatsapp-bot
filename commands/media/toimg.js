import sharp from 'sharp'
import { downloadMediaMessage } from 'gifted-baileys'
import pino from 'pino'
import config from '../../config.js'

export default {
  name: 'toimg',
  ownerOnly: false,
  description: 'Convert sticker to image',
  async execute(sock, chatJid, sender, msg) {

    // check if message is a sticker or reply to a sticker
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const stickerMsg =
      msg.message?.stickerMessage ||
      quotedMsg?.stickerMessage

    if (!stickerMsg) {
      await sock.sendMessage(chatJid, {
        text: `❌ Please reply to a sticker with *${config.prefix}toimg*`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Converting sticker to image...',
        quoted: msg
      })

      const targetMsg = msg.message?.stickerMessage
        ? msg
        : {
            key: msg.message.extendedTextMessage.contextInfo.stanzaId,
            message: quotedMsg
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

      // convert webp to png using sharp
      const pngBuffer = await sharp(buffer)
        .png()
        .toBuffer()

      await sock.sendMessage(chatJid, {
        image: pngBuffer,
        caption: '✅ Here is your image!',
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to convert sticker: ${err.message}`,
        quoted: msg
      })
    }
  }
}