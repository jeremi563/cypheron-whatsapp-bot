import { execSync, spawn } from 'child_process'
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs'
import { createInterface } from 'readline'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ✅ colors without chalk dependency
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
}

const c = (color, text) => `${colors[color]}${text}${colors.reset}`
const bold = (text) => `${colors.bright}${text}${colors.reset}`

// ✅ sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ✅ animated spinner
async function spinner(text, task, successText) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let i = 0
  let done = false
  let error = null

  const interval = setInterval(() => {
    process.stdout.write(
      `\r${c('cyan', frames[i % frames.length])} ${c('white', text)}   `
    )
    i++
  }, 80)

  try {
    await task()
  } catch (err) {
    error = err
  }

  clearInterval(interval)

  if (error) {
    process.stdout.write(`\r${c('red', '✗')} ${c('red', text)}\n`)
    throw error
  } else {
    process.stdout.write(`\r${c('green', '✓')} ${c('green', successText || text)}\n`)
  }
}

// ✅ progress bar
async function progressBar(text, steps, delay = 50) {
  const total = 30
  process.stdout.write(`\n${c('cyan', text)}\n`)

  for (let i = 0; i <= total; i++) {
    const filled = '█'.repeat(i)
    const empty = '░'.repeat(total - i)
    const percent = Math.floor((i / total) * 100)
    process.stdout.write(
      `\r${c('green', filled)}${c('white', empty)} ${c('yellow', percent + '%')}`
    )
    await sleep(delay)
  }
  process.stdout.write('\n')
}

// ✅ typewriter effect
async function typewrite(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(char)
    await sleep(delay)
  }
  process.stdout.write('\n')
}

// ✅ welcome banner
async function showBanner() {
  console.clear()
  await sleep(300)

  const banner = `
${c('green', '╔══════════════════════════════════════════════════╗')}
${c('green', '║')}${c('cyan', bold('          ⚡ CYPHERON BOT — SETUP WIZARD           '))}${c('green', '║')}
${c('green', '╠══════════════════════════════════════════════════╣')}
${c('green', '║')}${c('white', '    A powerful WhatsApp bot built with Node.js     ')}${c('green', '║')}
${c('green', '║')}${c('white', '    and Gifted Baileys library                      ')}${c('green', '║')}
${c('green', '╠══════════════════════════════════════════════════╣')}
${c('green', '║')}${c('yellow', '    👤 Developer : Jeremia Obed                    ')}${c('green', '║')}
${c('green', '║')}${c('yellow', '    🌐 GitHub    : github.com/jeremi563/my-bot     ')}${c('green', '║')}
${c('green', '║')}${c('yellow', '    📢 Channel   : whatsapp.com/channel/...        ')}${c('green', '║')}
${c('green', '║')}${c('yellow', '    📦 Version   : 1.0.0                           ')}${c('green', '║')}
${c('green', '╚══════════════════════════════════════════════════╝')}
`

  for (const line of banner.split('\n')) {
    console.log(line)
    await sleep(50)
  }

  await sleep(500)
}

// ✅ check Node.js version
async function checkNodeVersion() {
  await spinner('Checking Node.js version...', async () => {
    const version = process.version
    const major = parseInt(version.slice(1).split('.')[0])

    if (major < 20) {
      throw new Error(
        `Node.js ${version} is not supported. Please upgrade to Node.js v20 or higher.`
      )
    }
  }, `Node.js ${process.version} detected — OK`)
}

