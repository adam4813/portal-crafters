import type { Expedition, ExpeditionReward, Portal } from '../types';

/**
 * Calculate expedition duration based on portal level
 * Higher level portals take longer but yield better rewards
 * Level 1: ~60-90 seconds
 * Level 2: ~2-3 minutes
 * Level 3: ~3-4 minutes
 * Level 4: ~5-6 minutes
 * Level 5+: ~7-10 minutes
 */
function calculateExpeditionDuration(portal: Portal): number {
  const level = portal.level;

  // Base duration scales with level (in seconds)
  // Using a curve: level 1 = 60s, level 2 = 120s, level 3 = 180s, level 4 = 300s, level 5 = 420s
  let baseDuration: number;
  if (level <= 1) {
    baseDuration = 60; // 1 minute
  } else if (level === 2) {
    baseDuration = 120; // 2 minutes
  } else if (level === 3) {
    baseDuration = 180; // 3 minutes
  } else if (level === 4) {
    baseDuration = 300; // 5 minutes
  } else {
    // Level 5+: 7 minutes base + 1 minute per level above 5
    baseDuration = 420 + (level - 5) * 60;
  }

  // Small reduction from mana invested (max 20% reduction)
  const manaBonus = Math.min(portal.manaInvested / 500, 0.2);
  const finalDuration = Math.floor(baseDuration * (1 - manaBonus));

  // Minimum 30 seconds, maximum 15 minutes
  return Math.max(30, Math.min(finalDuration, 900));
}

/**
 * Calculate rewards based on portal's elemental composition
 */
