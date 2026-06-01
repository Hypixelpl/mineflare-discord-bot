import { EmbedBuilder } from 'discord.js';

interface BotInstance {
  id: string;
  username: string;
  server: string;
  javaVersion: string;
  status: 'online' | 'offline' | 'idle';
  createdAt: Date;
  lastActivity: Date;
}

export class MultiInstanceManager {
  private instances: Map<string, BotInstance> = new Map();
  private maxInstances = 10;

  createInstance(id: string, username: string, server: string, javaVersion: string): BotInstance | null {
    if (this.instances.size >= this.maxInstances) {
      return null; // Max instances reached
    }

    const instance: BotInstance = {
      id,
      username,
      server,
      javaVersion,
      status: 'online',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.instances.set(id, instance);
    return instance;
  }

  getInstance(id: string): BotInstance | undefined {
    return this.instances.get(id);
  }

  updateInstanceActivity(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.lastActivity = new Date();
    }
  }

  setInstanceStatus(id: string, status: 'online' | 'offline' | 'idle'): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.status = status;
    }
  }

  removeInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  getAllInstances(): BotInstance[] {
    return Array.from(this.instances.values());
  }

  getInstancesByServer(server: string): BotInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.server === server);
  }

  getInstanceCount(): number {
    return this.instances.size;
  }

  getInstancesEmbed(): EmbedBuilder {
    const instances = this.getAllInstances();
    const onlineCount = instances.filter(i => i.status === 'online').length;
    const offlineCount = instances.filter(i => i.status === 'offline').length;

    const instancesList = instances
      .slice(0, 10)
      .map(i => `**${i.username}** - ${i.server} (${i.status})`)
      .join('\n') || 'No instances';

    return new EmbedBuilder()
      .setTitle('🤖 Bot Instances')
      .addFields(
        { name: 'Total Instances', value: `${instances.length}/${this.maxInstances}`, inline: true },
        { name: 'Online', value: `${onlineCount}`, inline: true },
        { name: 'Offline', value: `${offlineCount}`, inline: true },
        { name: 'Instances List', value: instancesList, inline: false }
      )
      .setColor(0x00AA00)
      .setTimestamp();
  }
}
