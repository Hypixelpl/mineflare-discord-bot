import { EmbedBuilder } from 'discord.js';

interface Waypoint {
  name: string;
  x: number;
  y: number;
  z: number;
}

interface Coordinate {
  x: number;
  y: number;
  z: number;
}

interface PathfindingSession {
  userId: string;
  sessionId: string;
  waypoints: Waypoint[];
  currentLocation: Coordinate;
  destination: Waypoint | null;
  pathfinding: 'idle' | 'traveling' | 'arrived';
  totalDistance: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class PathfindingSystem {
  private sessions: Map<string, PathfindingSession> = new Map();

  startPathfinding(userId: string, sessionId: string): PathfindingSession {
    const session: PathfindingSession = {
      userId,
      sessionId,
      waypoints: [],
      currentLocation: { x: 0, y: 64, z: 0 },
      destination: null,
      pathfinding: 'idle',
      totalDistance: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  addWaypoint(sessionId: string, waypoint: Waypoint): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.waypoints.push(waypoint);
  }

  removeWaypoint(sessionId: string, waypointName: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.waypoints.findIndex(w => w.name === waypointName);
    if (index !== -1) {
      session.waypoints.splice(index, 1);
      return true;
    }
    return false;
  }

  calculateDistance(from: Coordinate, to: Coordinate): number {
    return Math.sqrt(
      Math.pow(to.x - from.x, 2) + 
      Math.pow(to.y - from.y, 2) + 
      Math.pow(to.z - from.z, 2)
    );
  }

  travelToWaypoint(sessionId: string, waypointName: string): number | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const waypoint = session.waypoints.find(w => w.name === waypointName);
    if (!waypoint) return null;

    session.destination = waypoint;
    session.pathfinding = 'traveling';
    const distance = this.calculateDistance(session.currentLocation, waypoint);
    session.totalDistance += distance;
    
    return distance;
  }

  arriveAtDestination(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.destination) return;

    session.currentLocation = {
      x: session.destination.x,
      y: session.destination.y,
      z: session.destination.z
    };
    session.pathfinding = 'arrived';
    session.destination = null;
  }

  pausePathfinding(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumePathfinding(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopPathfinding(sessionId: string): PathfindingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): PathfindingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const waypointsList = session.waypoints
      .map(w => `${w.name} (${w.x}, ${w.y}, ${w.z})`)
      .join('\n') || 'None';

    return new EmbedBuilder()
      .setTitle('🗺️ Pathfinding System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Pathfinding', value: session.pathfinding, inline: true },
        { name: 'Total Distance', value: `${session.totalDistance.toFixed(2)} blocks`, inline: true },
        { name: 'Current Location', value: `(${session.currentLocation.x}, ${session.currentLocation.y}, ${session.currentLocation.z})`, inline: true },
        { name: 'Waypoints', value: waypointsList, inline: false },
        { name: 'Destination', value: session.destination ? `${session.destination.name}` : 'None', inline: true }
      )
      .setColor(0x00CED1)
      .setTimestamp();
  }
}
