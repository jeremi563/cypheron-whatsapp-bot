import sharp from 'sharp'
import { downloadMediaMessage } from 'gifted-baileys'
import pino from 'pino'
import config from '../../config.js'

export default {
  name: 'sticker',
  ownerOnly: false,
  description: 'Convert image or video to sticker',
  async execute(sock, chatJid, sender, msg) {

    // check if message has an image or is a reply to an image
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imageMsg =
      msg.message?.imageMessage ||
      quotedMsg?.imageMessage

    if (!imageMsg) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please send an image with *${config.prefix}sticker* as caption or reply to an image with *${config.prefix}sticker*`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Converting to sticker...',
        quoted: msg
      })

      // download the image
      const targetMsg = msg.message?.imageMessage
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

      // convert to webp using sharp
      const webpBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp()
        .toBuffer()

      await sock.sendMessage(chatJid, {
        sticker: webpBuffer,
        quoted: msg
      })

      // delete the loading message
    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to create sticker: ${err.message}`,
        quoted: msg
      })
    }
  }
}