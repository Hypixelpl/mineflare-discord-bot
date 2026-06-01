import { EmbedBuilder } from 'discord.js';

interface Trade {
  id: string;
  itemGiven: string;
  itemReceived: string;
  quantity: number;
  price: number;
  merchant: string;
}

interface TradingSession {
  userId: string;
  sessionId: string;
  trades: Trade[];
  totalProfit: number;
  startTime: Date;
  status: 'active' | 'paused' | 'stopped';
}

export class TradingSystem {
  private sessions: Map<string, TradingSession> = new Map();
  private trades: Trade[] = [];

  startTrading(userId: string, sessionId: string): TradingSession {
    const session: TradingSession = {
      userId,
      sessionId,
      trades: [],
      totalProfit: 0,
      startTime: new Date(),
      status: 'active'
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  recordTrade(sessionId: string, trade: Trade): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.trades.push(trade);
    session.totalProfit += trade.price * trade.quantity;
    this.trades.push(trade);
  }

  pauseTrading(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'paused';
  }

  resumeTrading(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'active';
  }

  stopTrading(sessionId: string): TradingSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
      this.sessions.delete(sessionId);
    }
    return session;
  }

  getSession(sessionId: string): TradingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionEmbed(sessionId: string): EmbedBuilder | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    return new EmbedBuilder()
      .setTitle('💰 Trading System Status')
      .addFields(
        { name: 'Status', value: session.status, inline: true },
        { name: 'Total Profit', value: `${session.totalProfit} coins`, inline: true },
        { name: 'Trades Completed', value: `${session.trades.length}`, inline: true },
        { name: 'Duration', value: `${hours}h ${minutes}m`, inline: true },
        { name: 'Profit/Hour', value: `${Math.floor(session.totalProfit / (duration / 3600))} coins`, inline: true },
        { name: 'Last Trade', value: session.trades.length > 0 ? session.trades[session.trades.length - 1].itemGiven : 'None', inline: true }
      )
      .setColor(0xFFD700)
      .setTimestamp();
  }
}
