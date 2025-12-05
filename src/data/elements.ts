import type { ElementType, ResearchNode, ConversionRate } from '../types';

export interface ElementDefinition {
  type: ElementType;
  name: string;
  color: number;
  icon: string;
  description: string;
  baseUnlocked: boolean;
}

export const ELEMENTS: ElementDefinition[] = [
  {
    type: 'fire',
    name: 'Fire',
    color: 0xf56565,
    icon: '🔥',
    description: 'The element of passion and destruction',
    baseUnlocked: true,
  },
  {
    type: 'water',
    name: 'Water',
    color: 0x4299e1,
    icon: '💧',
    description: 'The element of flow and adaptation',
    baseUnlocked: true,
  },
  {
    type: 'earth',
    name: 'Earth',
    color: 0x68d391,
    icon: '🌍',
    description: 'The element of stability and endurance',
    baseUnlocked: false,
  },
  {
    type: 'air',
    name: 'Air',
    color: 0xe2e8f0,
    icon: '💨',
    description: 'The element of freedom and movement',
    baseUnlocked: false,
  },
  {
    type: 'lightning',
    name: 'Lightning',
    color: 0xfaf089,
    icon: '⚡',
    description: 'The element of power and speed',
    baseUnlocked: false,
  },
  {
    type: 'void',
    name: 'Void',
    color: 0x553c9a,
    icon: '🌑',
    description: 'The element of nothingness and potential',
    baseUnlocked: false,
  },
  {
    type: 'light',
    name: 'Light',
    color: 0xffffff,
    icon: '✨',
    description: 'The element of purity and revelation',
    baseUnlocked: false,
  },
];

export const RESEARCH_TREE: ResearchNode[] = [
  { element: 'fire', unlocked: true, cost: 0, prerequisites: [] },
  { element: 'water', unlocked: true, cost: 0, prerequisites: [] },
  { element: 'earth', unlocked: false, cost: 100, prerequisites: ['fire', 'water'] },
  { element: 'air', unlocked: false, cost: 100, prerequisites: ['fire', 'water'] },
  { element: 'lightning', unlocked: false, cost: 250, prerequisites: ['fire', 'air'] },
  { element: 'void', unlocked: false, cost: 500, prerequisites: ['earth', 'air'] },
  { element: 'light', unlocked: false, cost: 500, prerequisites: ['fire', 'water', 'lightning'] },
];

export const CONVERSION_RATES: ConversionRate[] = [
  { element: 'fire', manaPerUnit: 10, baseRate: 1, currentMultiplier: 1 },
  { element: 'water', manaPerUnit: 10, baseRate: 1, currentMultiplier: 1 },
  { element: 'earth', manaPerUnit: 12, baseRate: 0.9, currentMultiplier: 1 },
  { element: 'air', manaPerUnit: 12, baseRate: 0.9, currentMultiplier: 1 },
  { element: 'lightning', manaPerUnit: 15, baseRate: 0.8, currentMultiplier: 1 },
  { element: 'void', manaPerUnit: 20, baseRate: 0.7, currentMultiplier: 1 },
  { element: 'light', manaPerUnit: 20, baseRate: 0.7, currentMultiplier: 1 },
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
