# Minecraft Discord Bot

A powerful Discord bot for managing Minecraft servers with advanced automation systems.

## 🎯 Features

### Core Features
✅ **Server Status Monitoring** - Real-time status checks  
✅ **Multi-Java Support** - Java 1.8, 11, 16, 17, 21  
✅ **Offline Account Support** - Auto-generate or custom usernames  
✅ **Premium & Cracked Support** - Choose account type  
✅ **Custom Join Messages** - Personalized join notifications  
✅ **Multi-Instance Support** - Run up to 10 bot instances simultaneously  

### Advanced Automation Systems

#### 💰 Trading System
- Automated trading with merchants
- Profit tracking and statistics
- Real-time profit monitoring
- Trade history logging

#### ✨ Enchanting System
- Automatic item enchanting
- Job queue management
- Cost tracking
- Batch processing

#### 🧪 Brewing System
- Automated potion brewing
- Batch management
- Ingredient tracking
- Production statistics

#### 🎣 Fishing System
- Automated fishing with different catch rarities
- Value tracking for caught fish
- Rarity distribution
- Profit calculations

#### 💀 Mob Farm System
- Automated mob farming
- XP farming and tracking
- Drop collection
- Efficiency monitoring

#### 🗺️ Pathfinding System
- Advanced waypoint-based navigation
- Multi-destination routing
- Distance tracking
- Coordinate management

### Web Dashboard
- Real-time system monitoring
- Instance overview
- Live statistics
- Beautiful responsive UI

## 📦 Installation

### Prerequisites
- Node.js 16.0.0+
- Discord Bot Token
- Java (any supported version)

### Setup

```bash
# Clone repository
git clone https://github.com/Hypixelpl/mineflare-discord-bot.git
cd mineflare-discord-bot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build TypeScript
npm run build

# Deploy commands
npm run deploy-commands

# Start bot
npm start
```

## 🎮 Commands

### Server Management
- `/status [server]` - Check server status
- `/join <server> [options]` - Join a server with bot account
- `/leave` - Disconnect bot
- `/instances` - View all running instances

### Automation Systems
- `/trading status` - Trading system status
- `/enchanting status` - Enchanting system status
- `/brewing status` - Brewing system status
- `/fishing status` - Fishing system status
- `/mobfarm status` - Mob farm system status
- `/pathfinding addwaypoint <name> <x> <y> <z>` - Add waypoint
- `/pathfinding status` - Pathfinding status

## 🌐 Web Dashboard

Access the dashboard at `http://localhost:3000` after starting the bot.

The dashboard displays:
- Active bot instances
- Trading statistics
- Enchanting queue
- Brewing progress
- Fishing results
- Mob farm efficiency
- Waypoint navigation

## 📋 Join Command Options

```
/join server:play.minecraft.com
      java-version:17
      account-type:offline
      username:CustomName
      message:"Joining the server!"
```

### Options
- `server` (required) - Server address
- `java-version` (optional) - 1.8, 11, 16, 17, 21 (default: 17)
- `account-type` (optional) - offline, premium, cracked (default: cracked)
- `username` (optional) - Custom name (auto-generated if offline)
- `message` (optional) - Custom join message

## 🔧 Configuration

### Environment Variables
```env
DISCORD_TOKEN=your_token_here
GUILD_ID=your_guild_id
CLIENT_ID=your_client_id
```

### Java Version Detection
The bot automatically detects installed Java versions. If detection fails, it uses:
- Java 1.8, 11, 16, 17, 21

## 📊 System Metrics

Each automation system tracks:
- **Time-based metrics** - Duration, uptime
- **Production metrics** - Items/hour, profit/hour
- **Resource metrics** - Total cost, total drops
- **Status indicators** - Active, paused, stopped

## 🐛 Troubleshooting

### Bot won't start
- Verify `DISCORD_TOKEN` in `.env`
- Check Node.js version: `node -v` (16.0.0+)

### Commands not appearing
- Run `npm run deploy-commands`
- Ensure bot has slash command permissions

### Java version not detected
- Install Java or add to PATH
- Bot uses defaults if detection fails

### Too many instances
- Max 10 instances allowed
- Stop some bots with `/leave`

## 📝 License

MIT

## 🤝 Support

For issues or features, create an issue on GitHub.
