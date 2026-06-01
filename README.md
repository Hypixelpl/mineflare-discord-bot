# Mineflare Discord Bot

A powerful Discord bot for managing Mineflare Minecraft servers with bot account support.

## Features

✅ **Server Status Monitoring** - Real-time status checks for Mineflare servers
✅ **Multi-Java Support** - Works with Java 1.8, 11, 16, 17, and 21
✅ **Offline Account Support** - Auto-generate random usernames or use custom names
✅ **Premium & Cracked Support** - Choose between premium and cracked accounts
✅ **Bot Commands** - Mine, combat, place blocks, and more
✅ **Customizable Join Messages** - Add custom messages when joining servers
✅ **Session Management** - Track and manage multiple bot sessions

## Installation

### Prerequisites
- Node.js 16.0.0 or higher
- Discord Bot Token
- Java installed (any supported version)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Hypixelpl/mineflare-discord-bot.git
cd mineflare-discord-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Discord bot credentials
```

4. **Build the project**
```bash
npm run build
```

5. **Deploy commands**
```bash
npm run deploy-commands
```

6. **Start the bot**
```bash
npm start
```

## Commands

### `/status [server]`
Check the status of a Mineflare server
- `server`: Server address (optional, defaults to play.mineflare.com)

### `/join <server> [java-version] [account-mode] [username] [account-type] [message]`
Join a server with a bot account
- `server`: Server address (required)
- `java-version`: Java version to use (optional, defaults to 17)
- `account-mode`: offline or premium (optional, defaults to offline)
- `username`: Custom username (optional, auto-generated if offline)
- `account-type`: cracked or premium (optional, defaults to cracked)
- `message`: Custom join message (optional)

### `/mine`
Start mining on the server (requires active bot session)

### `/combat [enemy]`
Start combat with enemies
- `enemy`: Type of enemy to fight (optional, defaults to Zombie)

### `/place [block-type]`
Start placing blocks
- `block-type`: Type of block to place (optional, defaults to stone)

### `/leave`
Disconnect the bot from the server

## Java Version Support

The bot automatically detects installed Java versions on your system. Supported versions:
- Java 1.8
- Java 11
- Java 16
- Java 17
- Java 21

## Offline Account Mode

When using offline mode, the bot will:
1. Auto-generate a random username if not provided
2. Create a unique session for each join
3. Support completely offline gameplay

## Configuration

Edit `.env` file with:
```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
CLIENT_ID=your_client_id_here
```

## Troubleshooting

### Bot won't start
- Ensure `DISCORD_TOKEN` is valid in `.env`
- Check Node.js version: `node -v` (should be 16.0.0+)

### Java version not detected
- Install Java manually or add to PATH
- The bot will use default versions if auto-detection fails

### Commands not showing
- Run `npm run deploy-commands` to register commands
- Give the bot proper permissions in Discord

## License

MIT

## Support

For issues and features, please create an issue on the GitHub repository.
