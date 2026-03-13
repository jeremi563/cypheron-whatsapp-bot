# 🤖 Cypheron WhatsApp Bot

A powerful WhatsApp bot built with Node.js and gifted-baileys.

## Features
- ✅ Auto bio with live clock
- ✅ Auto view, like and reply to statuses
- ✅ Auto react to private messages
- ✅ Auto welcome message with cooldown
- ✅ Contact presence tracker
- ✅ Command prefix system
- ✅ Owner only commands
- ✅ Group and private chat support

## Installation

1. Clone the repo
\`\`\`bash
git clone https://github.com/jeremi563/cypheron-whatsapp-bot.git
cd cypheron-bot
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Update config.js with your details
\`\`\`js
const config = {
  prefix: '!',
  botName: 'CYPHERON',
  owner: 'YOUR_NUMBER@s.whatsapp.net',
}
\`\`\`

4. Run the bot
\`\`\`bash
npm start
\`\`\`

5. Scan the QR code with your WhatsApp

## Commands

### 🌍 Public Commands
| Command | Description |
|---|---|
| !menu | Show all commands |
| !ping | Check if bot is alive |
| !hello | Greet the bot |
| !time | Get current time |
| !date | Get current date |

### 👑 Owner Commands
| Command | Description |
|---|---|
| !autobio on/off | Toggle live auto bio |
| !autoreact on/off | Toggle auto react |
| !autostatus | Manage status settings |
| !track | Track contact presence |

## Project Structure
\`\`\`
cypheron-bot/
├── assets/
├── commands/
│   ├── autobio.js
│   ├── autoreact.js
│   ├── autostatus.js
│   ├── date.js
│   ├── hello.js
│   ├── menu.js
│   ├── ping.js
│   ├── time.js
│   └── track.js
├── config.js
├── cooldown.js
├── handler.js
├── index.js
├── presence.js
└── package.json
\`\`\`

## ⚠️ Important
- Never share your `auth_info` folder
- Never push `auth_info` to GitHub
- Keep your `config.js` owner number private

## Built With
- [Node.js](https://nodejs.org)
- [gifted-baileys](https://github.com/giftedtech/gifted-baileys)
- [chalk](https://github.com/chalk/chalk)
- [ora](https://github.com/sindresorhus/ora)
```
