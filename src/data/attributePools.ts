/**
 * Attribute Pools for Procedural Equipment Generation
 *
 * This file defines all possible attributes that can be combined to generate
 * unique equipment items. Each attribute contributes to the item's total cost
 * and affects portal crafting outcomes.
 *
 * Attribute Cost Contribution Scale:
 * - Negative values: Low quality items (Rusted, Worn, etc.)
 * - Zero to +5: Basic quality items
 * - +6 to +10: High quality items
 * - +11 and above: Premium/legendary items
 *
 * Level Ranges determine when attributes become available:
 * - Level 1-3: Low-tier attributes
 * - Level 4-6: Mid-tier attributes
 * - Level 7-9: High-tier attributes
 * - Level 10+: Premium-tier attributes
 */

import type {
  PrefixAttribute,
  MaterialAttribute,
  SuffixAttribute,
  GearTypeAttribute,
} from '../types';

// ============================================
// Prefix Attributes
// Affect item quality and name appearance
// ============================================

export const PREFIX_POOL: PrefixAttribute[] = [
  // Level 1-3: Low quality prefixes
  {
    id: 'rusted',
    type: 'prefix',
    name: 'Rusted',
    costContribution: -2,
    levelRange: { min: 1, max: 3 },
    description: 'Covered in rust, reducing effectiveness',
  },
  {
    id: 'worn',
    type: 'prefix',
    name: 'Worn',
    costContribution: -1,
    levelRange: { min: 1, max: 3 },
    description: 'Shows signs of heavy use',
  },
  {
    id: 'cracked',
    type: 'prefix',
    name: 'Cracked',
    costContribution: -1,
    levelRange: { min: 1, max: 3 },
    description: 'Has visible cracks affecting durability',
  },

  // Level 4-6: Mid quality prefixes
  {
    id: 'sturdy',
    type: 'prefix',
    name: 'Sturdy',
    costContribution: 2,
    levelRange: { min: 4, max: 6 },
    description: 'Built to last',
  },
  {
    id: 'polished',
    type: 'prefix',
    name: 'Polished',
    costContribution: 3,
    levelRange: { min: 4, max: 6 },
    description: 'Gleaming with care',
  },
  {
    id: 'reinforced',
    type: 'prefix',
    name: 'Reinforced',
    costContribution: 3,
    levelRange: { min: 4, max: 6 },
    description: 'Strengthened construction',
  },

  // Level 7-9: High quality prefixes
  {
    id: 'tempered',
    type: 'prefix',
    name: 'Tempered',
    costContribution: 5,
    levelRange: { min: 7, max: 9 },
    description: 'Heat-treated for superior strength',
  },
  {
    id: 'masterwork',
    type: 'prefix',
    name: 'Masterwork',
    costContribution: 7,
    levelRange: { min: 7, max: 9 },
    description: 'Crafted by a master artisan',
  },
  {
    id: 'gleaming',
    type: 'prefix',
    name: 'Gleaming',
    costContribution: 5,
    levelRange: { min: 7, max: 9 },
    description: 'Radiates with inner light',
  },

  // Level 10+: Premium prefixes
  {
    id: 'enchanted',
    type: 'prefix',
    name: 'Enchanted',
    costContribution: 10,
    levelRange: { min: 10, max: 99 },
    description: 'Imbued with magical power',
    elementAffinity: 'light',
  },
  {
    id: 'legendary',
    type: 'prefix',
    name: 'Legendary',
    costContribution: 15,
    levelRange: { min: 10, max: 99 },
    description: 'A legendary item of great renown',
  },
  {
    id: 'ancient',
    type: 'prefix',
    name: 'Ancient',
    costContribution: 12,
    levelRange: { min: 10, max: 99 },
    description: 'From a forgotten age',
    elementAffinity: 'void',
  },
];

// ============================================
// Material Attributes
// Determine base material and element affinity
// ============================================

