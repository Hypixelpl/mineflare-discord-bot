import { EmbedBuilder } from 'discord.js';

interface CaughtFish {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  timestamp: Date;
}

interface FishingSession {
  userId: string;
  sessionId: string;
  fishCaught: CaughtFish[];
  totalValue: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class FishingSystem {
  private sessions: Map<string, FishingSession> = new Map();
  private fishTypes = [
    { name: 'Cod', rarity: 'common', value: 10 },
    { name: 'Salmon', rarity: 'uncommon', value: 25 },
    { name: 'Tropical Fish', rarity: 'uncommon', value: 30 },
    { name: 'Pufferfish', rarity: 'rare', value: 50 },
    { name: 'Golden Fish', rarity: 'epic', value: 200 },
    { name: 'Dragon Fish', rarity: 'legendary', value: 1000 }
  ];

  startFishing(userId: string, sessionId: string): FishingSession {
    const session: FishingSession = {
      userId,
      sessionId,
      fishCaught: [],
      totalValue: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  catchFish(sessionId: string): CaughtFish | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const randomFish = this.fishTypes[Math.floor(Math.random() * this.fishTypes.length)];
    const fish: CaughtFish = {
      name: randomFish.name,
      rarity: randomFish.rarity,
      value: randomFish.value,
      timestamp: new Date()
    };

    session.fishCaught.push(fish);
    session.totalValue += fish.value;
    return fish;
  }

  pauseFishing(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeFishing(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopFishing(sessionId: string): FishingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): FishingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const rarity = session.fishCaught.length > 0 
      ? session.fishCaught[session.fishCaught.length - 1].rarity 
      : 'none';

    return new EmbedBuilder()
      .setTitle('🎣 Fishing System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Fish Caught', value: `${session.fishCaught.length}`, inline: true },
        { name: 'Total Value', value: `${session.totalValue} coins`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Fish/Hour', value: `${Math.floor((session.fishCaught.length / duration) * 3600)}`, inline: true },
        { name: 'Last Catch Rarity', value: rarity, inline: true }
      )
      .setColor(0x4169E1)
      .setTimestamp();
  }
}
