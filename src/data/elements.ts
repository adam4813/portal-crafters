import type {
  ElementType,
  ResearchNode,
  ConversionRate,
  ElementTier,
  UnlockMethod,
} from '../types';

export interface ElementDefinition {
  type: ElementType;
  name: string;
  color: number;
  icon: string;
  description: string;
  baseUnlocked: boolean;
  tier: ElementTier;
  unlockMethod: UnlockMethod;
  rarity: number; // 1-5 scale, higher is rarer
  properties: ElementProperties;
}

export interface ElementProperties {
  portalEffectMultiplier: number; // Multiplier for portal visual effects
  rewardBonusMultiplier: number; // Multiplier for reward generation
  contractDifficultyModifier: number; // Modifier for contract difficulty when required
}

// Tier configurations for easy reference
export const TIER_CONFIG: Record<
  ElementTier,
  { rarityRange: [number, number]; difficultyBase: number }
> = {
  common: { rarityRange: [1, 1], difficultyBase: 1.0 },
  standard: { rarityRange: [2, 2], difficultyBase: 1.2 },
  rare: { rarityRange: [3, 3], difficultyBase: 1.5 },
  exotic: { rarityRange: [4, 4], difficultyBase: 2.0 },
  legendary: { rarityRange: [5, 5], difficultyBase: 3.0 },
};

