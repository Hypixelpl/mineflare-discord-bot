# 📦 Complete Installation Guide for Minecraft Discord Bot

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Bot Setup](#bot-setup)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Bot](#running-the-bot)
6. [Dashboard Setup](#dashboard-setup)
7. [Troubleshooting](#troubleshooting)
8. [Testing](#testing)

---

## Prerequisites

Before you start, ensure you have the following installed:

### Required Software
- **Node.js** (v16.0.0 or higher)
  - Download: https://nodejs.org/
  - Verify: `node -v` and `npm -v`
- **Git** (for cloning the repository)
  - Download: https://git-scm.com/
  - Verify: `git --version`
- **Java** (1.8, 11, 16, 17, or 21)
  - Download: https://www.java.com/en/download/
  - Verify: `java -version`

### Discord Setup
- A Discord Server where you have Administrator permissions
- A Discord Bot Token (see [Creating a Discord Bot](#creating-a-discord-bot) below)

---

## Creating a Discord Bot

### Step 1: Create Application on Discord Developer Portal

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** button
3. Enter a name (e.g., "Minecraft Bot")
4. Click **"Create"**

### Step 2: Create Bot User

1. Go to the **"Bot"** section in the left sidebar
2. Click **"Add Bot"**
3. Under the **TOKEN** section, click **"Copy"** to copy your bot token
4. **SAVE THIS TOKEN SECURELY** - You'll need it for configuration

### Step 3: Configure Bot Permissions

1. Go to **OAuth2** → **URL Generator** in the left sidebar
2. Select these scopes:
   - `bot`
   - `applications.commands`
3. Select these permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Manage Messages
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### Step 4: Get Required IDs

1. **Enable Developer Mode** in Discord:
   - User Settings → Advanced → Enable Developer Mode
2. **Get Your Guild ID**:
   - Right-click your server name → Copy Server ID
3. **Get Your Client ID**:
   - Go back to Discord Developer Portal
   - Copy the **Client ID** from the General Information page

---

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Hypixelpl/mineflare-discord-bot.git

# Navigate to the project directory
cd mineflare-discord-bot
```

### Step 2: Install Dependencies

```bash
# Install all required dependencies
npm install

# This will install:
# - discord.js (Discord API wrapper)
# - @discordjs/rest (REST API utilities)
# - discord-api-types (Type definitions)
# - dotenv (Environment variable management)
# - TypeScript (TypeScript compiler)
# - ts-node (TypeScript execution runtime)
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your credentials:
```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_guild_id_here
CLIENT_ID=your_client_id_here
```

**⚠️ SECURITY WARNING**: Never commit your `.env` file to version control!

---

## Configuration

### Understanding the Structure

```
mineflare-discord-bot/
├── src/
│   ├── index.ts              # Main bot file
│   ├── deploy-commands.ts    # Command deployment
│   └── systems/              # Automation systems
│       ├── TradingSystem.ts
│       ├── EnchantingSystem.ts
│       ├── BrewingSystem.ts
│       ├── FishingSystem.ts
│       ├── MobFarmSystem.ts
│       ├── AutoMiningSystem.ts
│       ├── PathfindingSystem.ts
│       ├── BlockBuildingSystem.ts
│       └── ...
├── web/
│   ├── index.html            # Dashboard HTML
│   ├── dashboard.js          # Dashboard JavaScript
│   └── styles.css            # Dashboard styling
├── commands.json             # Command definitions
├── package.json              # Project dependencies
└── .env                       # Environment variables
```

### Customizing the Bot

Edit `src/index.ts` to customize:
- Bot presence/status
- Command responses
- Embed colors and styling
- Default settings

---

## Running the Bot

### Development Mode (with auto-reload)

```bash
# Install ts-node globally (optional)
npm install -g ts-node

# Run in development mode
npm run dev

# Output should show:
# ✅ Bot logged in as YourBotName#0000
```

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Deploy commands to Discord
npm run deploy-commands

# Start the bot
npm start
```

### First Run Checklist

- [ ] Bot appears online in your Discord server
- [ ] Bot has all required permissions
- [ ] Commands appear in Discord (type `/`)
- [ ] No error messages in console

---

## Dashboard Setup

### Running the Web Dashboard

The dashboard is a simple static website. You can serve it using:

#### Option 1: Using Python (Recommended for Testing)
```bash
cd web

# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option 2: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Serve the web directory
http-server web -p 3000
```

#### Option 3: Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `web/index.html`
3. Select "Open with Live Server"

### Accessing the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Troubleshooting

### Bot Won't Start

**Error**: `DISCORD_TOKEN not set in .env file`
- **Solution**: Verify your `.env` file exists and has the correct token

**Error**: `Cannot find module 'discord.js'`
- **Solution**: Run `npm install` again
- **Check**: Verify `node_modules/` folder exists

### Commands Not Appearing

**Problem**: Slash commands don't show in Discord
- **Solution 1**: Run `npm run deploy-commands`
- **Solution 2**: Restart Discord completely
- **Solution 3**: Check bot has "applications.commands" scope

### Permission Errors

**Error**: `Bot missing permissions`
- **Solution**: Re-invite bot with correct scopes:
  1. Go to OAuth2 → URL Generator
  2. Select `bot` and `applications.commands` scopes
  3. Select all permissions needed
  4. Copy and visit the generated URL

### Dashboard Not Loading

**Problem**: Dashboard shows blank page
- **Solution 1**: Check console for JavaScript errors (F12)
- **Solution 2**: Verify correct port (3000)
- **Solution 3**: Clear browser cache (Ctrl+Shift+Del)

### Java Version Issues

**Error**: `Java version not detected`
- **Solution 1**: Ensure Java is installed: `java -version`
- **Solution 2**: Add Java to system PATH
- **Solution 3**: Set Java path in environment variables

---

## Testing

### Testing Commands in Discord

1. **Status Command**
   ```
   /status
   ```
   - Should show green "Online" indicator

2. **Join Command**
   ```
   /join server:play.hypixel.net java-version:17 account-type:offline
   ```
   - Should create bot instance
   - Should show connection status

3. **Help Command**
   ```
   /help
   ```
   - Should list all available commands

4. **Stats Command**
   ```
   /stats
   ```
   - Should show your statistics

### Testing Systems

```bash
# Run tests (if available)
npm test

# Check TypeScript compilation
npm run build

# Expected: No errors in console
```

### Dashboard Testing

1. Navigate to `http://localhost:3000`
2. Check all sections load correctly:
   - Overview
   - Instances
   - Trading
   - Enchanting
   - Brewing
   - Fishing
   - Mob Farm
   - Pathfinding
   - Minecraft View
3. Test interactive features
4. Verify responsive design on mobile

---

## Advanced Configuration

### Environment Variables

```env
# Required
DISCORD_TOKEN=your_token
GUILD_ID=your_guild_id
CLIENT_ID=your_client_id

# Optional (for future use)
DASHBOARD_PORT=3000
API_PORT=5000
LOG_LEVEL=info
```

### Customizing Bot Behavior

Edit system files in `src/systems/` to customize:
- Drop rates in MobFarmSystem.ts
- Potion types in BrewingSystem.ts
- Fish types in FishingSystem.ts
- Mining speeds in AutoMiningSystem.ts

---

## Next Steps

1. ✅ Bot is installed and running
2. ✅ Dashboard is accessible
3. 🔄 Customize systems to your needs
4. 📊 Monitor bot performance
5. 🚀 Deploy to production server

---

## Support & Issues

- **Issues**: https://github.com/Hypixelpl/mineflare-discord-bot/issues
- **Documentation**: Check README.md
- **Discord**: Join our server for support

---

**Made with ❤️ by NeoNinja_**
