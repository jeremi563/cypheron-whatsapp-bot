import { readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import chalk from 'chalk'
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function loadCommandFiles(dir, commands) {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const isDirectory = statSync(filePath).isDirectory()

    if (isDirectory) {
      await loadCommandFiles(filePath, commands)
    } else if (file.endsWith('.js')) {
      try {
        // ✅ convert Windows path to file:// URL for ES module compatibility
        const command = await import(pathToFileURL(filePath).href)
        commands.set(command.default.name, command.default)
        console.log(chalk.green(`✅ Loaded command: ${command.default.name}`))
      } catch (err) {
        console.log(chalk.red(`❌ Failed to load command ${file}: ${err.message}`))
      }
    }
  }
}

export async function loadCommands() {
  const commands = new Map()
  const commandsDir = join(__dirname, 'commands')

  await loadCommandFiles(commandsDir, commands)

  console.log(chalk.cyan(`ℹ️  Total commands loaded: ${commands.size}`))
  return commands
}

export function isOwner(sender) {
  if (!sender) return false

  // ✅ clean sender — handle all possible JID formats
  // handles: 254712345678@s.whatsapp.net
  // handles: 254712345678:5@s.whatsapp.net
  // handles: 254712345678@lid
  // handles: 186784386445322@lid
  const senderNumber = sender
    .replace('@s.whatsapp.net', '')
    .replace('@lid', '')
    .replace('@g.us', '')
    .split(':')[0]
    .trim()

  // ✅ clean owner number from config
  const ownerNumber = config.owner
    .replace('@s.whatsapp.net', '')
    .replace('@lid', '')
    .replace('@g.us', '')
    .split(':')[0]
    .trim()

  const isMatch = senderNumber === ownerNumber

  if (!isMatch) {
    // ✅ debug log to see what is being compared
    console.log(
      chalk.yellow(`⚠️  Owner check failed — sender: ${senderNumber} | owner: ${ownerNumber}`)
    )
  }

  return isMatch
}