// ✅ check required files
async function checkRequiredFiles() {
  const requiredFiles = [
    { path: 'index.js', name: 'Main bot file' },
    { path: 'config.js', name: 'Config file' },
    { path: 'handler.js', name: 'Command handler' },
    { path: 'package.json', name: 'Package.json' },
    { path: 'assets/bot.jpg', name: 'Bot image' },
    { path: 'assets/startup.mp3', name: 'Startup audio' },
  ]

  const missing = []

  await spinner('Checking required files...', async () => {
    for (const file of requiredFiles) {
      if (!existsSync(join(__dirname, file.path))) {
        missing.push(file.name)
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`)
    }
  }, 'All required files found — OK')
}

// ✅ create .env file
async function createEnvFile() {
  await spinner('Setting up environment variables...', async () => {
    const envPath = join(__dirname, '.env')
    const examplePath = join(__dirname, '.env.example')

    if (existsSync(envPath)) {
      // .env already exists — skip
      return
    }

    if (existsSync(examplePath)) {
      copyFileSync(examplePath, envPath)
    } else {
      // create a default .env file
      writeFileSync(envPath,
`# Cypheron Bot Environment Variables
# Copy this file and fill in your values

# Your WhatsApp Session ID
# Get it from: https://cypheron-session.onrender.com
SESSION_ID=

# News API Key (free at gnews.io)
GNEWS_API_KEY=

# Movie API Key (free at omdbapi.com)
OMDB_API_KEY=
`
      )
    }
  }, '.env file created — OK')
}

// ✅ install dependencies
async function installDependencies() {
  console.log(`\n${c('cyan', '📦 Installing dependencies...')}\n`)

  await progressBar('Preparing installation...', 10, 20)

  await new Promise((resolve, reject) => {
    const install = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['install'],
      { stdio: 'pipe' }
    )

    install.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`npm install failed with code ${code}`))
      }
    })

    install.on('error', reject)
  })

  console.log(`${c('green', '✓')} ${c('green', 'Dependencies installed successfully — OK')}`)
}

// ✅ prompt user to fill .env
async function promptEnvSetup() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ask = (question) => new Promise(resolve => {
    rl.question(question, resolve)
  })

  console.log(`\n${c('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}`)
  console.log(c('yellow', bold('  ⚙️  CONFIGURATION')))
  console.log(`${c('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`)

  await typewrite(
    c('white', '  Please provide your bot configuration details:'),
    20
  )

  console.log(
    `\n  ${c('cyan', '1.')} Get your Session ID from:\n     ${c('green', 'https://cypheron-session.onrender.com')}`
  )
  console.log(
    `\n  ${c('cyan', '2.')} Get free News API key from:\n     ${c('green', 'https://gnews.io')}`
  )
  console.log(
    `\n  ${c('cyan', '3.')} Get free Movie API key from:\n     ${c('green', 'https://omdbapi.com/apikey.aspx')}\n`
  )

  console.log(`${c('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`)

  const sessionId = await ask(
    `  ${c('cyan', '🔑 Session ID')} ${c('white', '(leave empty to use web panel):')} `
  )

  const gnewsKey = await ask(
    `  ${c('cyan', '📰 GNews API Key')} ${c('white', '(leave empty to skip):')} `
  )

  const omdbKey = await ask(
    `  ${c('cyan', '🎬 OMDB API Key')} ${c('white', '(leave empty to skip):')} `
  )

  rl.close()

  // write values to .env
  const envContent =
`# Cypheron Bot Environment Variables

# Your WhatsApp Session ID
SESSION_ID=${sessionId.trim()}

# News API Key (free at gnews.io)
GNEWS_API_KEY=${gnewsKey.trim()}

# Movie API Key (free at omdbapi.com)
OMDB_API_KEY=${omdbKey.trim()}
`

  writeFileSync(join(__dirname, '.env'), envContent)

  console.log(`\n${c('green', '✓')} ${c('green', 'Configuration saved to .env file')}`)
}

// ✅ show completion screen
async function showCompletion() {
  await sleep(300)

  console.log(`\n${c('green', '╔══════════════════════════════════════════════════╗')}`)
  console.log(`${c('green', '║')}${c('cyan', bold('          ✅ SETUP COMPLETE!                       '))}${c('green', '║')}`)
  console.log(`${c('green', '╠══════════════════════════════════════════════════╣')}`)
  console.log(`${c('green', '║')}${c('white', '                                                  ')}${c('green', '║')}`)
  console.log(`${c('green', '║')}${c('white', '  🤖 Cypheron Bot is ready to launch!             ')}${c('green', '║')}`)
  console.log(`${c('green', '║')}${c('white', '                                                  ')}${c('green', '║')}`)
  console.log(`${c('green', '║')}${c('yellow', '  Starting bot in 3 seconds...                    ')}${c('green', '║')}`)
  console.log(`${c('green', '║')}${c('white', '                                                  ')}${c('green', '║')}`)
  console.log(`${c('green', '╚══════════════════════════════════════════════════╝')}\n`)
}

// ✅ countdown before starting bot
async function countdown() {
  for (let i = 3; i > 0; i--) {
    process.stdout.write(
      `\r  ${c('cyan', '⏳')} Starting in ${c('yellow', bold(i.toString()))} seconds...   `
    )
    await sleep(1000)
  }
  process.stdout.write(`\r  ${c('green', '🚀')} Starting Cypheron Bot...              \n\n`)
  await sleep(500)
}

// ✅ start the bot
function startBot() {
  const bot = spawn(
    process.platform === 'win32' ? 'node.exe' : 'node',
    ['index.js'],
    { stdio: 'inherit' }
  )

  bot.on('close', (code) => {
    if (code !== 0) {
      console.log(`\n${c('red', `Bot exited with code ${code}`)}`)
    }
  })
}

// ✅ main setup function
async function main() {
  try {

    // show banner
    await showBanner()

    console.log(`${c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}`)
    console.log(c('cyan', bold('  🔍 RUNNING CHECKS')))
    console.log(`${c('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`)

    // step 1 — check node version
    await checkNodeVersion()

    // step 2 — check required files
    await checkRequiredFiles()

    // step 3 — create .env file
    await createEnvFile()

    // step 4 — install dependencies
    await installDependencies()

    // step 5 — prompt for configuration
    // only if .env has empty SESSION_ID
    const envContent = existsSync(join(__dirname, '.env'))
      ? readFileSync(join(__dirname, '.env'), 'utf8')
      : ''

    const hasSessionId = envContent.includes('SESSION_ID=') &&
      !envContent.includes('SESSION_ID=\n') &&
      !envContent.includes('SESSION_ID= ')

    if (!hasSessionId) {
      await promptEnvSetup()
    } else {
      console.log(`\n${c('green', '✓')} ${c('green', 'Configuration already set — OK')}`)
    }

    // step 6 — show completion
    await showCompletion()

    // step 7 — countdown and start
    await countdown()

    // step 8 — start the bot
    startBot()

  } catch (err) {
    console.log(`\n${c('red', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}`)
    console.log(`${c('red', bold('  ❌ SETUP FAILED'))}`)
    console.log(`${c('red', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`)
    console.log(`  ${c('red', err.message)}\n`)
    console.log(`  ${c('yellow', 'Please fix the error above and run setup again.')}`)
    console.log(`  ${c('yellow', 'Run: node setup.js')}\n`)
    process.exit(1)
  }
}

main()