function calculateExpeditionRewards(portal: Portal): ExpeditionReward[] {
  const rewards: ExpeditionReward[] = [];
  const elements = portal.elements;

  // Fire element: fire crystals, metal ore
  if (elements.fire && elements.fire > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'fire_crystal',
      amount: Math.ceil(elements.fire / 3),
      chance: 0.8,
    });
    if (elements.fire >= 5) {
      rewards.push({ type: 'ingredient', itemId: 'metal_ore', amount: 1, chance: 0.4 });
    }
  }

  // Water element: water essence
  if (elements.water && elements.water > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'water_essence',
      amount: Math.ceil(elements.water / 3),
      chance: 0.8,
    });
  }

  // Earth element: stone, metal ore
  if (elements.earth && elements.earth > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'stone',
      amount: Math.ceil(elements.earth / 2),
      chance: 0.9,
    });
    if (elements.earth >= 5) {
      rewards.push({ type: 'ingredient', itemId: 'metal_ore', amount: 1, chance: 0.5 });
    }
  }

  // Air element: lightning shards
  if (elements.air && elements.air > 0) {
    if (elements.air >= 5) {
      rewards.push({ type: 'ingredient', itemId: 'lightning_shard', amount: 1, chance: 0.3 });
    }
  }

  // Nature/Plant element: wood, herbs
  if (elements.nature && elements.nature > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'wood',
      amount: Math.ceil(elements.nature / 2),
      chance: 1.0,
    });
    rewards.push({
      type: 'ingredient',
      itemId: 'herb',
      amount: Math.ceil(elements.nature / 3),
      chance: 0.7,
    });
    if (elements.nature >= 5) {
      rewards.push({ type: 'ingredient', itemId: 'nature_essence', amount: 1, chance: 0.4 });
    }
  }

  // Ice element: ice crystals
  if (elements.ice && elements.ice > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'ice_crystal',
      amount: Math.ceil(elements.ice / 3),
      chance: 0.7,
    });
  }

  // Lightning element: lightning shards
  if (elements.lightning && elements.lightning > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'lightning_shard',
      amount: Math.ceil(elements.lightning / 4),
      chance: 0.6,
    });
  }

  // Metal element: metal ore, equipment
  if (elements.metal && elements.metal > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'metal_ore',
      amount: Math.ceil(elements.metal / 2),
      chance: 0.8,
    });
    if (elements.metal >= 5) {
      rewards.push({ type: 'equipment', itemId: 'sword', amount: 1, chance: 0.3 });
    }
  }

  // Shadow element: shadow essence
  if (elements.shadow && elements.shadow > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'shadow_essence',
      amount: Math.ceil(elements.shadow / 3),
      chance: 0.6,
    });
  }

  // Light element: light crystals
  if (elements.light && elements.light > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'light_crystal',
      amount: Math.ceil(elements.light / 3),
      chance: 0.6,
    });
  }

  // Void element: void crystals
  if (elements.void && elements.void > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'void_crystal',
      amount: Math.ceil(elements.void / 4),
      chance: 0.5,
    });
  }

  // Arcane element: arcane dust
  if (elements.arcane && elements.arcane > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'arcane_dust',
      amount: Math.ceil(elements.arcane / 3),
      chance: 0.7,
    });
  }

  // Time element: time sand
  if (elements.time && elements.time > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'time_sand',
      amount: Math.ceil(elements.time / 4),
      chance: 0.5,
    });
  }

  // Chaos element: chaos ember
  if (elements.chaos && elements.chaos > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'chaos_ember',
      amount: Math.ceil(elements.chaos / 4),
      chance: 0.5,
    });
  }

  // Life element: life essence
  if (elements.life && elements.life > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'life_essence',
      amount: Math.ceil(elements.life / 4),
      chance: 0.4,
    });
  }

  // Death element: death shards
  if (elements.death && elements.death > 0) {
    rewards.push({
      type: 'ingredient',
      itemId: 'death_shard',
      amount: Math.ceil(elements.death / 4),
      chance: 0.4,
    });
  }

  // Base rewards: some gold based on portal level
  const goldAmount = portal.level * 20 + Math.floor(portal.manaInvested / 10);
  if (goldAmount > 0) {
    rewards.push({ type: 'gold', amount: goldAmount, chance: 0.8 });
  }

  // High level portals can return mana
  if (portal.level >= 5) {
    rewards.push({ type: 'mana', amount: Math.floor(portal.manaInvested * 0.3), chance: 0.5 });
  }

  return rewards;
}

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
   * Get all active expeditions
   */
  public getActiveExpeditions(): Expedition[] {
    return [...this.activeExpeditions];
  }

  /**
   * Start a new expedition using a portal
   */
  public startExpedition(portal: Portal): Expedition {
    const expedition: Expedition = {
      id: `expedition-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      portalId: portal.id,
      portalSnapshot: { ...portal },
      startedAt: Date.now(),
      duration: calculateExpeditionDuration(portal),
    };

    this.activeExpeditions.push(expedition);
    return expedition;
  }

  /**
   * Check if an expedition is complete
   */
  public isExpeditionComplete(expeditionId: string): boolean {
    const expedition = this.activeExpeditions.find((e) => e.id === expeditionId);
    if (!expedition) return false;

    const elapsed = Date.now() - expedition.startedAt;
    return elapsed >= expedition.duration * 1000;
  }

  /**
   * Complete an expedition and get rewards
   */
  public completeExpedition(expeditionId: string): ExpeditionReward[] | null {
    const index = this.activeExpeditions.findIndex((e) => e.id === expeditionId);
    if (index === -1) return null;

    const expedition = this.activeExpeditions[index];

    // Check if expedition is actually complete
    if (!this.isExpeditionComplete(expeditionId)) {
      return null;
    }

    // Remove from active expeditions
    this.activeExpeditions.splice(index, 1);

    // Calculate rewards based on portal
    const allRewards = calculateExpeditionRewards(expedition.portalSnapshot);

    // Apply probability to get actual rewards
    const actualRewards: ExpeditionReward[] = [];
    for (const reward of allRewards) {
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
    const expedition = this.activeExpeditions.find((e) => e.id === expeditionId);
    if (!expedition) return 0;

    const elapsed = (Date.now() - expedition.startedAt) / 1000;
    const remaining = expedition.duration - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Get a description of what rewards an expedition might yield
   */
  public getExpectedRewards(portal: Portal): ExpeditionReward[] {
    return calculateExpeditionRewards(portal);
  }

  /**
   * Get the expected duration for a portal expedition
   */
  public getExpectedDuration(portal: Portal): number {
    return calculateExpeditionDuration(portal);
  }

  /**
   * Get the current state for saving
   */
  public getState(): Expedition[] {
    return [...this.activeExpeditions];
  }
}