export const ELEMENTS: ElementDefinition[] = [
  // Common Tier - Starting elements
  {
    type: 'fire',
    name: 'Fire',
    color: 0xf56565,
    icon: '🔥',
    description: 'The element of passion and destruction',
    baseUnlocked: true,
    tier: 'common',
    unlockMethod: 'starting',
    rarity: 1,
    properties: {
      portalEffectMultiplier: 1.0,
      rewardBonusMultiplier: 1.0,
      contractDifficultyModifier: 1.0,
    },
  },
  {
    type: 'water',
    name: 'Water',
    color: 0x4299e1,
    icon: '💧',
    description: 'The element of flow and adaptation',
    baseUnlocked: true,
    tier: 'common',
    unlockMethod: 'starting',
    rarity: 1,
    properties: {
      portalEffectMultiplier: 1.0,
      rewardBonusMultiplier: 1.0,
      contractDifficultyModifier: 1.0,
    },
  },

  // Standard Tier - Early research
  {
    type: 'earth',
    name: 'Earth',
    color: 0x68d391,
    icon: '🌍',
    description: 'The element of stability and endurance',
    baseUnlocked: false,
    tier: 'standard',
    unlockMethod: 'early_research',
    rarity: 2,
    properties: {
      portalEffectMultiplier: 1.1,
      rewardBonusMultiplier: 1.1,
      contractDifficultyModifier: 1.2,
    },
  },
  {
    type: 'air',
    name: 'Air',
    color: 0xe2e8f0,
    icon: '💨',
    description: 'The element of freedom and movement',
    baseUnlocked: false,
    tier: 'standard',
    unlockMethod: 'early_research',
    rarity: 2,
    properties: {
      portalEffectMultiplier: 1.1,
      rewardBonusMultiplier: 1.1,
      contractDifficultyModifier: 1.2,
    },
  },

  // Rare Tier - Mid-game research
  {
    type: 'ice',
    name: 'Ice',
    color: 0x81e6d9,
    icon: '❄️',
    description: 'The element of cold and preservation',
    baseUnlocked: false,
    tier: 'rare',
    unlockMethod: 'mid_research',
    rarity: 3,
    properties: {
      portalEffectMultiplier: 1.3,
      rewardBonusMultiplier: 1.2,
      contractDifficultyModifier: 1.5,
    },
  },
  {
    type: 'lightning',
    name: 'Lightning',
    color: 0xfaf089,
    icon: '⚡',
    description: 'The element of power and speed',
    baseUnlocked: false,
    tier: 'rare',
    unlockMethod: 'mid_research',
    rarity: 3,
    properties: {
      portalEffectMultiplier: 1.4,
      rewardBonusMultiplier: 1.2,
      contractDifficultyModifier: 1.5,
    },
  },
  {
    type: 'metal',
    name: 'Metal',
    color: 0x718096,
    icon: '⚙️',
    description: 'The element of industry and resilience',
    baseUnlocked: false,
    tier: 'rare',
    unlockMethod: 'mid_research',
    rarity: 3,
    properties: {
      portalEffectMultiplier: 1.2,
      rewardBonusMultiplier: 1.3,
      contractDifficultyModifier: 1.5,
    },
  },
  {
    type: 'nature',
    name: 'Nature',
    color: 0x48bb78,
    icon: '🌿',
    description: 'The element of growth and vitality',
    baseUnlocked: false,
    tier: 'rare',
    unlockMethod: 'mid_research',
    rarity: 3,
    properties: {
      portalEffectMultiplier: 1.2,
      rewardBonusMultiplier: 1.4,
      contractDifficultyModifier: 1.5,
    },
  },

  // Exotic Tier - Late-game, special discoveries
  {
    type: 'shadow',
    name: 'Shadow',
    color: 0x2d3748,
    icon: '🌑',
    description: 'The element of darkness and mystery',
    baseUnlocked: false,
    tier: 'exotic',
    unlockMethod: 'late_research',
    rarity: 4,
    properties: {
      portalEffectMultiplier: 1.6,
      rewardBonusMultiplier: 1.5,
      contractDifficultyModifier: 2.0,
    },
  },
  {
    type: 'light',
    name: 'Light',
    color: 0xffffff,
    icon: '✨',
    description: 'The element of purity and revelation',
    baseUnlocked: false,
    tier: 'exotic',
    unlockMethod: 'late_research',
    rarity: 4,
    properties: {
      portalEffectMultiplier: 1.6,
      rewardBonusMultiplier: 1.5,
      contractDifficultyModifier: 2.0,
    },
  },
  {
    type: 'void',
    name: 'Void',
    color: 0x553c9a,
    icon: '🕳️',
    description: 'The element of nothingness and potential',
    baseUnlocked: false,
    tier: 'exotic',
    unlockMethod: 'late_research',
    rarity: 4,
    properties: {
      portalEffectMultiplier: 1.8,
      rewardBonusMultiplier: 1.4,
      contractDifficultyModifier: 2.0,
    },
  },
  {
    type: 'crystal',
    name: 'Crystal',
    color: 0xb794f4,
    icon: '💎',
    description: 'The element of clarity and amplification',
    baseUnlocked: false,
    tier: 'exotic',
    unlockMethod: 'late_research',
    rarity: 4,
    properties: {
      portalEffectMultiplier: 1.5,
      rewardBonusMultiplier: 1.6,
      contractDifficultyModifier: 2.0,
    },
  },
  {
    type: 'arcane',
    name: 'Arcane',
    color: 0x9f7aea,
    icon: '✴️',
    description: 'The element of pure magical essence',
    baseUnlocked: false,
    tier: 'exotic',
    unlockMethod: 'late_research',
    rarity: 4,
    properties: {
      portalEffectMultiplier: 1.7,
      rewardBonusMultiplier: 1.5,
      contractDifficultyModifier: 2.0,
    },
  },

  // Legendary Tier - Secret recipes, rare rewards
  {
    type: 'time',
    name: 'Time',
    color: 0xd69e2e,
    icon: '⏳',
    description: 'The element of temporal manipulation',
    baseUnlocked: false,
    tier: 'legendary',
    unlockMethod: 'secret_recipe',
    rarity: 5,
    properties: {
      portalEffectMultiplier: 2.0,
      rewardBonusMultiplier: 2.0,
      contractDifficultyModifier: 3.0,
    },
  },
  {
    type: 'chaos',
    name: 'Chaos',
    color: 0xe53e3e,
    icon: '🌀',
    description: 'The element of entropy and randomness',
    baseUnlocked: false,
    tier: 'legendary',
    unlockMethod: 'secret_recipe',
    rarity: 5,
    properties: {
      portalEffectMultiplier: 2.5,
      rewardBonusMultiplier: 1.8,
      contractDifficultyModifier: 3.0,
    },
  },
  {
    type: 'life',
    name: 'Life',
    color: 0x38a169,
    icon: '💚',
    description: 'The element of creation and healing',
    baseUnlocked: false,
    tier: 'legendary',
    unlockMethod: 'rare_reward',
    rarity: 5,
    properties: {
      portalEffectMultiplier: 1.8,
      rewardBonusMultiplier: 2.5,
      contractDifficultyModifier: 3.0,
    },
  },
  {
    type: 'death',
    name: 'Death',
    color: 0x1a202c,
    icon: '💀',
    description: 'The element of endings and transformation',
    baseUnlocked: false,
    tier: 'legendary',
    unlockMethod: 'rare_reward',
    rarity: 5,
    properties: {
      portalEffectMultiplier: 2.2,
      rewardBonusMultiplier: 1.9,
      contractDifficultyModifier: 3.0,
    },
  },
];

