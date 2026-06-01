import { Client, GatewayIntentBits, EmbedBuilder, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

import { TradingSystem } from './systems/TradingSystem';
import { EnchantingSystem } from './systems/EnchantingSystem';
import { BrewingSystem } from './systems/BrewingSystem';
import { FishingSystem } from './systems/FishingSystem';
import { MobFarmSystem } from './systems/MobFarmSystem';
import { PathfindingSystem } from './systems/PathfindingSystem';
import { MultiInstanceManager } from './systems/MultiInstanceManager';
import { MinecraftViewManager } from './systems/MinecraftViewManager';
import { AutoMiningSystem } from './systems/AutoMiningSystem';
import { StatsManager } from './systems/StatsManager';

dotenv.config();

const execAsync = promisify(exec);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize all systems
const tradingSystem = new TradingSystem();
const enchantingSystem = new EnchantingSystem();
const brewingSystem = new BrewingSystem();
const fishingSystem = new FishingSystem();
const mobFarmSystem = new MobFarmSystem();
const pathfindingSystem = new PathfindingSystem();
const instanceManager = new MultiInstanceManager();
const minecraftViewManager = new MinecraftViewManager();
const autoMiningSystem = new AutoMiningSystem();
const statsManager = new StatsManager();

// Store active bot sessions (unlimited bots per user)
const activeBots = new Map<string, any[]>();

// Generate random username for offline mode
function generateRandomUsername(): string {
  const adjectives = ['Swift', 'Brave', 'Lucky', 'Noble', 'Clever', 'Mighty', 'Silent', 'Bold', 'Fierce', 'Wise'];
  const nouns = ['Player', 'Miner', 'Fighter', 'Explorer', 'Slayer', 'Champion', 'Warrior', 'Nomad', 'Ranger', 'Scout'];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
}

// Get server status from Mineflare
async function getServerStatus(serverAddress: string): Promise<any> {
  try {
    const { stdout } = await execAsync(`ping -c 1 ${serverAddress}`);
    const latencyMatch = stdout.match(/time=([\d.]+)ms/);
    return {
      online: true,
      address: serverAddress,
      status: '🟢 Online',
      latency: latencyMatch ? parseFloat(latencyMatch[1]).toFixed(2) : 'Unknown'
    };
  } catch (error) {
    return {
      online: false,
      address: serverAddress,
      status: '🔴 Offline',
      latency: 'N/A'
    };
  }
}

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user?.tag}`);
  client.user?.setPresence({
    activities: [{ name: 'Mineflare Servers 🎮 | Made by NeoNinja_', type: ActivityType.Watching }],
    status: 'online'
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // STATUS COMMAND
    if (interaction.commandName === 'status') {
      await interaction.deferReply();
      const serverAddress = interaction.options.getString('server') || 'play.mineflare.com';
      const status = await getServerStatus(serverAddress);

      const embed = new EmbedBuilder()
        .setTitle('🖥️ Server Status Monitor')
        .setDescription(`Checking status for **${status.address}**`)
        .addFields(
          { name: '📊 Status', value: `${status.status}`, inline: true },
          { name: '✅ Online', value: status.online ? 'Yes ✓' : 'No ✗', inline: true },
          { name: '⚡ Latency', value: `\`\`${status.latency}ms\`\``, inline: true }
        )
        .setColor(status.online ? '#00FF00' : '#FF0000')
        .setFooter({ text: '🎮 Made by NeoNinja_ | Mineflare Discord Bot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }

    // JOIN COMMAND - Support unlimited bots
    if (interaction.commandName === 'join') {
      const serverAddress = interaction.options.getString('server');
      const botCount = interaction.options.getInteger('count') || 1;
      const javaVersion = interaction.options.getString('java-version') || '17';
      const accountMode = interaction.options.getString('account-mode') || 'offline';
      const customUsername = interaction.options.getString('username');
      const accountType = interaction.options.getString('account-type') || 'cracked';
      const joinMessage = interaction.options.getString('message') || 'Joining Mineflare server...';

      if (!serverAddress) {
        return await interaction.reply({
          content: '❌ Server address is required!',
          ephemeral: true
        });
      }

      await interaction.deferReply();

      const userId = interaction.user.id;
      const userBots = activeBots.get(userId) || [];
      const createdSessions = [];

      for (let i = 0; i < botCount; i++) {
        let username = customUsername;
        if (!username || accountType === 'cracked') {
          username = generateRandomUsername();
        } else if (botCount > 1) {
          username = `${customUsername}${i + 1}`;
        }

        const sessionId = `${userId}-${Date.now()}-${i}`;
        const instance = instanceManager.createInstance(sessionId, username, serverAddress, javaVersion);

        if (instance) {
          const viewSession = minecraftViewManager.createViewSession(sessionId, {
            username,
            server: serverAddress,
            java: javaVersion,
            accountType,
            status: 'joining'
          });

          createdSessions.push({
            sessionId,
            username,
            instance,
            viewSession
          });
        }
      }

      if (createdSessions.length === 0) {
        return await interaction.editReply({
          content: '❌ Failed to create bot instances!'
        });
      }

      // Update user's active bots
      for (const session of createdSessions) {
        userBots.push({
          sessionId: session.sessionId,
          username: session.username,
          serverAddress,
          javaVersion,
          accountType,
          status: 'active',
          trading: tradingSystem.startTrading(userId, session.sessionId),
          enchanting: enchantingSystem.startEnchanting(userId, session.sessionId),
          brewing: brewingSystem.startBrewing(userId, session.sessionId),
          fishing: fishingSystem.startFishing(userId, session.sessionId),
          mobFarm: mobFarmSystem.startMobFarming(userId, session.sessionId),
          mining: autoMiningSystem.startMining(userId, session.sessionId),
          pathfinding: pathfindingSystem.startPathfinding(userId, session.sessionId)
        });
      }
      activeBots.set(userId, userBots);

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Bot(s) Joining Server')
        .setDescription(joinMessage)
        .addFields(
          { name: '🎮 Server', value: `\`\`${serverAddress}\`\``, inline: true },
          { name: '☕ Java Version', value: `\`\`${javaVersion}\`\``, inline: true },
          { name: '🤖 Bots Joining', value: `\`\`${createdSessions.length}\`\``, inline: true },
          { name: '📝 Account Mode', value: `\`\`${accountMode}\`\``, inline: true },
          { name: '🔑 Account Type', value: `\`\`${accountType}\`\``, inline: true },
          { name: '⏳ Status', value: '🟡 Connecting...', inline: true },
          {
            name: '👤 Bot Usernames',
            value: createdSessions.map(s => `\`${s.username}\``).join(', '),
            inline: false
          }
        )
        .setColor('#FFFF00')
        .setFooter({ text: '⚔️ Made by NeoNinja_ | Mineflare Discord Bot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      statsManager.recordBotSession(userId, createdSessions[0].sessionId, {
        server: serverAddress,
        username: createdSessions.map(s => s.username).join(', ')
      });

      setTimeout(async () => {
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Successfully Joined')
          .setDescription(`${createdSessions.length} bot(s) now active on server`)
          .addFields(
            { name: '🎮 Server', value: `\`\`${serverAddress}\`\``, inline: true },
            { name: '☕ Java Version', value: `\`\`${javaVersion}\`\``, inline: true },
            { name: '🔑 Account Type', value: `\`\`${accountType}\`\``, inline: true },
            {
              name: '👤 Bots Joined',
              value: createdSessions.map(s => `\`${s.username}\``).join(', '),
              inline: false
            }
          )
          .setColor('#00FF00')
          .setFooter({ text: '✅ Made by NeoNinja_ | Mineflare Discord Bot' })
          .setTimestamp();

        try {
          const msg = await interaction.fetchReply();
          if (msg) await msg.edit({ embeds: [successEmbed] });
        } catch (e) {
          console.error('Failed to edit message:', e);
        }
      }, 2000);
    }

    // HELP COMMAND
    if (interaction.commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📚 Mineflare Bot Commands')
        .setDescription('Complete list of all available commands')
        .addFields(
          {
            name: '🎮 Server Management',
            value: '`/status` - Check server status\n`/join` - Join with unlimited bots\n`/leave` - Disconnect bot(s)\n`/instances` - View active bots',
            inline: false
          },
          {
            name: '💰 Automation Systems',
            value: '`/trading` - Trading system\n`/enchanting` - Enchanting system\n`/brewing` - Brewing system\n`/fishing` - Fishing system\n`/mobfarm` - Mob farm system\n`/mining` - Mining system\n`/pathfinding` - Pathfinding system',
            inline: false
          },
          { name: '📊 Analytics', value: '`/stats` - View your statistics\n`/help` - Show this message', inline: false },
          { name: '🎯 Features', value: '✅ Unlimited bot instances\n✅ Auto-mining system\n✅ Multi-server support\n✅ Real-time statistics', inline: false }
        )
        .setColor('#0099FF')
        .setFooter({ text: '📚 Made by NeoNinja_ | Mineflare Discord Bot' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // STATS COMMAND
    if (interaction.commandName === 'stats') {
      await interaction.deferReply();
      const embed = statsManager.getStatsEmbed(interaction.user.id);
      await interaction.editReply({ embeds: [embed] });
    }

    // MINING COMMAND
    if (interaction.commandName === 'mining') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'start') {
        autoMiningSystem.startMining(interaction.user.id, sessionId);
        const embed = new EmbedBuilder()
          .setTitle('⛏️ Auto-Mining Started')
          .setDescription('Your bot is now mining blocks')
          .addFields(
            { name: '🎯 Mode', value: '`Active Mining`', inline: true },
            { name: '⏱️ Start Time', value: `<t:${Math.floor(Date.now() / 1000)}:t>`, inline: true }
          )
          .setColor('#FF6347')
          .setFooter({ text: '⛏️ Made by NeoNinja_ | Mineflare Discord Bot' })
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'stop') {
        autoMiningSystem.stopMining(sessionId);
        const embed = new EmbedBuilder()
          .setTitle('⛏️ Auto-Mining Stopped')
          .setDescription('Mining session has ended')
          .setColor('#FF0000')
          .setFooter({ text: '⛏️ Made by NeoNinja_ | Mineflare Discord Bot' })
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'status') {
        const embed = autoMiningSystem.getSessionEmbed(sessionId);
        if (!embed) {
          return interaction.reply({ content: '❌ No active mining session!', ephemeral: true });
        }
        await interaction.reply({ embeds: [embed] });
      }
    }

    // TRADING COMMANDS
    if (interaction.commandName === 'trading') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const embed = tradingSystem.getSessionEmbed(sessionId);
      if (!embed) {
        return interaction.reply({ content: '❌ No active trading session!', ephemeral: true });
      }
      await interaction.reply({ embeds: [embed] });
    }

    // ENCHANTING COMMANDS
    if (interaction.commandName === 'enchanting') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const embed = enchantingSystem.getSessionEmbed(sessionId);
      if (!embed) {
        return interaction.reply({ content: '❌ No active enchanting session!', ephemeral: true });
      }
      await interaction.reply({ embeds: [embed] });
    }

    // BREWING COMMANDS
    if (interaction.commandName === 'brewing') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const embed = brewingSystem.getSessionEmbed(sessionId);
      if (!embed) {
        return interaction.reply({ content: '❌ No active brewing session!', ephemeral: true });
      }
      await interaction.reply({ embeds: [embed] });
    }

    // FISHING COMMANDS
    if (interaction.commandName === 'fishing') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const embed = fishingSystem.getSessionEmbed(sessionId);
      if (!embed) {
        return interaction.reply({ content: '❌ No active fishing session!', ephemeral: true });
      }
      await interaction.reply({ embeds: [embed] });
    }

    // MOB FARM COMMANDS
    if (interaction.commandName === 'mobfarm') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      const embed = mobFarmSystem.getSessionEmbed(sessionId);
      if (!embed) {
        return interaction.reply({ content: '❌ No active mob farm session!', ephemeral: true });
      }
      await interaction.reply({ embeds: [embed] });
    }

    // PATHFINDING COMMANDS
    if (interaction.commandName === 'pathfinding') {
      const userBots = activeBots.get(interaction.user.id);
      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const sessionId = userBots[0].sessionId;
      if (interaction.options.getSubcommand() === 'addwaypoint') {
        const name = interaction.options.getString('name') || 'Waypoint';
        const x = interaction.options.getNumber('x') || 0;
        const y = interaction.options.getNumber('y') || 64;
        const z = interaction.options.getNumber('z') || 0;

        pathfindingSystem.addWaypoint(sessionId, { name, x, y, z });
        const embed = pathfindingSystem.getSessionEmbed(sessionId);
        if (!embed) {
          return interaction.reply({ content: '❌ Error adding waypoint!', ephemeral: true });
        }
        await interaction.reply({ embeds: [embed] });
      } else if (interaction.options.getSubcommand() === 'status') {
        const embed = pathfindingSystem.getSessionEmbed(sessionId);
        if (!embed) {
          return interaction.reply({ content: '❌ No active pathfinding session!', ephemeral: true });
        }
        await interaction.reply({ embeds: [embed] });
      }
    }

    // INSTANCES COMMAND
    if (interaction.commandName === 'instances') {
      const userBots = activeBots.get(interaction.user.id) || [];
      const embed = new EmbedBuilder()
        .setTitle('🤖 Active Bot Instances')
        .setDescription(`You currently have **${userBots.length}** active bot(s)`)
        .addFields(
          userBots.length > 0
            ? userBots.map((bot, idx) => ({
                name: `Bot #${idx + 1}`,
                value: `👤 Username: \`${bot.username}\`\n🎮 Server: \`${bot.serverAddress}\`\n☕ Java: \`${bot.javaVersion}\`\n📊 Status: \`${bot.status}\``,
                inline: true
              }))
            : [{ name: 'No Active Bots', value: 'Use `/join` to start', inline: false }]
        )
        .setColor('#00FF00')
        .setFooter({ text: '🤖 Made by NeoNinja_ | Mineflare Discord Bot' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    // LEAVE COMMAND - Support disconnecting all or single bot
    if (interaction.commandName === 'leave') {
      const userBots = activeBots.get(interaction.user.id);
      const disconnectAll = interaction.options.getBoolean('all') || false;

      if (!userBots || userBots.length === 0) {
        return interaction.reply({ content: '❌ No active bot session!', ephemeral: true });
      }

      const botsToRemove = disconnectAll ? userBots : [userBots[0]];
      const removedBots = botsToRemove.map(bot => bot.username);

      for (const bot of botsToRemove) {
        instanceManager.removeInstance(bot.sessionId);
        minecraftViewManager.removeViewSession(bot.sessionId);
        statsManager.endBotSession(bot.sessionId);
      }

      if (disconnectAll) {
        activeBots.delete(interaction.user.id);
      } else {
        const remaining = userBots.filter(bot => bot.sessionId !== botsToRemove[0].sessionId);
        if (remaining.length === 0) {
          activeBots.delete(interaction.user.id);
        } else {
          activeBots.set(interaction.user.id, remaining);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('👋 Bot(s) Disconnected')
        .setDescription(`Successfully disconnected **${botsToRemove.length}** bot(s)`)
        .addFields(
          { name: '🤖 Bots Removed', value: removedBots.map(b => `\`${b}\``).join(', '), inline: false },
          { name: '📊 Remaining Bots', value: `\`\`${Math.max(0, userBots.length - botsToRemove.length)}\`\``, inline: true }
        )
        .setColor('#FF6347')
        .setFooter({ text: '👋 Made by NeoNinja_ | Mineflare Discord Bot' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Command error:', error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Command Error')
      .setDescription('An error occurred while processing your command.')
      .addFields({ name: '📝 Error Details', value: '`Check bot console for details`', inline: false })
      .setColor('#FF0000')
      .setFooter({ text: '❌ Made by NeoNinja_ | Mineflare Discord Bot' })
      .setTimestamp();

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }
});

// Handle errors
client.on('error', error => {
  console.error('❌ Client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled rejection:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN not set in .env file');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('❌ Failed to login:', error);
  process.exit(1);
});