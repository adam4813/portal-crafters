import type {
  CustomerTemplate,
  ElementType,
  ElementTier,
  ContractModifier,
  Reward,
  RewardTier,
} from '../types';
import { getElementTier, calculateContractDifficultyFromElements } from './elements';

export const CUSTOMER_TEMPLATES: CustomerTemplate[] = [
  // Tier 1: Common/Novice customers
  {
    namePool: ['Novice Mage', 'Apprentice Wizard', 'Student Alchemist', 'Hedge Witch'],
    iconPool: ['🧙', '🧝', '🧚', '👤'],
    basePayment: 50,
    paymentVariance: 20,
    basePatience: 120,
    difficultyMultiplier: 1,
    tier: 1,
    modifierChances: {
      urgent: 0.05,
      bonus: 0.1,
    },
  },
  // Tier 2: Intermediate customers
  {
    namePool: ['Journeyman Sorcerer', 'Battle Mage', 'Elemental Knight', 'Arcane Scholar'],
    iconPool: ['⚔️', '🏹', '🛡️', '📚'],
    basePayment: 100,
    paymentVariance: 40,
    basePatience: 90,
    difficultyMultiplier: 1.5,
    tier: 2,
    modifierChances: {
      urgent: 0.1,
      bonus: 0.15,
      perfectionist: 0.05,
    },
  },
  // Tier 3: Advanced customers
  {
    namePool: ['Master Conjurer', 'High Priestess', 'Archmage', 'Dragon Tamer'],
    iconPool: ['🌟', '👑', '🐉', '🔮'],
    basePayment: 200,
    paymentVariance: 80,
    basePatience: 60,
    difficultyMultiplier: 2,
    tier: 3,
    modifierChances: {
      urgent: 0.15,
      bonus: 0.2,
      perfectionist: 0.1,
      bulk_order: 0.05,
    },
  },
  // Tier 3-4: Elite customers
  {
    namePool: ['Void Walker', 'Crystal Sage', 'Shadow Master', 'Light Bringer'],
    iconPool: ['🌑', '💎', '🕳️', '✨'],
    basePayment: 400,
    paymentVariance: 100,
    basePatience: 45,
    difficultyMultiplier: 2.5,
    tier: 4,
    specialRewardChance: 0.1,
    modifierChances: {
      urgent: 0.2,
      bonus: 0.25,
      perfectionist: 0.15,
      bulk_order: 0.1,
      experimental: 0.05,
    },
  },
  // Tier 4-5: Master customers
  {
    namePool: ['Temporal Mage', 'Chaos Lord', 'Life Weaver', 'Death Knight'],
    iconPool: ['⏳', '🌀', '💚', '💀'],
    basePayment: 800,
    paymentVariance: 200,
    basePatience: 30,
    difficultyMultiplier: 3,
    tier: 5,
    specialRewardChance: 0.15,
    modifierChances: {
      urgent: 0.25,
      bonus: 0.3,
      perfectionist: 0.2,
      bulk_order: 0.15,
      experimental: 0.1,
    },
  },
  // Tier 5: Legendary customers
  {
    namePool: ['Planeswalker', 'Dimensional Archon', 'Cosmic Weaver', 'Reality Shaper'],
    iconPool: ['🌌', '♾️', '🎆', '🔱'],
    basePayment: 1200,
    paymentVariance: 300,
    basePatience: 40,
    difficultyMultiplier: 3.5,
    tier: 5,
    specialRewardChance: 0.2,
    modifierChances: {
      urgent: 0.2,
      bonus: 0.35,
      perfectionist: 0.25,
      bulk_order: 0.2,
      experimental: 0.15,
    },
  },
  // Special: Wealthy Merchant (rare, high payment, simpler requirements)
  {
    namePool: ['Wealthy Merchant', 'Noble Collector', 'Royal Emissary', 'Trade Prince'],
    iconPool: ['💰', '👔', '🎩', '💎'],
    basePayment: 500,
    paymentVariance: 200,
    basePatience: 150,
    difficultyMultiplier: 1.8,
    tier: 3,
    isSpecial: true,
    specialRewardChance: 0.3,
    modifierChances: {
      bonus: 0.5,
      bulk_order: 0.3,
    },
  },
  // Special: Experimental Researcher (rare, complex requirements, unique rewards)
  {
    namePool: ['Mad Scientist', 'Experimental Alchemist', 'Portal Researcher', 'Arcane Theorist'],
    iconPool: ['🧪', '🔬', '📡', '🧬'],
    basePayment: 300,
    paymentVariance: 150,
    basePatience: 200,
    difficultyMultiplier: 2.2,
    tier: 3,
    isSpecial: true,
    specialRewardChance: 0.5,
    modifierChances: {
      experimental: 0.6,
      perfectionist: 0.3,
      bonus: 0.2,
    },
  },
  // Special: Ancient Entity (very rare, extreme requirements, legendary rewards)
  {
    namePool: ['Ancient Dragon', 'Forgotten God', 'Primordial Being', 'Eldritch Entity'],
    iconPool: ['🐲', '👁️', '🦑', '🌠'],
    basePayment: 2000,
    paymentVariance: 500,
    basePatience: 60,
    difficultyMultiplier: 4,
    tier: 5,
    isSpecial: true,
    specialRewardChance: 0.8,
    modifierChances: {
      perfectionist: 0.4,
      bulk_order: 0.3,
      experimental: 0.2,
    },
  },
  // Special: Time-Traveler (rare, unusual requirements, varied rewards)
  {
    namePool: ['Time Traveler', 'Chrono Wanderer', 'Temporal Tourist', 'Future Seeker'],
    iconPool: ['⏰', '🌀', '⌛', '🔮'],
    basePayment: 600,
    paymentVariance: 250,
    basePatience: 90,
    difficultyMultiplier: 2.8,
    tier: 4,
    isSpecial: true,
    specialRewardChance: 0.4,
    modifierChances: {
      urgent: 0.4,
      experimental: 0.35,
      bonus: 0.25,
    },
  },
];

