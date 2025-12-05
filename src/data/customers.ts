import type { CustomerTemplate, ElementType } from '../types';

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

export const ELEMENT_REQUIREMENTS: ElementType[][] = [
  ['fire'],
  ['water'],
  ['fire', 'water'],
  ['earth'],
  ['air'],
  ['earth', 'air'],
  ['lightning'],
  ['fire', 'earth'],
  ['water', 'air'],
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
