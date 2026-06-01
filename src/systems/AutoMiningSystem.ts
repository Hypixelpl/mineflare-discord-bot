import { EmbedBuilder } from 'discord.js';

interface MiningSession {
  userId: string;
  sessionId: string;
  blocksMinedCount: number;
  totalOreValue: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
  interval?: NodeJS.Timeout;
}

export class AutoMiningSystem {
  private sessions: Map<string, MiningSession> = new Map();

  startMining(userId: string, sessionId: string): MiningSession {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        userId,
        sessionId,
        blocksMinedCount: 0,
        totalOreValue: 0,
        startTime: new Date(),
        status: 'active'
      };
      this.sessions.set(sessionId, session);
    } else {
      session.status = 'active';
    }

    // Clear any existing interval
    if (session.interval) clearInterval(session.interval);

    // Simulate mining with random intervals
    session.interval = setInterval(() => {
      const currentSession = this.sessions.get(sessionId);
      if (!currentSession || currentSession.status !== 'active') {
        if (currentSession?.interval) clearInterval(currentSession.interval);
        return;
      }

      const blockValue = Math.floor(Math.random() * 100) + 50;
      currentSession.blocksMinedCount++;
      currentSession.totalOreValue += blockValue;
    }, 3000);

    return session;
  }

  stopMining(sessionId: string): MiningSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      if (session.interval) clearInterval(session.interval);
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): MiningSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    const blocksPerHour = Math.floor((session.blocksMinedCount / Math.max(duration, 1)) * 3600);
    const valuePerHour = Math.floor((session.totalOreValue / Math.max(duration, 1)) * 3600);

    return new EmbedBuilder()
      .setTitle('⛏️ Auto-Mining System')
      .setDescription('Real-time mining statistics and performance metrics')
      .addFields(
        { name: '📊 Status', value: `\`\`${session.status.toUpperCase()}\`\``, inline: true },
        { name: '🔨 Blocks Mined', value: `\`\`${session.blocksMinedCount}\`\``, inline: true },
        { name: '💰 Total Value', value: `\`\`${session.totalOreValue.toLocaleString()} coins\`\``, inline: true },
        { name: '⏱️ Duration', value: `\`\`${hours}h ${minutes}m ${seconds}s\`\``, inline: true },
        { name: '📈 Blocks/Hour', value: `\`\`${blocksPerHour}\`\``, inline: true },
        { name: '💵 Value/Hour', value: `\`\`${valuePerHour.toLocaleString()} coins\`\``, inline: true }
      )
      .setColor('#A9A9A9')
      .setFooter({ text: '⛏️ Made by NeoNinja_ | Mineflare Discord Bot' })
      .setTimestamp();
  }
}
