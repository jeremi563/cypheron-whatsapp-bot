import pkg from 'gifted-baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
import chalk from 'chalk'
import ora from 'ora'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadCommands, isOwner } from './handler.js'
import { shouldWelcome } from './cooldown.js'
import { updatePresence } from './presence.js'
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = pkg

const log = {
  info: (msg) => console.log(chalk.cyan('ℹ️  ' + msg)),
  success: (msg) => console.log(chalk.green('✅ ' + msg)),
  error: (msg) => console.log(chalk.red('❌ ' + msg)),
  warn: (msg) => console.log(chalk.yellow('⚠️  ' + msg)),
  qr: (msg) => console.log(chalk.magenta('📱 ' + msg)),
  reconnect: (msg) => console.log(chalk.blue('🔄 ' + msg)),
}

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  const { version } = await fetchLatestBaileysVersion()
  log.info(`Using WA version: ${chalk.bold(version.join('.'))}`)

  const commands = await loadCommands()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('MyBot'),
    markOnlineOnConnect: false,
  })

  sock.ev.on('creds.update', saveCreds)

  const spinner = ora({
    text: chalk.cyan('Connecting to WhatsApp...'),
    spinner: 'dots12',
    color: 'cyan'
  }).start()

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

    if (qr) {
      spinner.stop()
      console.log(chalk.magenta('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
      qrcode.generate(qr, { small: true })
      console.log(chalk.magenta('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
      log.qr('Scan the QR code above with your WhatsApp')
    }

    if (connection === 'close') {
      spinner.stop()
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        log.reconnect('Connection lost. Reconnecting...')
        startBot()
      } else {
        log.error('Logged out. Delete the auth_info folder and restart.')
      }

    } else if (connection === 'connecting') {
      spinner.text = chalk.cyan('Connecting to WhatsApp...')
      spinner.start()

    } else if (connection === 'open') {
      spinner.succeed(chalk.green('CYPHERON Bot connected successfully!'))
      log.success('Bot is live and ready to receive messages!')
      console.log(chalk.gray('─────────────────────────────────'))

      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const image = readFileSync(join(__dirname, './assets/bot.jpg'))

      await sock.sendMessage(botNumber, {
        image: image,
        caption: `╔════════════════════════╗\n║       🤖 CYPHERON       ║\n╚════════════════════════╝\n\n✅ Cypheron is now connected and ready!\nType *${config.prefix}menu* to see all available commands.`
      })

      const audio = readFileSync(join(__dirname, './assets/startup.mp3'))

      await sock.sendMessage(botNumber, {
        audio: audio,
        mimetype: 'audio/mp4',
        ptt: false
      })

      log.info('Startup message and audio sent to your WhatsApp!')

      // auto start bio if enabled in config
      if (config.autoBio) {
        const { startAutoBio } = await import('./commands/autobio.js')
        startAutoBio(sock)
        log.info('Auto bio started automatically!')
      }

    }

  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    try {

      for (const msg of messages) {

        // ✅ handle status updates separately
        if (msg.key.remoteJid === 'status@broadcast') {
          if (msg.key.fromMe || !msg.message) continue

          const statusPoster = msg.key.participant || msg.key.remoteJid
          log.info(`📺 Status from: ${chalk.yellow(statusPoster)}`)

          // auto view
          if (config.autoViewStatus) {
            try {
              await sock.readMessages([msg.key])
              log.success(`👁️ Auto viewed status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto view error: ${err.message}`)
            }
          }

          // auto like
          if (config.autoLikeStatus) {
            try {
              await sock.sendMessage(statusPoster, {
                react: {
                  text: config.autoLikeEmoji,
                  key: msg.key
                }
              })
              log.success(`❤️ Auto liked status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto like error: ${err.message}`)
            }
          }

          // auto reply
          if (config.autoReplyStatus) {
            try {
              await sock.sendMessage(statusPoster, {
                text: config.autoReplyMessage,
                quoted: msg
              })
              log.success(`💬 Auto replied to status from ${chalk.yellow(statusPoster)}`)
            } catch (err) {
              log.error(`Auto reply error: ${err.message}`)
            }
          }

          continue
        }

        // ✅ handle normal messages
        if (type !== 'notify') continue
        if (!msg.message) continue

        const chatJid = msg.key.remoteJid
        const isGroup = chatJid.endsWith('@g.us')
        const sender = isGroup ? msg.key.participant : chatJid

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text || ''

        const body = text.trim()

        // if message is from self only process if it starts with prefix
        if (msg.key.fromMe && !body.startsWith(config.prefix)) continue

        log.info(`${isGroup ? '👥 Group' : '👤 Private'} | From: ${chalk.yellow(sender)}: ${chalk.white(body)}`)

        // auto welcome logic
        if (!isGroup && !isOwner(sender) && !msg.key.fromMe) {
          if (shouldWelcome(sender)) {
            await sock.sendMessage(chatJid, {
              text:
`╔════════════════════════╗
║       🤖 CYPHERON       ║
╚════════════════════════╝

👋 *Welcome!*

Hey there! I am *Cypheron*, an automated WhatsApp bot.

The owner is currently unavailable but your message has been received.

Type *${config.prefix}menu* to see what I can do for you!

_This is an automated message._`,
              quoted: msg
            })
            log.info(`Welcome message sent to ${chalk.yellow(sender)}`)
          }
        }

        // auto react to private messages
        if (!isGroup && !msg.key.fromMe && config.autoReact) {
          try {
            const randomEmoji = config.reactEmojis[
              Math.floor(Math.random() * config.reactEmojis.length)
            ]

            await sock.sendMessage(chatJid, {
              react: {
                text: randomEmoji,
                key: msg.key
              }
            })

            log.success(`⚡ Auto reacted with ${randomEmoji} to message from ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Auto react error: ${err.message}`)
          }
        }

        // ignore messages that don't start with the prefix
        if (!body.startsWith(config.prefix)) continue

        // extract command name by removing the prefix
        const commandName = body.slice(config.prefix.length).trim().toLowerCase()

        log.info(`Command received: ${chalk.bold(commandName)} from ${chalk.yellow(sender)}`)

        const command = commands.get(commandName)

        if (command) {

          // check if command is owner only
          if (command.ownerOnly && !isOwner(sender)) {
            await sock.sendMessage(chatJid, {
              text: `❌ *This command is for the bot owner only.*`,
              quoted: msg
            })
            log.warn(`Unauthorized use of owner command: ${commandName} by ${sender}`)
            continue
          }

          try {
            await command.execute(sock, chatJid, sender, msg, commands)
            log.success(`Executed command: ${chalk.bold(commandName)} for ${chalk.yellow(sender)}`)
          } catch (err) {
            log.error(`Failed to execute command: ${commandName} — ${err.message}`)
            await sock.sendMessage(chatJid, {
              text: '❌ Something went wrong running that command.',
              quoted: msg
            })
          }

        } else {
          await sock.sendMessage(chatJid, {
            text: `❌ Unknown command *${config.prefix}${commandName}*\n\nType *${config.prefix}menu* to see all available commands.`,
            quoted: msg
          })
        }

      }

    } catch (err) {
      if (err.message?.includes('Bad MAC') || err.message?.includes('decrypt')) return
      log.error(`Unexpected error: ${err.message}`)
    }
  })

  // ✅ listen for presence updates
  sock.ev.on('presence.update', ({ id, presences }) => {
    try {
      for (const [participant, presence] of Object.entries(presences)) {
        const jid = id || participant
        const status = presence.lastKnownPresence

        updatePresence(jid, status)

        log.info(`📡 Presence — ${chalk.yellow(jid)}: ${chalk.bold(status)}`)
      }
    } catch (err) {
      log.error(`Presence update error: ${err.message}`)
    }
  })

}

process.on('uncaughtException', (err) => {
  if (err.message?.includes('Bad MAC') || err.message?.includes('decrypt')) return
  log.error(`Uncaught error: ${err.message}`)
})

process.on('unhandledRejection', (err) => {
  if (err?.message?.includes('Bad MAC') || err?.message?.includes('decrypt')) return
  log.error(`Unhandled rejection: ${err?.message}`)
})

startBot()
