import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { downloadMediaMessage } from 'gifted-baileys'
import { createWriteStream, unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'
import config from '../../config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic)

export default {
  name: 'tomp3',
  ownerOnly: false,
  description: 'Extract audio from video',
  async execute(sock, chatJid, sender, msg) {

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const videoMsg =
      msg.message?.videoMessage ||
      quotedMsg?.videoMessage

    if (!videoMsg) {
      await sock.sendMessage(chatJid, {
        text: `❌ Please reply to a video with *${config.prefix}tomp3*`,
        quoted: msg
      })
      return
    }

    try {
      await sock.sendMessage(chatJid, {
        text: '⏳ Extracting audio from video...',
        quoted: msg
      })

      const targetMsg = msg.message?.videoMessage
        ? msg
        : {
            key: msg.message.extendedTextMessage.contextInfo.stanzaId,
            message: quotedMsg
          }

      // download the video
      const buffer = await downloadMediaMessage(
        targetMsg,
        'buffer',
        {},
        {
          logger: pino({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      )

      // save video to temp file
      const tempVideo = join(__dirname, `../../temp_${Date.now()}.mp4`)
      const tempAudio = join(__dirname, `../../temp_${Date.now()}.mp3`)

      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(tempVideo)
        writeStream.write(buffer)
        writeStream.end()
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      // convert video to mp3
      await new Promise((resolve, reject) => {
        ffmpeg(tempVideo)
          .output(tempAudio)
          .audioCodec('libmp3lame')
          .on('end', resolve)
          .on('error', reject)
          .run()
      })

      // read the mp3 file
      const { readFileSync } = await import('fs')
      const audioBuffer = readFileSync(tempAudio)

      await sock.sendMessage(chatJid, {
        audio: audioBuffer,
        mimetype: 'audio/mp4',
        ptt: false,
        quoted: msg
      })

      // cleanup temp files
      if (existsSync(tempVideo)) unlinkSync(tempVideo)
      if (existsSync(tempAudio)) unlinkSync(tempAudio)

    } catch (err) {
      await sock.sendMessage(chatJid, {
        text: `❌ Failed to extract audio: ${err.message}`,
        quoted: msg
      })
    }
  }
}