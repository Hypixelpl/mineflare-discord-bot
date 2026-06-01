import { EmbedBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export class MinecraftViewManager {
  private viewSessions: Map<string, any> = new Map();
  private webDomain: string = process.env.WEB_DOMAIN || 'localhost:3000';

  setWebDomain(domain: string): void {
    this.webDomain = domain;
  }

  getWebDomain(): string {
    return this.webDomain;
  }

  createViewSession(sessionId: string, botData: any): any {
    const session = {
      sessionId,
      botData,
      startTime: new Date(),
      viewUrl: `http://${this.webDomain}/#minecraft-view`,
      wsUrl: `ws://${this.webDomain}/ws/${sessionId}`
    };

    this.viewSessions.set(sessionId, session);
    return session;
  }

  getViewEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.viewSessions.get(sessionId);
    if (!session) return null;

    return new EmbedBuilder()
      .setTitle('🌐 Minecraft Bot View')
      .setDescription(`Watch your bot in real-time`)
      .addFields(
        { name: 'View Type', value: 'Live Camera Feed', inline: true },
        { name: 'Server', value: session.botData.server || 'Unknown', inline: true },
        { name: 'Player', value: session.botData.username || 'Unknown', inline: true },
        { name: 'Status', value: session.botData.status || 'Idle', inline: true },
        { name: 'Web Dashboard', value: `[Open Dashboard](http://${this.webDomain})`, inline: false },
        { name: 'WebSocket URL', value: `\`\`\`${session.wsUrl}\`\`\``, inline: false }
      )
      .setColor(0x00FF00)
      .setImage(`http://${this.webDomain}/screenshot/${sessionId}`)
      .setTimestamp();
  }

  getMinecraftViewCommand(sessionId: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🌐 Minecraft First-Person View')
      .setDescription('Your bot\'s perspective in Minecraft')
      .addFields(
        { name: 'View URL', value: `[Click here to view](http://${this.webDomain}/#minecraft-view)`, inline: false },
        { name: 'Update Frequency', value: 'Real-time (60 FPS)', inline: true },
        { name: 'Features', value: 'Health, Hunger, Coordinates, Hotbar', inline: true }
      )
      .setColor(0x8B4513)
      .setTimestamp();

    return embed;
  }

  removeViewSession(sessionId: string): boolean {
    return this.viewSessions.delete(sessionId);
  }

  getAllViewSessions(): any[] {
    return Array.from(this.viewSessions.values());
  }
}
