import type { Upgrade, UpgradeType } from '../types';

export interface UpgradeDefinition {
  id: string;
  type: UpgradeType;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
  requiredTier?: number;
  // Maps tier number to max level allowed at that tier (e.g., {1: 3, 2: 6, 3: 10})
  tierLevelCaps?: Record<number, number>;
}

const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'mana_conversion_fire',
    type: 'manaConversion',
    name: 'Fire Conversion',
    description: 'Improve mana to fire element conversion rate',
    maxLevel: 5,
    baseCost: 50,
    costMultiplier: 1.5,
    effectPerLevel: 0.2,
    requiredTier: 1,
    tierLevelCaps: { 1: 2, 2: 3, 3: 4, 4: 5 },
  },
  {
    id: 'mana_conversion_water',
    type: 'manaConversion',
    name: 'Water Conversion',
    description: 'Improve mana to water element conversion rate',
    maxLevel: 5,
    baseCost: 50,
    costMultiplier: 1.5,
    effectPerLevel: 0.2,
    requiredTier: 1,
    tierLevelCaps: { 1: 2, 2: 3, 3: 4, 4: 5 },
  },
  {
    id: 'ingredient_slots',
    type: 'ingredientSlots',
    name: 'Crafting Slots',
    description: 'Unlock additional crafting slots',
    maxLevel: 4,
    baseCost: 100,
    costMultiplier: 2,
    effectPerLevel: 1,
    requiredTier: 1,
    tierLevelCaps: { 1: 1, 2: 2, 3: 3, 4: 4 },
  },
  {
    id: 'customer_patience',
    type: 'customerPatience',
    name: 'Customer Relations',
    description: 'Customers wait longer before leaving',
    maxLevel: 5,
    baseCost: 75,
    costMultiplier: 1.8,
    effectPerLevel: 15,
    requiredTier: 1,
    tierLevelCaps: { 1: 2, 2: 3, 3: 4, 4: 5 },
  },
  {
    id: 'reward_chance',
    type: 'rewardChance',
    name: 'Fortune Favor',
    description: 'Increase chance of receiving rewards from portals',
    maxLevel: 5,
    baseCost: 100,
    costMultiplier: 1.6,
    effectPerLevel: 0.1,
    requiredTier: 1,
    tierLevelCaps: { 1: 2, 2: 3, 3: 4, 4: 5 },
  },
  {
    id: 'element_efficiency',
    type: 'elementEfficiency',
    name: 'Elemental Mastery',
    description: 'All elements provide more power to portals',
    maxLevel: 5,
    baseCost: 150,
    costMultiplier: 1.7,
    effectPerLevel: 0.15,
    requiredTier: 1,
    tierLevelCaps: { 1: 2, 2: 3, 3: 4, 4: 5 },
  },
];

export class UpgradeSystem {
  private upgrades: Map<string, Upgrade> = new Map();
  private onUpgradeCallbacks: ((upgrade: Upgrade) => void)[] = [];

  constructor() {
    this.initializeUpgrades();
  }

  private initializeUpgrades(): void {
    for (const def of UPGRADE_DEFINITIONS) {
      this.upgrades.set(def.id, {
        id: def.id,
        type: def.type,
        name: def.name,
        description: def.description,
        currentLevel: 0,
        maxLevel: def.maxLevel,
        baseCost: def.baseCost,
        costMultiplier: def.costMultiplier,
        effectPerLevel: def.effectPerLevel,
        requiredTier: def.requiredTier,
        tierLevelCaps: def.tierLevelCaps,
      });
    }
  }

  /**
   * Get the max level allowed for an upgrade at the given tier
   */
  public getMaxLevelForTier(id: string, currentTier: number): number {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return 0;

    if (!upgrade.tierLevelCaps) {
      return upgrade.maxLevel;
    }

    // Find the highest tier cap that applies
    let maxAllowed = 0;
    for (const [tier, cap] of Object.entries(upgrade.tierLevelCaps)) {
      if (currentTier >= parseInt(tier, 10)) {
        maxAllowed = Math.max(maxAllowed, cap);
      }
    }

    return Math.min(maxAllowed, upgrade.maxLevel);
  }

  public initialize(upgradeLevels: Record<string, number>): void {
    for (const [id, level] of Object.entries(upgradeLevels)) {
      const upgrade = this.upgrades.get(id);
      if (upgrade) {
        upgrade.currentLevel = level;
      }
    }
  }

  public onUpgrade(callback: (upgrade: Upgrade) => void): void {
    this.onUpgradeCallbacks.push(callback);
  }

  public getUpgrade(id: string): Upgrade | undefined {
    return this.upgrades.get(id);
  }

  public getAllUpgrades(): Upgrade[] {
    return Array.from(this.upgrades.values());
  }

  public getUpgradesByType(type: UpgradeType): Upgrade[] {
    return this.getAllUpgrades().filter((u) => u.type === type);
  }

  public getUpgradeCost(id: string): number {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel));
  }

  public canUpgrade(id: string): boolean {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return false;
    return upgrade.currentLevel < upgrade.maxLevel;
  }

  public purchase(id: string): boolean {
    const upgrade = this.upgrades.get(id);
    if (!upgrade || !this.canUpgrade(id)) return false;

    upgrade.currentLevel++;
    this.onUpgradeCallbacks.forEach((cb) => cb(upgrade));
    return true;
  }

  public getEffect(id: string): number {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return 0;
    return upgrade.effectPerLevel * upgrade.currentLevel;
  }

  public getTotalEffect(type: UpgradeType): number {
    return this.getUpgradesByType(type).reduce((sum, u) => sum + this.getEffect(u.id), 0);
  }

  public getLevel(id: string): number {
    const upgrade = this.upgrades.get(id);
    return upgrade?.currentLevel || 0;
  }

  public getUpgradeLevels(): Record<string, number> {
    const levels: Record<string, number> = {};
    for (const [id, upgrade] of this.upgrades) {
      if (upgrade.currentLevel > 0) {
        levels[id] = upgrade.currentLevel;
      }
    }
    return levels;
  }

  public reset(): void {
    this.initializeUpgrades();
  }
}
