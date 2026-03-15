import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { downloadMediaMessage } from 'gifted-baileys'
import { createWriteStream, unlinkSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'
import config from '../../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

ffmpeg.setFfmpegPath(ffmpegStatic)

export default {
  name: 'tovideo',
  ownerOnly: false,
  description: 'Convert audio to video',
  async execute(sock, chatJid, sender, msg) {

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const audioMsg =
      msg.message?.audioMessage ||
      quotedMsg?.audioMessage

    if (!audioMsg) {
      await sock.sendMessage(chatJid, {
        text: `❌ Please reply to an audio with *${config.prefix}tovideo*`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Converting audio to video...',
        quoted: msg
      })

      const targetMsg = msg.message?.audioMessage
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

      const tempAudio = join(__dirname, `../../temp_${Date.now()}.mp3`)
      const tempVideo = join(__dirname, `../../temp_${Date.now()}.mp4`)

      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(tempAudio)
        writeStream.write(buffer)
        writeStream.end()
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      // convert audio to video with black background
      await new Promise((resolve, reject) => {
        ffmpeg(tempAudio)
          .inputOptions(['-f', 'lavfi', '-i', 'color=c=black:s=640x360'])
          .complexFilter(['[1:a][0:v]'])
          .output(tempVideo)
          .outputOptions(['-shortest'])
          .on('end', resolve)
          .on('error', reject)
          .run()
      })

      const videoBuffer = readFileSync(tempVideo)

      await sock.sendMessage(chatJid, {
        video: videoBuffer,
        caption: '✅ Here is your video!',
        quoted: msg
      })

      if (existsSync(tempAudio)) unlinkSync(tempAudio)
      if (existsSync(tempVideo)) unlinkSync(tempVideo)

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to convert audio: ${err.message}`,
        quoted: msg
      })
    }
  }
}