export const MATERIAL_POOL: MaterialAttribute[] = [
  // Level 1-3: Basic materials
  {
    id: 'iron',
    type: 'material',
    name: 'Iron',
    costContribution: 0,
    levelRange: { min: 1, max: 3 },
    elementAffinity: 'earth',
    description: 'Common iron ore',
  },
  {
    id: 'wood',
    type: 'material',
    name: 'Wooden',
    costContribution: 0,
    levelRange: { min: 1, max: 3 },
    description: 'Simple wooden construction',
  },
  {
    id: 'leather',
    type: 'material',
    name: 'Leather',
    costContribution: 0,
    levelRange: { min: 1, max: 3 },
    description: 'Tanned animal hide',
  },

  // Level 4-6: Improved materials
  {
    id: 'steel',
    type: 'material',
    name: 'Steel',
    costContribution: 2,
    levelRange: { min: 4, max: 6 },
    elementAffinity: 'earth',
    description: 'Forged steel alloy',
  },
  {
    id: 'bronze',
    type: 'material',
    name: 'Bronze',
    costContribution: 1,
    levelRange: { min: 4, max: 6 },
    elementAffinity: 'fire',
    description: 'Classic bronze alloy',
  },
  {
    id: 'bone',
    type: 'material',
    name: 'Bone',
    costContribution: 2,
    levelRange: { min: 4, max: 6 },
    description: 'Carved from bone',
  },

  // Level 7-9: Rare materials
  {
    id: 'silver',
    type: 'material',
    name: 'Silver',
    costContribution: 4,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'light',
    description: 'Pure silver metal',
  },
  {
    id: 'mithril',
    type: 'material',
    name: 'Mithril',
    costContribution: 6,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'air',
    description: 'Legendary light metal',
  },
  {
    id: 'dragonscale',
    type: 'material',
    name: 'Dragonscale',
    costContribution: 6,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'fire',
    description: 'Scales from a dragon',
  },

  // Level 10+: Legendary materials
  {
    id: 'obsidian',
    type: 'material',
    name: 'Obsidian',
    costContribution: 8,
    levelRange: { min: 10, max: 99 },
    elementAffinity: 'void',
    description: 'Volcanic glass of darkness',
  },
  {
    id: 'adamantine',
    type: 'material',
    name: 'Adamantine',
    costContribution: 12,
    levelRange: { min: 10, max: 99 },
    elementAffinity: 'earth',
    description: 'Nearly indestructible metal',
  },
  {
    id: 'crystal',
    type: 'material',
    name: 'Crystal',
    costContribution: 10,
    levelRange: { min: 10, max: 99 },
    elementAffinity: 'light',
    description: 'Magically infused crystal',
  },
];

// ============================================
// Suffix Attributes
// Provide special effects and bonuses
// ============================================

export const SUFFIX_POOL: SuffixAttribute[] = [
  // Level 1-3: Basic suffixes
  {
    id: 'novice',
    type: 'suffix',
    name: 'of the Novice',
    costContribution: 1,
    levelRange: { min: 1, max: 3 },
    description: 'Suited for beginners',
    effectType: 'damage',
    effectValue: 1,
  },

  // Level 4-6: Mid-tier suffixes
  {
    id: 'strength',
    type: 'suffix',
    name: 'of Strength',
    costContribution: 3,
    levelRange: { min: 4, max: 6 },
    description: 'Grants increased power',
    effectType: 'damage',
    effectValue: 3,
  },
  {
    id: 'vigor',
    type: 'suffix',
    name: 'of Vigor',
    costContribution: 3,
    levelRange: { min: 4, max: 6 },
    description: 'Enhances vitality',
    effectType: 'defense',
    effectValue: 3,
  },

  // Level 7-9: Elemental suffixes
  {
    id: 'flames',
    type: 'suffix',
    name: 'of Flames',
    costContribution: 5,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'fire',
    description: 'Burns with inner fire',
    effectType: 'elemental',
    effectValue: 5,
  },
  {
    id: 'frost',
    type: 'suffix',
    name: 'of Frost',
    costContribution: 5,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'water',
    description: 'Chills to the bone',
    effectType: 'elemental',
    effectValue: 5,
  },
  {
    id: 'storms',
    type: 'suffix',
    name: 'of Storms',
    costContribution: 6,
    levelRange: { min: 7, max: 9 },
    elementAffinity: 'lightning',
    description: 'Crackles with electricity',
    effectType: 'elemental',
    effectValue: 6,
  },

  // Level 10+: Legendary suffixes
  {
    id: 'annihilation',
    type: 'suffix',
    name: 'of Annihilation',
    costContribution: 15,
    levelRange: { min: 10, max: 99 },
    description: 'Destroys all in its path',
    effectType: 'special',
    effectValue: 15,
  },
  {
    id: 'void',
    type: 'suffix',
    name: 'of the Void',
    costContribution: 12,
    levelRange: { min: 10, max: 99 },
    elementAffinity: 'void',
    description: 'Connected to the endless void',
    effectType: 'elemental',
    effectValue: 12,
  },
  {
    id: 'eternity',
    type: 'suffix',
    name: 'of Eternity',
    costContribution: 10,
    levelRange: { min: 10, max: 99 },
    elementAffinity: 'light',
    description: 'Timeless and eternal',
    effectType: 'special',
    effectValue: 10,
  },
];

// ============================================
// Gear Type Attributes
// Determine equipment slot and base properties
// ============================================

