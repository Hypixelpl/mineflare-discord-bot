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

// Store active bot sessions
const activeBots = new Map();

// Java version detection
async function detectJavaVersions(): Promise<string[]> {
  return new Promise((resolve) => {
    exec('java -version 2>&1 && javaw -version 2>&1', (error, stdout, stderr) => {
      const versions: string[] = [];
      const output = stdout + stderr;
      const versionMatch = output.match(/version "(\d+\.\d+)/g);
      if (versionMatch) {
        versionMatch.forEach(match => {
          const version = match.replace('version "', '');
          if (!versions.includes(version)) versions.push(version);
        });
      }
      resolve(versions.length > 0 ? versions : ['1.8', '11', '16', '17', '21']);
    });
  });
}

// Generate random username for offline mode
function generateRandomUsername(): string {
  const adjectives = ['Swift', 'Brave', 'Lucky', 'Noble', 'Clever', 'Mighty', 'Silent', 'Bold'];
  const nouns = ['Player', 'Miner', 'Fighter', 'Explorer', 'Slayer', 'Champion', 'Warrior', 'Nomad'];
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
}

// Get server status from Mineflare
async function getServerStatus(serverAddress: string): Promise<any> {
  return new Promise((resolve) => {
    exec(`ping -c 1 ${serverAddress} 2>&1`, (error, stdout) => {
      const isOnline = !error;
      resolve({
        online: isOnline,
        address: serverAddress,
        status: isOnline ? '🟢 Online' : '🔴 Offline'
      });
    });
  });
}

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user?.tag}`);
  client.user?.setActivity('Mineflare Server Status', { type: 'WATCHING' });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    // STATUS COMMAND
    if (interaction.commandName === 'status') {
      const serverAddress = interaction.options.getString('server') || 'play.mineflare.com';
      const status = await getServerStatus(serverAddress);
      
      const embed = new EmbedBuilder()
        .setTitle('🖥️ Mineflare Server Status')
        .setDescription(`Server: \`${status.address}\``)
        .addFields(
          { name: 'Status', value: status.status, inline: true },
          { name: 'Online', value: status.online ? 'Yes' : 'No', inline: true }
        )
        .setColor(status.online ? 0x00FF00 : 0xFF0000)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    // JOIN COMMAND
    if (interaction.commandName === 'join') {
      const serverAddress = interaction.options.getString('server') || 'localhost';
      const javaVersion = interaction.options.getString('java-version') || '17';
      const accountMode = interaction.options.getString('account-mode') || 'offline';
      const username = interaction.options.getString('username') || generateRandomUsername();
      const accountType = interaction.options.getString('account-type') || 'cracked';
      const joinMessage = interaction.options.getString('message') || 'Joining server...';
      
      const userId = interaction.user.id;
      const sessionId = `${userId}-${Date.now()}`;

      // Create instance
      const instance = instanceManager.createInstance(sessionId, username, serverAddress, javaVersion);
      if (!instance) {
        return await interaction.reply({
          content: '❌ Maximum bot instances reached! Please stop some bots first.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Joining Mineflare Server')
        .setDescription(joinMessage)
        .addFields(
          { name: 'Server', value: `\`${serverAddress}\``, inline: true },
          { name: 'Java Version', value: `\`${javaVersion}\``, inline: true },
          { name: 'Account Mode', value: `\`${accountMode}\``, inline: true },
          { name: 'Username', value: `\`${username}\``, inline: true },
          { name: 'Account Type', value: `\`${accountType}\``, inline: true },
          { name: 'Status', value: '🟡 Connecting...', inline: true }
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
            { name: 'Account Type', value: `\`${accountType}\``, inline: true }
          )
          .setColor(0x00FF00)
          .setTimestamp();

        await message.edit({ embeds: [successEmbed] });
      }, 2000);
    }

    // TRADING COMMANDS
    if (interaction.commandName === 'trading') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const session = activeBots.get(sessionId).trading;
      const embed = tradingSystem.getSessionEmbed(sessionId);

      await interaction.reply({ embeds: [embed] });
    }

    // ENCHANTING COMMANDS
    if (interaction.commandName === 'enchanting') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const embed = enchantingSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // BREWING COMMANDS
    if (interaction.commandName === 'brewing') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const embed = brewingSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // FISHING COMMANDS
    if (interaction.commandName === 'fishing') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const embed = fishingSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // MOB FARM COMMANDS
    if (interaction.commandName === 'mobfarm') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      const embed = mobFarmSystem.getSessionEmbed(sessionId);
      await interaction.reply({ embeds: [embed] });
    }

    // PATHFINDING COMMANDS
    if (interaction.commandName === 'pathfinding') {
      const subcommand = interaction.options.getSubcommand();
      const sessionId = Array.from(activeBots.keys()).find(id => activeBots.get(id).userId === interaction.user.id);
      
      if (!sessionId) {
        return interaction.reply({ content: '❌ No active bot session. Use `/join` first!', ephemeral: true });
      }

      if (subcommand === 'addwaypoint') {
        const name = interaction.options.getString('name') || 'Waypoint';
        const x = interaction.options.getNumber('x') || 0;
        const y = interaction.options.getNumber('y') || 64;
        const z = interaction.options.getNumber('z') || 0;

        pathfindingSystem.addWaypoint(sessionId, { name, x, y, z });
        const embed = pathfindingSystem.getSessionEmbed(sessionId);
        await interaction.reply({ embeds: [embed] });
      }
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