export const RESEARCH_TREE: ResearchNode[] = [
  // Common Tier - Starting elements
  { element: 'fire', unlocked: true, cost: 0, prerequisites: [] },
  { element: 'water', unlocked: true, cost: 0, prerequisites: [] },

  // Standard Tier - Early research
  { element: 'earth', unlocked: false, cost: 100, prerequisites: ['fire', 'water'] },
  { element: 'air', unlocked: false, cost: 100, prerequisites: ['fire', 'water'] },

  // Rare Tier - Mid-game research
  { element: 'ice', unlocked: false, cost: 200, prerequisites: ['water', 'air'] },
  { element: 'lightning', unlocked: false, cost: 250, prerequisites: ['fire', 'air'] },
  { element: 'metal', unlocked: false, cost: 300, prerequisites: ['earth', 'fire'] },
  { element: 'nature', unlocked: false, cost: 250, prerequisites: ['earth', 'water'] },

  // Exotic Tier - Late-game research
  { element: 'void', unlocked: false, cost: 500, prerequisites: ['earth', 'air'] },
  { element: 'shadow', unlocked: false, cost: 500, prerequisites: ['void', 'earth'] },
  { element: 'light', unlocked: false, cost: 500, prerequisites: ['fire', 'water', 'lightning'] },
  { element: 'crystal', unlocked: false, cost: 600, prerequisites: ['earth', 'light'] },
  { element: 'arcane', unlocked: false, cost: 750, prerequisites: ['lightning', 'void'] },

  // Legendary Tier - Secret recipes, rare rewards (very high cost or special unlock)
  { element: 'time', unlocked: false, cost: 2000, prerequisites: ['light', 'void', 'arcane'] },
  { element: 'chaos', unlocked: false, cost: 2500, prerequisites: ['shadow', 'lightning', 'fire'] },
  { element: 'life', unlocked: false, cost: 3000, prerequisites: ['nature', 'light', 'water'] },
  { element: 'death', unlocked: false, cost: 3000, prerequisites: ['shadow', 'void', 'chaos'] },
];

export const CONVERSION_RATES: ConversionRate[] = [
  // Common Tier
  { element: 'fire', manaPerUnit: 10, baseRate: 1, currentMultiplier: 1 },
  { element: 'water', manaPerUnit: 10, baseRate: 1, currentMultiplier: 1 },

  // Standard Tier
  { element: 'earth', manaPerUnit: 12, baseRate: 0.9, currentMultiplier: 1 },
  { element: 'air', manaPerUnit: 12, baseRate: 0.9, currentMultiplier: 1 },

  // Rare Tier
  { element: 'ice', manaPerUnit: 15, baseRate: 0.8, currentMultiplier: 1 },
  { element: 'lightning', manaPerUnit: 15, baseRate: 0.8, currentMultiplier: 1 },
  { element: 'metal', manaPerUnit: 18, baseRate: 0.75, currentMultiplier: 1 },
  { element: 'nature', manaPerUnit: 15, baseRate: 0.8, currentMultiplier: 1 },

  // Exotic Tier
  { element: 'shadow', manaPerUnit: 25, baseRate: 0.6, currentMultiplier: 1 },
  { element: 'light', manaPerUnit: 20, baseRate: 0.7, currentMultiplier: 1 },
  { element: 'void', manaPerUnit: 25, baseRate: 0.6, currentMultiplier: 1 },
  { element: 'crystal', manaPerUnit: 22, baseRate: 0.65, currentMultiplier: 1 },
  { element: 'arcane', manaPerUnit: 28, baseRate: 0.55, currentMultiplier: 1 },

  // Legendary Tier
  { element: 'time', manaPerUnit: 50, baseRate: 0.4, currentMultiplier: 1 },
  { element: 'chaos', manaPerUnit: 60, baseRate: 0.35, currentMultiplier: 1 },
  { element: 'life', manaPerUnit: 55, baseRate: 0.38, currentMultiplier: 1 },
  { element: 'death', manaPerUnit: 55, baseRate: 0.38, currentMultiplier: 1 },
];

