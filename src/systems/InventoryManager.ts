import { EmbedBuilder } from 'discord.js';

interface InventoryItem {
  name: string;
  quantity: number;
  slot: number;
  durability?: number;
  maxDurability?: number;
}

interface InventorySession {
  userId: string;
  sessionId: string;
  items: InventoryItem[];
  maxSlots: number;
  lastUpdated: Date;
}

export class InventoryManager {
  private inventories: Map<string, InventorySession> = new Map();

  createInventory(userId: string, sessionId: string, maxSlots: number = 36): InventorySession {
    const inventory: InventorySession = {
      userId,
      sessionId,
      items: [],
      maxSlots,
      lastUpdated: new Date()
    };
    this.inventories.set(sessionId, inventory);
    return inventory;
  }

  addItem(sessionId: string, item: InventoryItem): boolean {
    const inventory = this.inventories.get(sessionId);
    if (!inventory) return false;

    const existingItem = inventory.items.find(i => i.name === item.name && i.slot === item.slot);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      inventory.items.push(item);
    }
    inventory.lastUpdated = new Date();
    return true;
  }

  removeItem(sessionId: string, itemName: string, quantity: number): boolean {
    const inventory = this.inventories.get(sessionId);
    if (!inventory) return false;

    const item = inventory.items.find(i => i.name === itemName);
    if (!item || item.quantity < quantity) return false;

    item.quantity -= quantity;
    if (item.quantity === 0) {
      const index = inventory.items.indexOf(item);
      inventory.items.splice(index, 1);
    }
    inventory.lastUpdated = new Date();
    return true;
  }

  getItem(sessionId: string, itemName: string): InventoryItem | undefined {
    const inventory = this.inventories.get(sessionId);
    if (!inventory) return undefined;
    return inventory.items.find(i => i.name === itemName);
  }

  getInventory(sessionId: string): InventorySession | undefined {
    return this.inventories.get(sessionId);
  }

  clearInventory(sessionId: string): void {
    const inventory = this.inventories.get(sessionId);
    if (inventory) {
      inventory.items = [];
      inventory.lastUpdated = new Date();
    }
  }

  getInventoryEmbed(sessionId: string): EmbedBuilder | null {
    const inventory = this.getInventory(sessionId);
    if (!inventory) return null;

    const itemsList = inventory.items
      .slice(0, 10)
      .map(item => `**${item.name}** x${item.quantity}${item.durability ? ` (${item.durability}/${item.maxDurability})` : ''}`)
      .join('\n') || 'Empty';

    return new EmbedBuilder()
      .setTitle('🎒 Inventory')
      .addFields(
        { name: 'Items', value: itemsList, inline: false },
        { name: 'Slots Used', value: `${inventory.items.length}/${inventory.maxSlots}`, inline: true },
        { name: 'Last Updated', value: `<t:${Math.floor(inventory.lastUpdated.getTime() / 1000)}:R>`, inline: true }
      )
      .setColor(0x8B7355)
      .setTimestamp();
  }
}
