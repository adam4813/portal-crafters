import type { Expedition, ExpeditionReward } from '../types';

/**
 * Available expedition templates
 * These expeditions allow players to gather specific ingredients/items
 */
const EXPEDITION_TEMPLATES: Omit<Expedition, 'id' | 'startedAt'>[] = [
  {
    name: 'Forest Gathering',
    description: 'Send a party to gather herbs and wood from the nearby forest',
    duration: 300, // 5 minutes
    requirements: {
      gold: 20,
    },
    rewards: [
      { type: 'ingredient', itemId: 'wood', amount: 3, chance: 1.0 },
      { type: 'ingredient', itemId: 'herb', amount: 2, chance: 0.8 },
      { type: 'ingredient', itemId: 'nature_essence', amount: 1, chance: 0.3 },
    ],
  },
  {
    name: 'Cave Expedition',
    description: 'Explore dark caves to mine crystals and rare minerals',
    duration: 600, // 10 minutes
    requirements: {
      gold: 50,
    },
    rewards: [
      { type: 'ingredient', itemId: 'stone', amount: 5, chance: 1.0 },
      { type: 'ingredient', itemId: 'crystal', amount: 2, chance: 0.6 },
      { type: 'ingredient', itemId: 'metal_ore', amount: 1, chance: 0.4 },
    ],
  },
  {
    name: 'Elemental Hunt',
    description: 'Hunt elemental creatures to extract their essence',
    duration: 900, // 15 minutes
    requirements: {
      gold: 100,
      mana: 50,
    },
    rewards: [
      { type: 'ingredient', itemId: 'fire_crystal', amount: 2, chance: 0.7 },
      { type: 'ingredient', itemId: 'water_essence', amount: 2, chance: 0.7 },
      { type: 'ingredient', itemId: 'lightning_shard', amount: 1, chance: 0.4 },
    ],
  },
  {
    name: 'Dungeon Crawl',
    description: 'Delve into dangerous dungeons for equipment and treasures',
    duration: 1200, // 20 minutes
    requirements: {
      gold: 150,
    },
    rewards: [
      { type: 'gold', amount: 200, chance: 1.0 },
      { type: 'equipment', itemId: 'sword', amount: 1, chance: 0.5 },
      { type: 'equipment', itemId: 'shield', amount: 1, chance: 0.5 },
      { type: 'ingredient', itemId: 'shadow_essence', amount: 1, chance: 0.3 },
    ],
  },
  {
    name: 'Ancient Ruins',
    description: 'Search ancient ruins for powerful artifacts and rare ingredients',
    duration: 1800, // 30 minutes
    requirements: {
      gold: 250,
      mana: 100,
    },
    rewards: [
      { type: 'ingredient', itemId: 'arcane_dust', amount: 3, chance: 0.8 },
      { type: 'ingredient', itemId: 'void_crystal', amount: 1, chance: 0.5 },
      { type: 'mana', amount: 150, chance: 0.6 },
      { type: 'gold', amount: 300, chance: 0.7 },
    ],
  },
  {
    name: 'Temporal Rift',
    description: 'Brave the dangers of time itself to gather cosmic ingredients',
    duration: 2400, // 40 minutes
    requirements: {
      gold: 500,
      mana: 200,
    },
    rewards: [
      { type: 'ingredient', itemId: 'time_sand', amount: 2, chance: 0.6 },
      { type: 'ingredient', itemId: 'chaos_ember', amount: 2, chance: 0.6 },
      { type: 'ingredient', itemId: 'life_essence', amount: 1, chance: 0.3 },
      { type: 'ingredient', itemId: 'death_shard', amount: 1, chance: 0.3 },
    ],
  },
];

export class ExpeditionSystem {
  private activeExpeditions: Expedition[] = [];

  /**
   * Initialize with saved expeditions
   */
  public initialize(savedExpeditions?: Expedition[]): void {
    if (savedExpeditions) {
      this.activeExpeditions = [...savedExpeditions];
    }
  }

  /**
   * Get all available expedition templates
   */
  public getAvailableExpeditions(): Omit<Expedition, 'id' | 'startedAt'>[] {
    return [...EXPEDITION_TEMPLATES];
  }

  /**
   * Get all active expeditions
   */
  public getActiveExpeditions(): Expedition[] {
    return [...this.activeExpeditions];
  }

  /**
   * Start a new expedition
   */
  public startExpedition(templateIndex: number): Expedition | null {
    if (templateIndex < 0 || templateIndex >= EXPEDITION_TEMPLATES.length) {
      return null;
    }

    const template = EXPEDITION_TEMPLATES[templateIndex];
    const expedition: Expedition = {
      ...template,
      id: `expedition-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      startedAt: Date.now(),
    };

    this.activeExpeditions.push(expedition);
    return expedition;
  }

  /**
   * Check if an expedition is complete
   */
  public isExpeditionComplete(expeditionId: string): boolean {
    const expedition = this.activeExpeditions.find(e => e.id === expeditionId);
    if (!expedition) return false;

    const elapsed = Date.now() - expedition.startedAt;
    return elapsed >= expedition.duration * 1000;
  }

  /**
   * Complete an expedition and get rewards
   */
  public completeExpedition(expeditionId: string): ExpeditionReward[] | null {
    const index = this.activeExpeditions.findIndex(e => e.id === expeditionId);
    if (index === -1) return null;

    const expedition = this.activeExpeditions[index];
    
    // Check if expedition is actually complete
    if (!this.isExpeditionComplete(expeditionId)) {
      return null;
    }

    // Remove from active expeditions
    this.activeExpeditions.splice(index, 1);

    // Calculate actual rewards based on chance
    const actualRewards: ExpeditionReward[] = [];
    for (const reward of expedition.rewards) {
      if (Math.random() < reward.chance) {
        actualRewards.push({ ...reward });
      }
    }

    return actualRewards;
  }

  /**
   * Get the time remaining for an expedition in seconds
   */
  public getTimeRemaining(expeditionId: string): number {
    const expedition = this.activeExpeditions.find(e => e.id === expeditionId);
    if (!expedition) return 0;

    const elapsed = (Date.now() - expedition.startedAt) / 1000;
    const remaining = expedition.duration - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Get the current state for saving
   */
  public getState(): Expedition[] {
    return [...this.activeExpeditions];
  }
}
