// Element types available in the game
export type ElementType =
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'ice'
  | 'lightning'
  | 'metal'
  | 'nature'
  | 'shadow'
  | 'light'
  | 'void'
  | 'crystal'
  | 'arcane'
  | 'time'
  | 'chaos'
  | 'life'
  | 'death';

// Element tier for categorizing element rarity and progression
export type ElementTier = 'common' | 'standard' | 'rare' | 'exotic' | 'legendary';

// Unlock methods for elements
export type UnlockMethod =
  | 'starting'
  | 'early_research'
  | 'mid_research'
  | 'late_research'
  | 'secret_recipe'
  | 'rare_reward';

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
  // Portal effect modifiers (optional)
  goldMultiplier?: number;
  manaMultiplier?: number;
  ingredientChance?: number;
  equipmentChance?: number;
  rarityBonus?: number;
  // Tags for portal type matching (e.g., 'bone', 'magical', 'rare')
  tags?: string[];
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
  // Tags for portal type matching (e.g., 'bone', 'dragon', 'magical')
  tags?: string[];
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
  /**
   * Generated equipment attributes used in this portal.
   * Stored for use in calculating portal effects and rewards.
   */
  generatedEquipmentAttributes?: GeneratedEquipment[];
  /**
   * Portal type name (e.g., "Graveyard", "Inferno")
   * Determined by the combination of elements and ingredients used
   */
  typeName?: string;
  /**
   * Portal affinity/category (e.g., "Death", "Fire", "Creation")
   */
  affinity?: string;
  /**
   * Special attributes granted by the portal type
   */
  attributes?: Record<string, number>;
}

// Customer contract requirements
export interface ContractRequirements {
  minLevel: number;
  // Element requirements:
  // - undefined/missing: any combination allowed (elements, no elements, or mix)
  // - 'any': must have at least some element(s)
  // - 'none': must have no elements (raw mana only)
  // - ElementType[]: must have specific elements
  requiredElements?: ElementType[] | 'any' | 'none';
  minElementAmount?: number;
  // Minimum raw mana required in the portal
  minMana?: number;
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
  type: 'gold' | 'ingredient' | 'equipment' | 'mana' | 'generatedEquipment';
  amount?: number;
  itemId?: string;
  /**
   * Generated equipment item (when type is 'generatedEquipment').
   */
  generatedEquipment?: GeneratedEquipment;
}

// Inventory state
export interface InventoryState {
  gold: number;
  mana: number;
  ingredients: Record<string, number>;
  equipment: Record<string, number>;
  elements: Partial<Record<ElementType, number>>;
  /**
   * Storage for generated equipment items with full attribute data.
   * Keyed by unique generated item ID.
   */
  generatedEquipment?: Record<string, GeneratedEquipment>;
}

// Game state for saving
export interface GameState {
  inventory: InventoryState;
  discoveredRecipes: string[];
  unlockedElements: ElementType[];
  upgrades: Record<string, number>;
  customerQueue: Customer[];
  currentPortal: Portal | null;
  storedPortals: Portal[];
  craftingSlots: CraftingSlotState[];
  totalPortalsCreated: number;
  totalCustomersServed: number;
  totalGoldEarned: number;
  playTime: number;
  lastSaveTime: number;
  progression?: ProgressionState;
  activeExpeditions?: Expedition[];
}

// Serializable crafting slot state (stores IDs instead of full objects)
export interface CraftingSlotState {
  index: number;
  ingredientId: string | null;
  equipmentId: string | null;
  isGenerated: boolean;
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
  equipment: AnyEquipment | null;
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

// ============================================
// Procedural Equipment Generation Types
// ============================================

/**
 * Attribute that can be applied to generated equipment.
 * Each attribute contributes to the item's cost/quality score.
 */
export interface EquipmentAttribute {
  id: string;
  name: string;
  costContribution: number;
  levelRange: { min: number; max: number };
  elementAffinity?: ElementType;
  description?: string;
  // Tags that this attribute contributes (e.g., 'bone', 'dragon', 'undead')
  tags?: string[];
}

/**
 * Equipment prefix attribute (e.g., "Rusted", "Enchanted").
 * Affects item quality and name generation.
 */
export interface PrefixAttribute extends EquipmentAttribute {
  type: 'prefix';
}

/**
 * Equipment material attribute (e.g., "Iron", "Mithril").
 * Affects item quality and element affinity.
 */
export interface MaterialAttribute extends EquipmentAttribute {
  type: 'material';
}

/**
 * Equipment suffix attribute (e.g., "of Strength", "of Annihilation").
 * Provides bonus effects and contributes to cost.
 */
export interface SuffixAttribute extends EquipmentAttribute {
  type: 'suffix';
  effectType?: 'damage' | 'defense' | 'elemental' | 'special';
  effectValue?: number;
}

/**
 * Equipment gear type (e.g., "Sword", "Shield", "Ring").
 * Determines the base slot and icon for the equipment.
 */
export interface GearTypeAttribute {
  id: string;
  name: string;
  slot: EquipmentSlot;
  icon: string;
  baseCost: number;
  description: string;
}

/**
 * Generated equipment item with all procedural attributes stored.
 * Extends the base Equipment interface with attribute tracking.
 */
export interface GeneratedEquipment extends Equipment {
  isGenerated: true;
  attributes: {
    prefix?: PrefixAttribute;
    material?: MaterialAttribute;
    gearType: GearTypeAttribute;
    suffix?: SuffixAttribute;
  };
  totalCost: number;
  itemLevel: number;
}

/**
 * Union type for all equipment types (static or generated).
 */
export type AnyEquipment = Equipment | GeneratedEquipment;

/**
 * Type guard to check if equipment is generated.
 */
export function isGeneratedEquipment(eq: AnyEquipment): eq is GeneratedEquipment {
  return 'isGenerated' in eq && eq.isGenerated === true;
}

// ============================================
// Progression System Types
// ============================================

/**
 * Progression tier - represents a stage of game progression
 */
export interface ProgressionTier {
  id: string;
  name: string;
  tier: number; // 1-5
  unlockRequirements: {
    requiredElement?: ElementType; // Element that must be researched
    contractsCompleted: number; // Contracts completed in previous tier
  };
  miniBossContract: ContractRequirements & {
    name: string;
    description: string;
    payment: number;
  };
}

/**
 * Progression state - tracks player progress through tiers
 */
export interface ProgressionState {
  currentTier: number; // 1-5
  contractsCompletedThisTier: number;
  tiersUnlocked: number[]; // Array of unlocked tier numbers
  miniBossCompleted: number[]; // Array of completed mini-boss tier numbers
}

/**
 * Expedition - party sent through a portal to gather resources
 */
export interface Expedition {
  id: string;
  portalId: string; // ID of the portal used for this expedition
  portalSnapshot: Portal; // Snapshot of the portal at expedition start
  startedAt: number; // Timestamp when expedition started
  duration: number; // Duration in seconds (based on portal properties)
}

/**
 * Expedition reward
 */
export interface ExpeditionReward {
  type: 'ingredient' | 'equipment' | 'gold' | 'mana';
  itemId?: string;
  amount: number;
  chance: number; // 0-1, probability of receiving this reward
}
