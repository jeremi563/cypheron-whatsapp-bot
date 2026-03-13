import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function loadCommands() {
  const commands = new Map()
  const files = readdirSync(join(__dirname, 'commands'))
    .filter(file => file.endsWith('.js'))

  for (const file of files) {
    const command = await import(`./commands/${file}`)
    commands.set(command.default.name, command.default)
    console.log(chalk.green(`✅ Loaded command: ${command.default.name}`))
  }

  console.log(chalk.cyan(`ℹ️  Total commands loaded: ${commands.size}`))
  return commands
}

// helper function to check if a sender is the owner
export function isOwner(sender) {
  // in groups, sender looks like 254712345678@s.whatsapp.net
  // we extract just the number part to compare
  const senderNumber = sender.replace('@s.whatsapp.net', '')
    .replace('@g.us', '')
    .split(':')[0]

  const ownerNumber = config.owner.replace('@s.whatsapp.net', '')

  return senderNumber === ownerNumber
}