export function getElementDefinition(type: ElementType): ElementDefinition | undefined {
  return ELEMENTS.find((el) => el.type === type);
}

export function getResearchNode(element: ElementType): ResearchNode | undefined {
  return RESEARCH_TREE.find((node) => node.element === element);
}

export function getConversionRate(element: ElementType): ConversionRate | undefined {
  return CONVERSION_RATES.find((rate) => rate.element === element);
}

// New helper functions for expanded element system

export function getElementsByTier(tier: ElementTier): ElementDefinition[] {
  return ELEMENTS.filter((el) => el.tier === tier);
}

export function getElementsByUnlockMethod(method: UnlockMethod): ElementDefinition[] {
  return ELEMENTS.filter((el) => el.unlockMethod === method);
}

export function getElementTier(type: ElementType): ElementTier | undefined {
  const element = getElementDefinition(type);
  return element?.tier;
}

export function getElementRarity(type: ElementType): number {
  const element = getElementDefinition(type);
  return element?.rarity ?? 1;
}

export function getElementProperties(type: ElementType): ElementProperties | undefined {
  const element = getElementDefinition(type);
  return element?.properties;
}

export function getStartingElements(): ElementType[] {
  return ELEMENTS.filter((el) => el.unlockMethod === 'starting').map((el) => el.type);
}

export function getResearchableElementsByTier(tier: ElementTier): ElementType[] {
  return ELEMENTS.filter((el) => el.tier === tier && !el.baseUnlocked).map((el) => el.type);
}

export function calculateContractDifficultyFromElements(elements: ElementType[]): number {
  if (elements.length === 0) return 1.0;

  let totalModifier = 0;
  for (const element of elements) {
    const properties = getElementProperties(element);
    totalModifier += properties?.contractDifficultyModifier ?? 1.0;
  }

  return totalModifier / elements.length;
}

export function calculateRewardBonusFromElements(elements: ElementType[]): number {
  if (elements.length === 0) return 1.0;

  let totalBonus = 0;
  for (const element of elements) {
    const properties = getElementProperties(element);
    totalBonus += properties?.rewardBonusMultiplier ?? 1.0;
  }

  return totalBonus / elements.length;
}

export function getElementsByRarity(minRarity: number, maxRarity: number): ElementDefinition[] {
  return ELEMENTS.filter((el) => el.rarity >= minRarity && el.rarity <= maxRarity);
}

export function getAllTiers(): ElementTier[] {
  return ['common', 'standard', 'rare', 'exotic', 'legendary'];
}

export function getTierDisplayName(tier: ElementTier): string {
  const names: Record<ElementTier, string> = {
    common: 'Common',
    standard: 'Standard',
    rare: 'Rare',
    exotic: 'Exotic',
    legendary: 'Legendary',
  };
  return names[tier];
}

export function getUnlockMethodDisplayName(method: UnlockMethod): string {
  const names: Record<UnlockMethod, string> = {
    starting: 'Starting Element',
    early_research: 'Early Research',
    mid_research: 'Mid-Game Research',
    late_research: 'Late-Game Research',
    secret_recipe: 'Secret Recipe',
    rare_reward: 'Rare Reward',
  };
  return names[method];
}