export const CUSTOMER_ADJECTIVES: string[] = [
  'Eager',
  'Patient',
  'Demanding',
  'Mysterious',
  'Wealthy',
  'Skeptical',
  'Friendly',
  'Grumpy',
  'Excited',
  'Nervous',
];

// Element requirements organized by tier complexity
export const ELEMENT_REQUIREMENTS: ElementType[][] = [
  // Common tier combinations
  ['fire'],
  ['water'],
  ['fire', 'water'],

  // Standard tier combinations
  ['earth'],
  ['air'],
  ['earth', 'air'],
  ['fire', 'earth'],
  ['water', 'air'],

  // Rare tier combinations
  ['ice'],
  ['lightning'],
  ['metal'],
  ['nature'],
  ['fire', 'lightning'],
  ['water', 'ice'],
  ['earth', 'metal'],
  ['air', 'nature'],
  ['ice', 'nature'],

  // Exotic tier combinations
  ['shadow'],
  ['light'],
  ['void'],
  ['crystal'],
  ['arcane'],
  ['shadow', 'light'],
  ['void', 'crystal'],
  ['lightning', 'arcane'],
  ['shadow', 'void'],
  ['light', 'crystal'],

  // Legendary tier combinations
  ['time'],
  ['chaos'],
  ['life'],
  ['death'],
  ['time', 'chaos'],
  ['life', 'death'],
  ['time', 'void'],
  ['chaos', 'arcane'],
];

export function generateCustomerName(template: CustomerTemplate): string {
  const adjective = CUSTOMER_ADJECTIVES[Math.floor(Math.random() * CUSTOMER_ADJECTIVES.length)];
  const baseName = template.namePool[Math.floor(Math.random() * template.namePool.length)];
  return `${adjective} ${baseName}`;
}

