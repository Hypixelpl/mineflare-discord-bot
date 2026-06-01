import { EmbedBuilder } from 'discord.js';

interface MiningJob {
  id: string;
  location: string;
  blockType: string;
  quantityNeeded: number;
  quantityMined: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

interface AutoMiningSession {
  userId: string;
  sessionId: string;
  jobs: MiningJob[];
  totalBlocksMined: number;
  totalTimeSpent: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class AutoMiningSystem {
  private sessions: Map<string, AutoMiningSession> = new Map();
  private blockTypes = [
    'Stone', 'Dirt', 'Cobblestone', 'Coal Ore', 'Iron Ore', 'Gold Ore',
    'Diamond Ore', 'Emerald Ore', 'Lapis Ore', 'Redstone Ore'
  ];

  startAutoMining(userId: string, sessionId: string): AutoMiningSession {
    const session: AutoMiningSession = {
      userId,
      sessionId,
      jobs: [],
      totalBlocksMined: 0,
      totalTimeSpent: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  addMiningJob(sessionId: string, blockType: string, quantity: number, location: string): MiningJob | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const job: MiningJob = {
      id: `job-${Date.now()}`,
      blockType,
      location,
      quantityNeeded: quantity,
      quantityMined: 0,
      status: 'pending',
      startTime: new Date()
    };

    session.jobs.push(job);
    return job;
  }

  mineBlock(sessionId: string, jobId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const job = session.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.quantityMined++;
    session.totalBlocksMined++;

    if (job.quantityMined >= job.quantityNeeded) {
      job.status = 'completed';
      job.endTime = new Date();
    } else if (job.status === 'pending') {
      job.status = 'in-progress';
    }

    return true;
  }

  pauseMining(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeMining(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopMining(sessionId: string): AutoMiningSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): AutoMiningSession | undefined {
    return this.sessions.get(sessionId);
  }

  getBlockTypes(): string[] {
    return this.blockTypes;
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const completedJobs = session.jobs.filter(j => j.status === 'completed').length;

    return new EmbedBuilder()
      .setTitle('⛏️ Auto Mining System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Total Blocks Mined', value: `${session.totalBlocksMined}`, inline: true },
        { name: 'Completed Jobs', value: `${completedJobs}/${session.jobs.length}`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Blocks/Minute', value: `${Math.floor(session.totalBlocksMined / (duration / 60))}`, inline: true },
        { name: 'Active Job', value: session.jobs.find(j => j.status === 'in-progress')?.blockType || 'None', inline: true }
      )
      .setColor(0x8B4513)
      .setTimestamp();
  }
}
