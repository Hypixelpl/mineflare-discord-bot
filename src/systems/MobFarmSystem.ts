import { EmbedBuilder } from 'discord.js';

interface MobKill {
  mobType: string;
  drops: string[];
  experience: number;
  timestamp: Date;
}

interface MobFarmSession {
  userId: string;
  sessionId: string;
  mobsKilled: MobKill[];
  totalExperience: number;
  totalDrops: Map<string, number>;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class MobFarmSystem {
  private sessions: Map<string, MobFarmSession> = new Map();
  private mobTypes = [
    { name: 'Zombie', experience: 10, drops: ['Rotten Flesh', 'Iron Ingot'] },
    { name: 'Skeleton', experience: 12, drops: ['Bone', 'Arrow'] },
    { name: 'Creeper', experience: 15, drops: ['Gunpowder'] },
    { name: 'Spider', experience: 8, drops: ['String', 'Spider Eye'] },
    { name: 'Enderman', experience: 50, drops: ['Ender Pearl'] },
    { name: 'Blaze', experience: 20, drops: ['Blaze Rod'] }
  ];

  startMobFarming(userId: string, sessionId: string): MobFarmSession {
    const session: MobFarmSession = {
      userId,
      sessionId,
      mobsKilled: [],
      totalExperience: 0,
      totalDrops: new Map(),
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  killMob(sessionId: string, mobType?: string): MobKill | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const mob = mobType 
      ? this.mobTypes.find(m => m.name === mobType) || this.mobTypes[0]
      : this.mobTypes[Math.floor(Math.random() * this.mobTypes.length)];

    const mobKill: MobKill = {
      mobType: mob.name,
      drops: mob.drops,
      experience: mob.experience,
      timestamp: new Date()
    };

    session.mobsKilled.push(mobKill);
    session.totalExperience += mob.experience;

    // Track drops
    mob.drops.forEach(drop => {
      const current = session.totalDrops.get(drop) || 0;
      session.totalDrops.set(drop, current + 1);
    });

    return mobKill;
  }

  pauseMobFarming(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeMobFarming(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopMobFarming(sessionId: string): MobFarmSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): MobFarmSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const topDrop = Array.from(session.totalDrops.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return new EmbedBuilder()
      .setTitle('💀 Mob Farm System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Mobs Killed', value: `${session.mobsKilled.length}`, inline: true },
        { name: 'Total Experience', value: `${session.totalExperience} XP`, inline: true },
        { name: 'Duration', value: `${minutes} minutes`, inline: true },
        { name: 'Mobs/Hour', value: `${Math.floor((session.mobsKilled.length / duration) * 3600)}`, inline: true },
        { name: 'Top Drop', value: topDrop ? `${topDrop[0]} (${topDrop[1]})` : 'None', inline: true }
      )
      .setColor(0x8B0000)
      .setTimestamp();
  }
}
