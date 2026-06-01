import { EmbedBuilder } from 'discord.js';

interface BlockPlacementJob {
  id: string;
  blockType: string;
  quantity: number;
  pattern: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed';
  startTime: Date;
}

interface BuildingSession {
  userId: string;
  sessionId: string;
  jobs: BlockPlacementJob[];
  totalBlocksPlaced: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class BlockBuildingSystem {
  private sessions: Map<string, BuildingSession> = new Map();

  startBuilding(userId: string, sessionId: string): BuildingSession {
    const session: BuildingSession = {
      userId,
      sessionId,
      jobs: [],
      totalBlocksPlaced: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  addBuildingJob(sessionId: string, blockType: string, quantity: number, pattern: string): BlockPlacementJob | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const job: BlockPlacementJob = {
      id: `build-${Date.now()}`,
      blockType,
      quantity,
      pattern,
      progress: 0,
      status: 'pending',
      startTime: new Date()
    };

    session.jobs.push(job);
    return job;
  }

  placeBlock(sessionId: string, jobId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const job = session.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.progress++;
    session.totalBlocksPlaced++;

    if (job.progress >= job.quantity) {
      job.status = 'completed';
    } else if (job.status === 'pending') {
      job.status = 'in-progress';
    }

    return true;
  }

  pauseBuilding(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeBuilding(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopBuilding(sessionId: string): BuildingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): BuildingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const completedJobs = session.jobs.filter(j => j.status === 'completed').length;

    return new EmbedBuilder()
      .setTitle('🧱 Block Building System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Total Blocks Placed', value: `${session.totalBlocksPlaced}`, inline: true },
        { name: 'Completed Jobs', value: `${completedJobs}/${session.jobs.length}`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Blocks/Minute', value: `${Math.floor(session.totalBlocksPlaced / (duration / 60))}`, inline: true },
        { name: 'Current Job', value: session.jobs.find(j => j.status === 'in-progress')?.pattern || 'None', inline: true }
      )
      .setColor(0xA0A0A0)
      .setTimestamp();
  }
}
