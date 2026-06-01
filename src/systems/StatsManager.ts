import { EmbedBuilder } from 'discord.js';

interface BotSessionStats {
  userId: string;
  sessionId: string;
  server: string;
  username: string;
  startTime: Date;
  endTime?: Date;
  totalProfitCoins: number;
  blocksMinedCount: number;
  taskCompleted: number;
}

export class StatsManager {
  private sessions: Map<string, BotSessionStats> = new Map();
  private userStats: Map<string, any> = new Map();

  recordBotSession(userId: string, sessionId: string, data: { server: string; username: string }): void {
    const session: BotSessionStats = {
      userId,
      sessionId,
      server: data.server,
      username: data.username,
      startTime: new Date(),
      totalProfitCoins: 0,
      blocksMinedCount: 0,
      taskCompleted: 0
    };
    this.sessions.set(sessionId, session);

    if (!this.userStats.has(userId)) {
      this.userStats.set(userId, {
        totalSessions: 0,
        totalProfit: 0,
        totalBlocksMined: 0,
        totalTasksCompleted: 0,
        averageSessionDuration: 0
      });
    }
  }

  endBotSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    const userStats = this.userStats.get(session.userId);
    
    if (userStats) {
      userStats.totalSessions++;
      userStats.totalProfit += session.totalProfitCoins;
      userStats.totalBlocksMined += session.blocksMinedCount;
      userStats.totalTasksCompleted += session.taskCompleted;
    }

    this.sessions.delete(sessionId);
  }

  updateSessionStats(sessionId: string, data: { profit?: number; blocksMined?: number; tasksCompleted?: number }): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (data.profit) session.totalProfitCoins += data.profit;
    if (data.blocksMined) session.blocksMinedCount += data.blocksMined;
    if (data.tasksCompleted) session.taskCompleted += data.tasksCompleted;
  }

  getStatsEmbed(userId: string): EmbedBuilder {
    const userStats = this.userStats.get(userId) || {
      totalSessions: 0,
      totalProfit: 0,
      totalBlocksMined: 0,
      totalTasksCompleted: 0
    };

    const activeSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId).length;

    return new EmbedBuilder()
      .setTitle('📊 Bot Statistics')
      .addFields(
        { name: 'Total Sessions', value: `${userStats.totalSessions}`, inline: true },
        { name: 'Active Sessions', value: `${activeSessions}`, inline: true },
        { name: 'Total Profit', value: `${userStats.totalProfit} coins`, inline: true },
        { name: 'Blocks Mined', value: `${userStats.totalBlocksMined}`, inline: true },
        { name: 'Tasks Completed', value: `${userStats.totalTasksCompleted}`, inline: true },
        { name: 'Avg Session Duration', value: `${Math.floor(userStats.averageSessionDuration / 60)}m`, inline: true }
      )
      .setColor(0x4169E1)
      .setFooter({ text: 'Keep mining and trading to increase stats!' })
      .setTimestamp();
  }
}
