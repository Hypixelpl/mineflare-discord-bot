import { EmbedBuilder } from 'discord.js';

interface BrewingBatch {
  potionType: string;
  quantity: number;
  duration: number; // in seconds
  ingredients: string[];
  status: 'brewing' | 'completed' | 'failed';
}

interface BrewingSession {
  userId: string;
  sessionId: string;
  batches: BrewingBatch[];
  batchesCompleted: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class BrewingSystem {
  private sessions: Map<string, BrewingSession> = new Map();
  private potionTypes = [
    'Strength', 'Speed', 'Healing', 'Poison', 'Weakness',
    'Slowness', 'Night Vision', 'Invisibility', 'Regeneration', 'Fire Resistance'
  ];

  startBrewing(userId: string, sessionId: string): BrewingSession {
    const session: BrewingSession = {
      userId,
      sessionId,
      batches: [],
      batchesCompleted: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  addBatch(sessionId: string, batch: BrewingBatch): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.batches.push(batch);
  }

  completeBatch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.batches.length === 0) return;

    const batch = session.batches.shift()!;
    batch.status = 'completed';
    session.batchesCompleted++;
  }

  pauseBrewing(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeBrewing(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopBrewing(sessionId: string): BrewingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): BrewingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getPotionTypes(): string[] {
    return this.potionTypes;
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);

    return new EmbedBuilder()
      .setTitle('🧪 Brewing System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Batches Completed', value: `${session.batchesCompleted}`, inline: true },
        { name: 'Pending Batches', value: `${session.batches.length}`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Batches/Hour', value: `${Math.floor((session.batchesCompleted / duration) * 3600)}`, inline: true },
        { name: 'Current Batch', value: session.batches.length > 0 ? session.batches[0].potionType : 'None', inline: true }
      )
      .setColor(0x8B00FF)
      .setTimestamp();
  }
}