export const GEAR_TYPE_POOL: GearTypeAttribute[] = [
  // Weapons
  {
    id: 'sword',
    name: 'Sword',
    slot: 'weapon',
    icon: '⚔️',
    baseCost: 5,
    description: 'A standard blade',
  },
  {
    id: 'dagger',
    name: 'Dagger',
    slot: 'weapon',
    icon: '🗡️',
    baseCost: 3,
    description: 'A small quick blade',
  },
  {
    id: 'staff',
    name: 'Staff',
    slot: 'weapon',
    icon: '🪄',
    baseCost: 4,
    description: 'A magical staff',
  },
  {
    id: 'axe',
    name: 'Axe',
    slot: 'weapon',
    icon: '🪓',
    baseCost: 6,
    description: 'A heavy chopping weapon',
  },
  {
    id: 'bow',
    name: 'Bow',
    slot: 'weapon',
    icon: '🏹',
    baseCost: 5,
    description: 'A ranged weapon',
  },

  // Armor
  {
    id: 'helmet',
    name: 'Helmet',
    slot: 'armor',
    icon: '⛑️',
    baseCost: 4,
    description: 'Head protection',
  },
  {
    id: 'chestplate',
    name: 'Chestplate',
    slot: 'armor',
    icon: '🛡️',
    baseCost: 6,
    description: 'Torso protection',
  },
  {
    id: 'gauntlets',
    name: 'Gauntlets',
    slot: 'armor',
    icon: '🧤',
    baseCost: 3,
    description: 'Hand protection',
  },
  {
    id: 'boots',
    name: 'Boots',
    slot: 'armor',
    icon: '👢',
    baseCost: 3,
    description: 'Foot protection',
  },
  {
    id: 'robes',
    name: 'Robes',
    slot: 'armor',
    icon: '👘',
    baseCost: 4,
    description: 'Magical robes',
  },

  // Accessories
  {
    id: 'ring',
    name: 'Ring',
    slot: 'accessory',
    icon: '💍',
    baseCost: 2,
    description: 'A finger ring',
  },
  {
    id: 'amulet',
    name: 'Amulet',
    slot: 'accessory',
    icon: '📿',
    baseCost: 3,
    description: 'A neck amulet',
  },
  {
    id: 'bracelet',
    name: 'Bracelet',
    slot: 'accessory',
    icon: '⌚',
    baseCost: 2,
    description: 'A wrist bracelet',
  },
  {
    id: 'orb',
    name: 'Orb',
    slot: 'accessory',
    icon: '🔮',
    baseCost: 4,
    description: 'A magical orb',
  },

  // Consumables
  {
    id: 'potion',
    name: 'Potion',
    slot: 'consumable',
    icon: '🧪',
    baseCost: 2,
    description: 'A magical potion',
  },
  {
    id: 'scroll',
    name: 'Scroll',
    slot: 'consumable',
    icon: '📜',
    baseCost: 3,
    description: 'An enchanted scroll',
  },
  {
    id: 'gem',
    name: 'Gem',
    slot: 'consumable',
    icon: '💎',
    baseCost: 4,
    description: 'A magical gem',
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get attributes available for a given level from a pool.
 */
export function getAttributesForLevel<T extends { levelRange: { min: number; max: number } }>(
  pool: T[],
  level: number
): T[] {
  return pool.filter((attr) => level >= attr.levelRange.min && level <= attr.levelRange.max);
}

/**
 * Get a random attribute from a pool for the given level.
 */
export function getRandomAttributeForLevel<T extends { levelRange: { min: number; max: number } }>(
  pool: T[],
  level: number
): T | undefined {
  const eligible = getAttributesForLevel(pool, level);
  if (eligible.length === 0) return undefined;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Get prefix by ID.
 */
export function getPrefixById(id: string): PrefixAttribute | undefined {
  return PREFIX_POOL.find((p) => p.id === id);
}

/**
 * Get material by ID.
 */
export function getMaterialById(id: string): MaterialAttribute | undefined {
  return MATERIAL_POOL.find((m) => m.id === id);
}

/**
 * Get suffix by ID.
 */
export function getSuffixById(id: string): SuffixAttribute | undefined {
  return SUFFIX_POOL.find((s) => s.id === id);
}

/**
 * Get gear type by ID.
 */
export function getGearTypeById(id: string): GearTypeAttribute | undefined {
  return GEAR_TYPE_POOL.find((g) => g.id === id);
}

/**
 * Determine rarity based on total cost contribution.
 */
export function calculateRarityFromCost(
  totalCost: number
): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  if (totalCost < 5) return 'common';
  if (totalCost < 10) return 'uncommon';
  if (totalCost < 20) return 'rare';
  if (totalCost < 35) return 'epic';
  return 'legendary';
}