export function generateCustomerIcon(template: CustomerTemplate): string {
  return template.iconPool[Math.floor(Math.random() * template.iconPool.length)];
}

export function generatePayment(template: CustomerTemplate): number {
  const variance = (Math.random() - 0.5) * 2 * template.paymentVariance;
  return Math.floor(template.basePayment + variance);
}

/**
 * Calculate payment bonus based on element tiers used in contract
 */
export function calculatePaymentBonusFromElements(elements: ElementType[]): number {
  if (elements.length === 0) return 1.0;

  const difficultyModifier = calculateContractDifficultyFromElements(elements);
  // Higher difficulty elements give better payment
  return difficultyModifier;
}

/**
 * Get the highest tier among the provided elements
 */
export function getHighestElementTier(elements: ElementType[]): ElementTier {
  const tierOrder: ElementTier[] = ['common', 'standard', 'rare', 'exotic', 'legendary'];
  let highestIndex = 0;

  for (const element of elements) {
    const tier = getElementTier(element);
    if (tier) {
      const index = tierOrder.indexOf(tier);
      if (index > highestIndex) {
        highestIndex = index;
      }
    }
  }

  return tierOrder[highestIndex];
}

/**
 * Calculate adjusted payment with modifier bonuses
 */
export function calculateAdjustedPayment(
  basePayment: number,
  modifiers?: ContractModifier[]
): number {
  if (!modifiers || modifiers.length === 0) {
    return basePayment;
  }

  let adjustedPayment = basePayment;
  for (const modifier of modifiers) {
    switch (modifier) {
      case 'urgent':
        adjustedPayment = Math.floor(adjustedPayment * 1.3); // 30% bonus
        break;
      case 'bonus':
        adjustedPayment = Math.floor(adjustedPayment * 1.2); // 20% bonus
        break;
      case 'perfectionist':
        adjustedPayment = Math.floor(adjustedPayment * 1.25); // 25% bonus
        break;
      case 'bulk_order':
        adjustedPayment = Math.floor(adjustedPayment * 1.4); // 40% bonus
        break;
      case 'experimental':
        adjustedPayment = Math.floor(adjustedPayment * 1.15); // 15% bonus
        break;
    }
  }

  return adjustedPayment;
}

export function selectElementRequirements(
  unlockedElements: ElementType[],
  difficulty: number
): ElementType[] {
  const availableRequirements = ELEMENT_REQUIREMENTS.filter((req) =>
    req.every((el) => unlockedElements.includes(el))
  );

  if (availableRequirements.length === 0) {
    return [unlockedElements[0]];
  }

  // Higher difficulty tends toward more complex requirements
  const maxIndex = Math.min(
    Math.floor(difficulty * availableRequirements.length),
    availableRequirements.length - 1
  );
  const index = Math.floor(Math.random() * (maxIndex + 1));
  return availableRequirements[index];
}

/**
 * Select element requirements based on tier preference
 */
export function selectElementRequirementsByTier(
  unlockedElements: ElementType[],
  preferredTier: ElementTier
): ElementType[] {
  // Filter requirements that match the preferred tier or lower
  const tierOrder: ElementTier[] = ['common', 'standard', 'rare', 'exotic', 'legendary'];
  const maxTierIndex = tierOrder.indexOf(preferredTier);

  const availableRequirements = ELEMENT_REQUIREMENTS.filter((req) => {
    // Check all elements are unlocked
    if (!req.every((el) => unlockedElements.includes(el))) {
      return false;
    }

    // Check highest tier in requirement matches or is below preferred tier
    const highestTier = getHighestElementTier(req);
    return tierOrder.indexOf(highestTier) <= maxTierIndex;
  });

  if (availableRequirements.length === 0) {
    return [unlockedElements[0]];
  }

  // Prefer requirements that include elements of the preferred tier
  const preferredRequirements = availableRequirements.filter((req) => {
    const highestTier = getHighestElementTier(req);
    return highestTier === preferredTier;
  });

  const requirementsToUse =
    preferredRequirements.length > 0 ? preferredRequirements : availableRequirements;
  const index = Math.floor(Math.random() * requirementsToUse.length);
  return requirementsToUse[index];
}

