import { EmbedBuilder } from 'discord.js';

interface ServerStatus {
  serverAddress: string;
  isOnline: boolean;
  playerCount: number;
  maxPlayers: number;
  ping: number;
  version: string;
  motd: string;
  lastUpdated: Date;
  uptime: number; // in seconds
}

export class ServerStatusManager {
  private statusCache: Map<string, ServerStatus> = new Map();
  private updateInterval = 30000; // 30 seconds

  async getServerStatus(serverAddress: string): Promise<ServerStatus> {
    const cached = this.statusCache.get(serverAddress);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.updateInterval) {
      return cached;
    }

    // Mock status - in production this would use a real Minecraft server query
    const status: ServerStatus = {
      serverAddress,
      isOnline: Math.random() > 0.1, // 90% online
      playerCount: Math.floor(Math.random() * 100),
      maxPlayers: 100,
      ping: Math.floor(Math.random() * 50) + 10,
      version: '1.20.1',
      motd: '§6Welcome to Minecraft! §r🎮',
      lastUpdated: new Date(),
      uptime: Math.floor(Math.random() * 604800) // 0-7 days
    };

    this.statusCache.set(serverAddress, status);
    return status;
  }

  getStatusEmbed(serverAddress: string, status: ServerStatus): EmbedBuilder {
    const uptimeDays = Math.floor(status.uptime / 86400);
    const uptimeHours = Math.floor((status.uptime % 86400) / 3600);

    return new EmbedBuilder()
      .setTitle(`🖥️ Server Status - ${serverAddress}`)
      .setDescription(status.motd)
      .addFields(
        { name: 'Status', value: status.isOnline ? '🟢 Online' : '🔴 Offline', inline: true },
        { name: 'Players', value: `${status.playerCount}/${status.maxPlayers}`, inline: true },
        { name: 'Ping', value: `${status.ping}ms`, inline: true },
        { name: 'Version', value: status.version, inline: true },
        { name: 'Uptime', value: `${uptimeDays}d ${uptimeHours}h`, inline: true },
        { name: 'Last Updated', value: `<t:${Math.floor(status.lastUpdated.getTime() / 1000)}:R>`, inline: true }
      )
      .setColor(status.isOnline ? 0x00FF00 : 0xFF0000)
      .setTimestamp();
  }

  getAllStatuses(): ServerStatus[] {
    return Array.from(this.statusCache.values());
  }

  clearCache(serverAddress?: string): void {
    if (serverAddress) {
      this.statusCache.delete(serverAddress);
    } else {
      this.statusCache.clear();
    }
  }
}
