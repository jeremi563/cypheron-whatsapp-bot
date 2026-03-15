import QRCode from 'qrcode'
import config from '../../config.js'

export default {
  name: 'qr',
  ownerOnly: false,
  description: 'Generate a QR code from text or URL',
  async execute(sock, chatJid, sender, msg) {

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || ''

    const content = text.slice(config.prefix.length + 'qr'.length).trim()

    if (!content) {
      await sock.sendMessage(chatJid, {
        text:
`❌ Please provide text or URL to convert.

*Usage:* ${config.prefix}qr <text or url>

*Examples:*
- ${config.prefix}qr Hello World
- ${config.prefix}qr https://github.com/jeremi563/my-bot
- ${config.prefix}qr +254712345678`,
        quoted: msg
      })
      return
    }

    if (content.length > 500) {
      await sock.sendMessage(chatJid, {
        text: '❌ Text is too long. Maximum 500 characters.',
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Generating QR code...',
        quoted: msg
      })

      // generate QR code as buffer
      const qrBuffer = await QRCode.toBuffer(content, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })

      await sock.sendMessage(chatJid, {
        image: qrBuffer,
        caption:
`✅ *QR Code Generated!*

📝 *Content:*
${content}

_Scan with any QR code reader_`,
        quoted: msg
      })

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to generate QR code: ${err.message}`,
        quoted: msg
      })
    }
  }
}