/**
 * Generate contract modifiers based on template and difficulty
 */
export function generateContractModifiers(
  template: CustomerTemplate,
  difficulty: number
): ContractModifier[] {
  const modifiers: ContractModifier[] = [];

  if (!template.modifierChances) {
    return modifiers;
  }

  // Check each modifier type based on its probability
  const modifierTypes: Array<keyof NonNullable<CustomerTemplate['modifierChances']>> = [
    'urgent',
    'bonus',
    'perfectionist',
    'bulk_order',
    'experimental',
  ];

  for (const modifierType of modifierTypes) {
    const chance = template.modifierChances[modifierType] || 0;
    // Increase chance slightly with difficulty
    const adjustedChance = Math.min(chance * (1 + difficulty * 0.1), chance * 1.5);

    if (Math.random() < adjustedChance) {
      modifiers.push(modifierType);
    }
  }

  return modifiers;
}

/**
 * Generate a special reward for a customer contract
 */
export function generateSpecialReward(
  template: CustomerTemplate,
  difficulty: number
): Reward | undefined {
  if (!template.specialRewardChance) {
    return undefined;
  }

  if (Math.random() > template.specialRewardChance) {
    return undefined;
  }

  // Determine reward type based on difficulty and template tier
  const roll = Math.random();
  const tier = template.tier || 1;

  if (roll < 0.4) {
    // Ingredient reward (40% chance)
    // Select ingredient based on tier
    const ingredientsByTier: Record<number, string[]> = {
      1: ['fire_crystal', 'water_essence'],
      2: ['earth_shard', 'wind_wisp', 'iron_ore'],
      3: ['lightning_spark', 'copper_wire', 'glass_lens', 'enchanted_ink'],
      4: ['moon_dust', 'ancient_rune', 'phoenix_feather'],
      5: ['dragon_scale', 'mana_crystal', 'philosophers_stone'],
    };

    const availableIngredients = ingredientsByTier[tier] || ingredientsByTier[1];
    const selectedIngredient =
      availableIngredients[Math.floor(Math.random() * availableIngredients.length)];

    return {
      type: 'ingredient',
      amount: Math.floor(1 + difficulty * 0.5),
      itemId: selectedIngredient,
    };
  } else if (roll < 0.7) {
    // Generated equipment reward (30% chance)
    return {
      type: 'generatedEquipment',
      // Will be generated by RewardSystem
    };
  } else if (roll < 0.9) {
    // Mana reward (20% chance)
    return {
      type: 'mana',
      amount: Math.floor(50 + tier * 30 + difficulty * 20),
    };
  } else {
    // Extra gold reward (10% chance)
    return {
      type: 'gold',
      amount: Math.floor(template.basePayment * (0.5 + difficulty * 0.2)),
    };
  }
}

/**
 * Determine reward tier based on template and modifiers
 */
export function determineRewardTier(
  template: CustomerTemplate,
  modifiers: ContractModifier[]
): RewardTier {
  const tier = template.tier || 1;
  const hasSpecialReward = template.specialRewardChance && template.specialRewardChance > 0;
  const modifierCount = modifiers.length;

  // Ancient entities and high-tier special customers get unique rewards
  if (template.isSpecial && tier >= 5 && hasSpecialReward) {
    return 'unique';
  }

  // High-tier customers with modifiers get rare rewards
  if (tier >= 4 || (tier >= 3 && modifierCount >= 2)) {
    return 'rare';
  }

  // Mid-tier customers with some modifiers get enhanced rewards
  if (tier >= 2 && (modifierCount >= 1 || hasSpecialReward)) {
    return 'enhanced';
  }

  return 'standard';
}
