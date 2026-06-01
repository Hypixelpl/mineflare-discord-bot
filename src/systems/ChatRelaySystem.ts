import { EmbedBuilder } from 'discord.js';

interface ChatMessage {
  timestamp: Date;
  username: string;
  message: string;
  source: 'discord' | 'minecraft';
  userId?: string;
}

interface ChatRelayConfig {
  enabled: boolean;
  discordChannelId: string;
  minecraftPrefix: string;
  allowedRoles: string[];
  ownerFilters: string[];
  customRules: Map<string, string>;
}

export class ChatRelaySystem {
  private messageHistory: ChatMessage[] = [];
  private configs: Map<string, ChatRelayConfig> = new Map();
  private maxHistorySize = 100;

  createChatRelay(sessionId: string, discordChannelId: string, ownerId: string): ChatRelayConfig {
    const config: ChatRelayConfig = {
      enabled: true,
      discordChannelId,
      minecraftPrefix: '[BOT]',
      allowedRoles: [],
      ownerFilters: [ownerId],
      customRules: new Map()
    };
    this.configs.set(sessionId, config);
    return config;
  }

  addChatMessage(message: ChatMessage): void {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  relayMessage(sessionId: string, username: string, message: string, source: 'discord' | 'minecraft'): ChatMessage {
    const config = this.configs.get(sessionId);
    let finalMessage = message;

    // Apply custom rules
    if (config?.customRules.size) {
      config.customRules.forEach((rule, trigger) => {
        if (message.includes(trigger)) {
          finalMessage = finalMessage.replace(trigger, rule);
        }
      });
    }

    // Add prefix for minecraft messages
    if (source === 'minecraft') {
      finalMessage = `${config?.minecraftPrefix} ${username}: ${finalMessage}`;
    }

    const chatMessage: ChatMessage = {
      timestamp: new Date(),
      username,
      message: finalMessage,
      source
    };

    this.addChatMessage(chatMessage);
    return chatMessage;
  }

  setCustomRule(sessionId: string, trigger: string, replacement: string): void {
    const config = this.configs.get(sessionId);
    if (config) {
      config.customRules.set(trigger, replacement);
    }
  }

  removeCustomRule(sessionId: string, trigger: string): void {
    const config = this.configs.get(sessionId);
    if (config) {
      config.customRules.delete(trigger);
    }
  }

  setMinecraftPrefix(sessionId: string, prefix: string): void {
    const config = this.configs.get(sessionId);
    if (config) {
      config.minecraftPrefix = prefix;
    }
  }

  toggleRelay(sessionId: string): void {
    const config = this.configs.get(sessionId);
    if (config) {
      config.enabled = !config.enabled;
    }
  }

  getConfig(sessionId: string): ChatRelayConfig | undefined {
    return this.configs.get(sessionId);
  }

  getMessageHistory(sessionId: string, limit: number = 20): ChatMessage[] {
    return this.messageHistory.slice(-limit);
  }

  getHistoryEmbed(sessionId: string): EmbedBuilder {
    const messages = this.getMessageHistory(sessionId, 15);
    const config = this.getConfig(sessionId);

    const historyText = messages
      .map(m => `**${m.username}** (${m.source}): ${m.message}`)
      .join('\n') || 'No messages yet';

    return new EmbedBuilder()
      .setTitle('💬 Chat Relay')
      .setDescription(historyText)
      .addFields(
        { name: 'Status', value: config?.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
        { name: 'Prefix', value: config?.minecraftPrefix || '[BOT]', inline: true },
        { name: 'Total Messages', value: `${this.messageHistory.length}`, inline: true }
      )
      .setColor(0x5865F2)
      .setTimestamp();
  }
}
