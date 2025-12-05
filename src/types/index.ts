// Element types available in the game
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'lightning' | 'void' | 'light';

// Ingredient categories
export type IngredientCategory = 'elemental' | 'equipment' | 'mundane';

// Ingredient interface
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  icon: string;
  description: string;
  elementAffinity?: ElementType;
  baseValue: number;
}

// Equipment rarity levels
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Equipment slot types
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'consumable';

// RPG Equipment interface
export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  icon: string;
  description: string;
  portalBonus: number;
  elementBonus?: Partial<Record<ElementType, number>>;
}

// Portal level and properties
export interface Portal {
  id: string;
  level: number;
  manaInvested: number;
  elements: Partial<Record<ElementType, number>>;
  ingredients: string[];
  equipment: string[];
  visualColor: number;
  visualIntensity: number;
  createdAt: number;
}

// Customer contract requirements
export interface ContractRequirements {
  minLevel: number;
  requiredElements?: ElementType[];
  minElementAmount?: number;
}

// Customer interface
export interface Customer {
  id: string;
  name: string;
  icon: string;
  requirements: ContractRequirements;
  payment: number;
  patience: number; // Time in seconds before leaving
  arrivedAt: number;
}

// Customer template for generating new customers
export interface CustomerTemplate {
  namePool: string[];
  iconPool: string[];
  basePayment: number;
  paymentVariance: number;
  basePatience: number;
  difficultyMultiplier: number;
}

// Recipe for crafting
export interface Recipe {
  id: string;
  ingredientIds: string[];
  resultingElements: Partial<Record<ElementType, number>>;
  discovered: boolean;
  bonusLevel: number;
}

// Element research node
export interface ResearchNode {
  element: ElementType;
  unlocked: boolean;
  cost: number;
  prerequisites: ElementType[];
}

// Upgrade types
export type UpgradeType =
  | 'manaConversion'
  | 'ingredientSlots'
  | 'customerPatience'
  | 'rewardChance'
  | 'elementEfficiency';

// Upgrade interface
export interface Upgrade {
  id: string;
  type: UpgradeType;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
}

// Reward from portal completion
export interface Reward {
  type: 'gold' | 'ingredient' | 'equipment' | 'mana';
  amount?: number;
  itemId?: string;
}

// Inventory state
export interface InventoryState {
  gold: number;
  mana: number;
  ingredients: Record<string, number>;
  equipment: Record<string, number>;
  elements: Partial<Record<ElementType, number>>;
}

// Game state for saving
export interface GameState {
  inventory: InventoryState;
  discoveredRecipes: string[];
  unlockedElements: ElementType[];
  upgrades: Record<string, number>;
  customerQueue: Customer[];
  currentPortal: Portal | null;
  totalPortalsCreated: number;
  totalCustomersServed: number;
  totalGoldEarned: number;
  playTime: number;
  lastSaveTime: number;
}

// UI Event types
export interface GameEvent {
  type: string;
  payload?: unknown;
}

// Crafting slot
export interface CraftingSlot {
  index: number;
  ingredient: Ingredient | null;
  equipment: Equipment | null;
}

// Element conversion rate
export interface ConversionRate {
  element: ElementType;
  manaPerUnit: number;
  baseRate: number;
  currentMultiplier: number;
}

// Shop item for purchasing
export interface ShopItem {
  id: string;
  name: string;
  type: 'mana' | 'ingredient' | 'upgrade';
  cost: number;
  amount?: number;
  itemId?: string;
}
