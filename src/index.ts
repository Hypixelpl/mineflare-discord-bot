import discord from 'discord.js';
import { Client, Intents, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { exec } from 'child_process';

import { TradingSystem } from './systems/TradingSystem';
import { EnchantingSystem } from './systems/EnchantingSystem';
import { BrewingSystem } from './systems/BrewingSystem';
import { FishingSystem } from './systems/FishingSystem';
import { MobFarmSystem } from './systems/MobFarmSystem';
import { PathfindingSystem } from './systems/PathfindingSystem';
import { MultiInstanceManager } from './systems/MultiInstanceManager';
import { MinecraftViewManager } from './systems/MinecraftViewManager';
import { AutoMiningSystem } from './systems/AutoMiningSystem';
import { InventoryManager } from './systems/InventoryManager';
import { BlockBuildingSystem } from './systems/BlockBuildingSystem';
import { ChatRelaySystem } from './systems/ChatRelaySystem';
import { ServerStatusManager } from './systems/ServerStatusManager';

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
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
const inventoryManager = new InventoryManager();
const blockBuildingSystem = new BlockBuildingSystem();
const chatRelaySystem = new ChatRelaySystem();
const serverStatusManager = new ServerStatusManager();

// Store active bot sessions
const activeBots = new Map();

// Generate random username for offline mode
function generateRandomUsername(): string {
  const adjectives = ['Swift', 'Brave', 'Lucky', 'Noble', 'Clever', 'Mighty', 'Silent', 'Bold', 'Fierce', 'Wise'];
  const nouns = ['Player', 'Miner', 'Fighter', 'Explorer', 'Slayer', 'Champion', 'Warrior', 'Nomad', 'Ranger', 'Scout'];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
}

// Get server status
async function getServerStatus(serverAddress: string): Promise<any> {
  return await serverStatusManager.getServerStatus(serverAddress);
}

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user?.tag}`);
  client.user?.setActivity('Mineflare Server Status', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Chat relay functionality
  const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === message.author.id);
  if (sessionId && activeBots.get(sessionId).chatRelay) {
    const relayedMessage = chatRelaySystem.relayMessage(sessionId, message.author.username, message.content, 'discord');
    // In production, this would send to Minecraft server
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    // STATUS COMMAND
    if (interaction.commandName === 'status') {
      const serverAddress = interaction.options.getString('server') || 'play.mineflare.com';
      const status = await getServerStatus(serverAddress);
      const embed = serverStatusManager.getStatusEmbed(serverAddress, status);
      await interaction.reply({ embeds: [embed] });
    }

    // SERVER STATUS COMMAND
    if (interaction.commandName === 'serverstatus') {
      const serverAddress = interaction.options.getString('server') || 'play.mineflare.com';
      const status = await getServerStatus(serverAddress);
      const embed = serverStatusManager.getStatusEmbed(serverAddress, status);
      await interaction.reply({ embeds: [embed] });
    }

    // JOIN COMMAND
    if (interaction.commandName === 'join') {
      const serverAddress = interaction.options.getString('server') || 'localhost';
      const javaVersion = interaction.options.getString('java-version') || '17';
      const accountMode = interaction.options.getString('account-mode') || 'offline';
      let username = interaction.options.getString('username');
      const accountType = interaction.options.getString('account-type') || 'cracked';
      const joinMessage = interaction.options.getString('message') || 'Joining server...';
      
      // Auto-generate username for cracked if not provided
      if (!username && accountType === 'cracked') {
        username = generateRandomUsername();
      } else if (!username) {
        username = interaction.user.username;
      }
      
      const userId = interaction.user.id;
      const sessionId = `${userId}-${Date.now()}`;

      const instance = instanceManager.createInstance(sessionId, username, serverAddress, javaVersion);
      if (!instance) {
        return await interaction.reply({
          content: '❌ Maximum bot instances reached! Please stop some bots first.',
          ephemeral: true
        });
      }

      const viewSession = minecraftViewManager.createViewSession(sessionId, {
        username,
        server: serverAddress,
        java: javaVersion,
        accountType,
        status: 'joining'
      });

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Joining Mineflare Server')
        .setDescription(joinMessage)
        .addFields(
          { name: 'Server', value: `\`${serverAddress}\``, inline: true },
          { name: 'Java Version', value: `\`${javaVersion}\``, inline: true },
          { name: 'Account Type', value: `\`${accountType}\``, inline: true },
          { name: 'Username', value: `\`${username}\``, inline: true },
          { name: 'Status', value: '🟡 Connecting...', inline: true },
          { name: 'Dashboard', value: `[Open](http://${minecraftViewManager.getWebDomain()}/#overview)`, inline: true }
        )
        .setColor(0xFFFF00)
        .setTimestamp();

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      activeBots.set(sessionId, {
        userId,
        message,
        serverAddress,
        username,
        javaVersion,
        viewSession,
        mining: autoMiningSystem.startAutoMining(userId, sessionId),
        inventory: inventoryManager.createInventory(userId, sessionId),
        building: blockBuildingSystem.startBuilding(userId, sessionId),
        chatRelay: chatRelaySystem.createChatRelay(sessionId, interaction.channelId, userId),
        trading: tradingSystem.startTrading(userId, sessionId),
        enchanting: enchantingSystem.startEnchanting(userId, sessionId),
        brewing: brewingSystem.startBrewing(userId, sessionId),
        fishing: fishingSystem.startFishing(userId, sessionId),
        mobFarm: mobFarmSystem.startMobFarming(userId, sessionId),
        pathfinding: pathfindingSystem.startPathfinding(userId, sessionId)
      });

      setTimeout(async () => {
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Successfully Joined')
          .setDescription(`Bot is now on the server as \`${username}\``)
          .addFields(
            { name: 'Server', value: `\`${serverAddress}\``, inline: true },
            { name: 'Java Version', value: `\`${javaVersion}\``, inline: true },
            { name: 'Dashboard', value: `[Open](http://${minecraftViewManager.getWebDomain()})`, inline: true }
          )
          .setColor(0x00FF00)
          .setTimestamp();

        await message.edit({ embeds: [successEmbed] });
      }, 2000);
    }

    // AUTO MINING COMMAND
    if (interaction.commandName === 'automining') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({
          content: '❌ No active bot session. Use `/join` first!',
          ephemeral: true
        });
      }

      const embed = autoMiningSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // INVENTORY COMMAND
    if (interaction.commandName === 'inventory') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({
          content: '❌ No active bot session. Use `/join` first!',
          ephemeral: true
        });
      }

      const embed = inventoryManager.getInventoryEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // BUILDING COMMAND
    if (interaction.commandName === 'building') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({
          content: '❌ No active bot session. Use `/join` first!',
          ephemeral: true
        });
      }

      const embed = blockBuildingSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // CHAT RELAY COMMAND
    if (interaction.commandName === 'chatrelay') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({
          content: '❌ No active bot session. Use `/join` first!',
          ephemeral: true
        });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'status') {
        const embed = chatRelaySystem.getHistoryEmbed(sessionId);
        await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'toggle') {
        chatRelaySystem.toggleRelay(sessionId);
        const config = chatRelaySystem.getConfig(sessionId);
        await interaction.reply({
          content: `Chat relay is now ${config?.enabled ? '🟢 **enabled**' : '🔴 **disabled**'}`,
          ephemeral: true
        });
      } else if (subcommand === 'setprefix') {
        const prefix = interaction.options.getString('prefix') || '[BOT]';
        chatRelaySystem.setMinecraftPrefix(sessionId, prefix);
        await interaction.reply({
          content: `Minecraft prefix set to: \`${prefix}\``,
          ephemeral: true
        });
      } else if (subcommand === 'setrule') {
        const trigger = interaction.options.getString('trigger');
        const replacement = interaction.options.getString('replacement');
        if (trigger && replacement) {
          chatRelaySystem.setCustomRule(sessionId, trigger, replacement);
          await interaction.reply({
            content: `Rule added: \`${trigger}\` → \`${replacement}\``,
            ephemeral: true
          });
        }
      }
    }

    // MINECRAFT VIEW COMMAND
    if (interaction.commandName === 'minecraftview') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({
          content: '❌ No active bot session. Use `/join` first!',
          ephemeral: true
        });
      }

      const embed = minecraftViewManager.getMinecraftViewCommand(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // INSTANCES COMMAND
    if (interaction.commandName === 'instances') {
      const embed = instanceManager.getInstancesEmbed();
      await interaction.reply({ embeds: [embed] });
    }

    // LEAVE COMMAND
    if (interaction.commandName === 'leave') {
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session!', ephemeral: true });
      }

      instanceManager.removeInstance(sessionId);
      minecraftViewManager.removeViewSession(sessionId);
      activeBots.delete(sessionId);
      
      const embed = new EmbedBuilder()
        .setTitle('👋 Left Server')
        .setDescription('Bot has disconnected from the server.')
        .setColor(0xFF6347)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ An error occurred!',
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
