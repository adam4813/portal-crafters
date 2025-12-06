import type { CustomerTemplate, ElementType, ElementTier } from '../types';
import { getElementTier, calculateContractDifficultyFromElements } from './elements';

export const CUSTOMER_TEMPLATES: CustomerTemplate[] = [
  {
    namePool: ['Novice Mage', 'Apprentice Wizard', 'Student Alchemist', 'Hedge Witch'],
    iconPool: ['🧙', '🧝', '🧚', '👤'],
    basePayment: 50,
    paymentVariance: 20,
    basePatience: 120,
    difficultyMultiplier: 1,
  },
  {
    namePool: ['Journeyman Sorcerer', 'Battle Mage', 'Elemental Knight', 'Arcane Scholar'],
    iconPool: ['⚔️', '🏹', '🛡️', '📚'],
    basePayment: 100,
    paymentVariance: 40,
    basePatience: 90,
    difficultyMultiplier: 1.5,
  },
  {
    namePool: ['Master Conjurer', 'High Priestess', 'Archmage', 'Dragon Tamer'],
    iconPool: ['🌟', '👑', '🐉', '🔮'],
    basePayment: 200,
    paymentVariance: 80,
    basePatience: 60,
    difficultyMultiplier: 2,
  },
  {
    namePool: ['Void Walker', 'Crystal Sage', 'Shadow Master', 'Light Bringer'],
    iconPool: ['🌑', '💎', '🕳️', '✨'],
    basePayment: 400,
    paymentVariance: 100,
    basePatience: 45,
    difficultyMultiplier: 2.5,
  },
  {
    namePool: ['Temporal Mage', 'Chaos Lord', 'Life Weaver', 'Death Knight'],
    iconPool: ['⏳', '🌀', '💚', '💀'],
    basePayment: 800,
    paymentVariance: 200,
    basePatience: 30,
    difficultyMultiplier: 3,
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
