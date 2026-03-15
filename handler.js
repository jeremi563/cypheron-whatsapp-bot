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
  const senderNumber = sender.replace('@s.whatsapp.net', '')
    .replace('@g.us', '')
    .split(':')[0]

  const ownerNumber = config.owner.replace('@s.whatsapp.net', '')

  return senderNumber === ownerNumber
}