import { EmbedBuilder } from 'discord.js';

interface EnchantmentJob {
  itemName: string;
  enchantmentType: string;
  level: number;
  cost: number;
}

interface EnchantingSession {
  userId: string;
  sessionId: string;
  jobs: EnchantmentJob[];
  jobsCompleted: number;
  totalCostSpent: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class EnchantingSystem {
  private sessions: Map<string, EnchantingSession> = new Map();
  private availableEnchantments = [
    'Sharpness', 'Efficiency', 'Unbreaking', 'Mending', 'Silk Touch',
    'Fortune', 'Knockback', 'Fire Aspect', 'Looting', 'Power'
  ];

  startEnchanting(userId: string, sessionId: string): EnchantingSession {
    const session: EnchantingSession = {
      userId,
      sessionId,
      jobs: [],
      jobsCompleted: 0,
      totalCostSpent: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  addEnchantmentJob(sessionId: string, job: EnchantmentJob): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.jobs.push(job);
  }

  completeJob(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.jobs.length === 0) return;

    const job = session.jobs.shift()!;
    session.jobsCompleted++;
    session.totalCostSpent += job.cost;
  }

  pauseEnchanting(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeEnchanting(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopEnchanting(sessionId: string): EnchantingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): EnchantingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAvailableEnchantments(): string[] {
    return this.availableEnchantments;
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);

    return new EmbedBuilder()
      .setTitle('✨ Enchanting System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Jobs Completed', value: `${session.jobsCompleted}`, inline: true },
        { name: 'Pending Jobs', value: `${session.jobs.length}`, inline: true },
        { name: 'Total Cost', value: `${session.totalCostSpent} EXP`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Jobs/Hour', value: `${Math.floor((session.jobsCompleted / duration) * 3600)}`, inline: true }
      )
      .setColor(0x7B68EE)
      .setTimestamp();
  }
}
