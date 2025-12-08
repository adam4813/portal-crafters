import type { ElementType } from '../types';
import { getIngredientById } from './ingredients';
import { getEquipmentById } from './equipment';
/**
 * Portal Type Definition - represents a specific category of portal
 * that can be crafted from particular combinations of elements and ingredients
 */
export interface PortalTypeDefinition {
  id: string;
  name: string;
  affinity: string;
  description: string;
  icon: string;
  visualColor: number;
  
  // Requirements to match this portal type
  requiredElements: Partial<Record<ElementType, number>>; // Minimum amounts
  requiredTags?: string[]; // At least one must be present from ingredients/equipment
  optionalElements?: ElementType[]; // Can be present but not required
  
  // Attributes granted by this portal type
  attributes: {
    power?: number;
    stability?: number;
    mystery?: number;
    danger?: number;
    [key: string]: any;
  };
  
  // Rarity/tier of this portal type
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Comprehensive list of portal types that can be discovered
 */
export const PORTAL_TYPES: PortalTypeDefinition[] = [
  // ===== COMMON TIER =====
  {
    id: 'basic_portal',
    name: 'Basic Portal',
    affinity: 'Neutral',
    description: 'A simple, stable portal with no special properties',
    icon: '🌀',
    visualColor: 0x6b46c1,
    requiredElements: {},
    tier: 'common',
    attributes: {
      power: 1,
      stability: 5,
    },
  },
  {
    id: 'ember_gate',
    name: 'Ember Gate',
    affinity: 'Fire',
    description: 'A warm portal crackling with flame',
    icon: '🔥',
    visualColor: 0xf56565,
    requiredElements: { fire: 10 },
    tier: 'common',
    attributes: {
      power: 3,
      heat: 5,
    },
  },
  {
    id: 'aqua_passage',
    name: 'Aqua Passage',
    affinity: 'Water',
    description: 'A flowing portal with liquid properties',
    icon: '💧',
    visualColor: 0x4299e1,
    requiredElements: { water: 10 },
    tier: 'common',
    attributes: {
      power: 3,
      fluidity: 5,
    },
  },
  {
    id: 'stone_door',
    name: 'Stone Door',
    affinity: 'Earth',
    description: 'A solid, dependable portal',
    icon: '🪨',
    visualColor: 0x68d391,
    requiredElements: { earth: 10 },
    tier: 'common',
    attributes: {
      power: 2,
      stability: 7,
      defense: 3,
    },
  },
  {
    id: 'breeze_gate',
    name: 'Breeze Gate',
    affinity: 'Air',
    description: 'A light, swirling portal of wind',
    icon: '💨',
    visualColor: 0xe2e8f0,
    requiredElements: { air: 10 },
    tier: 'common',
    attributes: {
      power: 2,
      speed: 5,
    },
  },

  // ===== UNCOMMON TIER =====
  {
    id: 'inferno',
    name: 'Inferno',
    affinity: 'Fire',
    description: 'A raging portal of intense flames',
    icon: '🔥',
    visualColor: 0xe53e3e,
    requiredElements: { fire: 25 },
    tier: 'uncommon',
    attributes: {
      power: 6,
      heat: 10,
      danger: 3,
    },
  },
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    affinity: 'Water',
    description: 'A portal to the deep ocean',
    icon: '🌊',
    visualColor: 0x2c5282,
    requiredElements: { water: 25 },
    tier: 'uncommon',
    attributes: {
      power: 5,
      pressure: 8,
      mystery: 4,
    },
  },
  {
    id: 'storm_eye',
    name: 'Storm Eye',
    affinity: 'Lightning',
    description: 'A crackling portal of electrical energy',
    icon: '⚡',
    visualColor: 0xfaf089,
    requiredElements: { lightning: 15 },
    tier: 'uncommon',
    attributes: {
      power: 7,
      speed: 8,
      danger: 4,
    },
  },
  {
    id: 'frozen_gate',
    name: 'Frozen Gate',
    affinity: 'Ice',
    description: 'A portal of eternal winter',
    icon: '❄️',
    visualColor: 0x81e6d9,
    requiredElements: { ice: 15 },
    tier: 'uncommon',
    attributes: {
      power: 5,
      cold: 10,
      preservation: 5,
    },
  },
  {
    id: 'forest_heart',
    name: 'Forest Heart',
    affinity: 'Nature',
    description: 'A living portal pulsing with natural energy',
    icon: '🌿',
    visualColor: 0x48bb78,
    requiredElements: { nature: 15 },
    tier: 'uncommon',
    attributes: {
      power: 5,
      growth: 8,
      vitality: 6,
    },
  },
  {
    id: 'forge_gateway',
    name: 'Forge Gateway',
    affinity: 'Metal',
    description: 'A metallic portal forged in fire',
    icon: '⚙️',
    visualColor: 0x718096,
    requiredElements: { metal: 15, fire: 10 },
    tier: 'uncommon',
    attributes: {
      power: 6,
      durability: 10,
      resonance: 4,
    },
  },

  // ===== RARE TIER =====
  {
    id: 'graveyard',
    name: 'Graveyard',
    affinity: 'Death',
    description: 'A portal to the realm of the dead, crafted from death and shadow elements with bones',
    icon: '💀',
    visualColor: 0x1a202c,
    requiredElements: { death: 10, shadow: 10 },
    requiredTags: ['bone'],
    tier: 'rare',
    attributes: {
      power: 10,
      necromancy: 15,
      mystery: 10,
      danger: 8,
    },
  },
  {
    id: 'celestial_arch',
    name: 'Celestial Arch',
    affinity: 'Light',
    description: 'A radiant portal to the heavens',
    icon: '✨',
    visualColor: 0xffffff,
    requiredElements: { light: 20, air: 15 },
    tier: 'rare',
    attributes: {
      power: 12,
      holiness: 15,
      purity: 10,
    },
  },
  {
    id: 'shadow_veil',
    name: 'Shadow Veil',
    affinity: 'Shadow',
    description: 'A dark portal concealed in shadows',
    icon: '🌑',
    visualColor: 0x2d3748,
    requiredElements: { shadow: 20 },
    tier: 'rare',
    attributes: {
      power: 10,
      stealth: 15,
      mystery: 12,
    },
  },
  {
    id: 'crystal_spire',
    name: 'Crystal Spire',
    affinity: 'Crystal',
    description: 'A prismatic portal of pure crystal',
    icon: '💎',
    visualColor: 0xb794f4,
    requiredElements: { crystal: 20, earth: 10 },
    tier: 'rare',
    attributes: {
      power: 11,
      clarity: 15,
      amplification: 12,
    },
  },
  {
    id: 'void_rift',
    name: 'Void Rift',
    affinity: 'Void',
    description: 'A portal to the endless void',
    icon: '🕳️',
    visualColor: 0x553c9a,
    requiredElements: { void: 20 },
    tier: 'rare',
    attributes: {
      power: 13,
      emptiness: 20,
      potential: 15,
      danger: 10,
    },
  },
  {
    id: 'arcane_nexus',
    name: 'Arcane Nexus',
    affinity: 'Arcane',
    description: 'A portal of pure magical essence',
    icon: '✴️',
    visualColor: 0x9f7aea,
    requiredElements: { arcane: 20 },
    tier: 'rare',
    attributes: {
      power: 14,
      magic: 20,
      knowledge: 10,
    },
  },
  {
    id: 'volcanic_maw',
    name: 'Volcanic Maw',
    affinity: 'Fire',
    description: 'A portal to the heart of a volcano',
    icon: '🌋',
    visualColor: 0xc53030,
    requiredElements: { fire: 30, earth: 20 },
    tier: 'rare',
    attributes: {
      power: 15,
      heat: 20,
      destruction: 15,
      danger: 12,
    },
  },
  {
    id: 'tidal_throne',
    name: 'Tidal Throne',
    affinity: 'Water',
    description: 'A portal commanding the tides',
    icon: '🌊',
    visualColor: 0x1a365d,
    requiredElements: { water: 30, ice: 15 },
    tier: 'rare',
    attributes: {
      power: 14,
      flow: 18,
      pressure: 15,
    },
  },
  {
    id: 'sky_sanctuary',
    name: 'Sky Sanctuary',
    affinity: 'Air',
    description: 'A portal floating among the clouds',
    icon: '☁️',
    visualColor: 0xbee3f8,
    requiredElements: { air: 30, lightning: 10 },
    tier: 'rare',
    attributes: {
      power: 13,
      freedom: 20,
      elevation: 15,
    },
  },
  {
    id: 'wildwood_gateway',
    name: 'Wildwood Gateway',
    affinity: 'Nature',
    description: 'A portal deep in an ancient forest',
    icon: '🌳',
    visualColor: 0x22543d,
    requiredElements: { nature: 25, earth: 15 },
    tier: 'rare',
    attributes: {
      power: 12,
      growth: 18,
      ancient: 15,
      harmony: 10,
    },
  },

  // ===== EPIC TIER =====
  {
    id: 'phoenix_rebirth',
    name: 'Phoenix Rebirth',
    affinity: 'Life',
    description: 'A portal of resurrection and renewal',
    icon: '🦅',
    visualColor: 0xf6ad55,
    requiredElements: { life: 25, fire: 20, light: 15 },
    requiredTags: ['phoenix'],
    tier: 'epic',
    attributes: {
      power: 18,
      rebirth: 25,
      vitality: 20,
      transcendence: 15,
    },
  },
  {
    id: 'dragon_crucible',
    name: 'Dragon Crucible',
    affinity: 'Fire',
    description: 'A portal forged in dragon fire',
    icon: '🐉',
    visualColor: 0x9b2c2c,
    requiredElements: { fire: 40, metal: 20 },
    requiredTags: ['dragon'],
    tier: 'epic',
    attributes: {
      power: 20,
      dragonfire: 30,
      might: 25,
      danger: 15,
    },
  },
  {
    id: 'temporal_cascade',
    name: 'Temporal Cascade',
    affinity: 'Time',
    description: 'A portal that bends time itself',
    icon: '⏳',
    visualColor: 0xd69e2e,
    requiredElements: { time: 30 },
    tier: 'epic',
    attributes: {
      power: 22,
      temporal: 30,
      paradox: 20,
      danger: 18,
    },
  },
  {
    id: 'chaos_maelstrom',
    name: 'Chaos Maelstrom',
    affinity: 'Chaos',
    description: 'A swirling portal of pure entropy',
    icon: '🌀',
    visualColor: 0xe53e3e,
    requiredElements: { chaos: 30 },
    tier: 'epic',
    attributes: {
      power: 24,
      entropy: 35,
      unpredictability: 30,
      danger: 20,
    },
  },
  {
    id: 'death_eternal',
    name: 'Death Eternal',
    affinity: 'Death',
    description: 'A portal to the final destination',
    icon: '☠️',
    visualColor: 0x000000,
    requiredElements: { death: 35, void: 20 },
    tier: 'epic',
    attributes: {
      power: 20,
      finality: 40,
      necromancy: 30,
      danger: 25,
    },
  },
  {
    id: 'prismatic_infinity',
    name: 'Prismatic Infinity',
    affinity: 'Crystal',
    description: 'A portal of infinite reflections',
    icon: '🔮',
    visualColor: 0xa0aec0,
    requiredElements: { crystal: 35, light: 25, arcane: 15 },
    tier: 'epic',
    attributes: {
      power: 21,
      reflection: 30,
      amplification: 25,
      insight: 20,
    },
  },
  {
    id: 'astral_convergence',
    name: 'Astral Convergence',
    affinity: 'Arcane',
    description: 'A portal where all magic converges',
    icon: '🌟',
    visualColor: 0x805ad5,
    requiredElements: { arcane: 40, void: 15 },
    tier: 'epic',
    attributes: {
      power: 23,
      convergence: 35,
      mastery: 30,
      transcendence: 20,
    },
  },

  // ===== LEGENDARY TIER =====
  {
    id: 'genesis_gate',
    name: 'Genesis Gate',
    affinity: 'Creation',
    description: 'A portal to the moment of creation',
    icon: '🌌',
    visualColor: 0xffffff,
    requiredElements: { life: 50, light: 40, time: 30, arcane: 25 },
    tier: 'legendary',
    attributes: {
      power: 30,
      creation: 50,
      omnipotence: 40,
      transcendence: 35,
    },
  },
  {
    id: 'apocalypse_threshold',
    name: 'Apocalypse Threshold',
    affinity: 'Destruction',
    description: 'A portal heralding the end of all things',
    icon: '💥',
    visualColor: 0x000000,
    requiredElements: { death: 50, chaos: 40, void: 30, shadow: 25 },
    tier: 'legendary',
    attributes: {
      power: 35,
      annihilation: 50,
      apocalypse: 45,
      danger: 40,
    },
  },
  {
    id: 'cosmic_nexus',
    name: 'Cosmic Nexus',
    affinity: 'Universal',
    description: 'A portal connecting all planes of existence',
    icon: '🌠',
    visualColor: 0x4c51bf,
    requiredElements: { 
      arcane: 40, 
      void: 35, 
      time: 30, 
      light: 25, 
      shadow: 25 
    },
    tier: 'legendary',
    attributes: {
      power: 40,
      omniscience: 50,
      unity: 45,
      transcendence: 40,
    },
  },
  {
    id: 'elemental_symphony',
    name: 'Elemental Symphony',
    affinity: 'Harmony',
    description: 'A portal where all elements exist in perfect balance',
    icon: '🎭',
    visualColor: 0xb794f4,
    requiredElements: {
      fire: 25,
      water: 25,
      earth: 25,
      air: 25,
    },
    tier: 'legendary',
    attributes: {
      power: 32,
      harmony: 50,
      balance: 45,
      perfection: 35,
    },
  },
  {
    id: 'worldforge',
    name: 'Worldforge',
    affinity: 'Creation',
    description: 'A portal capable of forging new worlds',
    icon: '🏔️',
    visualColor: 0xed8936,
    requiredElements: {
      earth: 40,
      fire: 35,
      life: 30,
      metal: 25,
    },
    tier: 'legendary',
    attributes: {
      power: 33,
      creation: 45,
      shaping: 40,
      permanence: 35,
    },
  },
];

/**
 * Score how well a portal's elements, ingredients, and equipment match a portal type
 */
export function scorePortalTypeMatch(
  portalElements: Partial<Record<ElementType, number>>,
  portalIngredientIds: string[],
  portalEquipmentIds: string[],
  portalType: PortalTypeDefinition
): number {
  let score = 0;
  let requiredMatches = 0;
  let totalRequired = 0;

  // Check required elements
  for (const [element, requiredAmount] of Object.entries(portalType.requiredElements)) {
    totalRequired++;
    const portalAmount = portalElements[element as ElementType] || 0;
    if (portalAmount >= requiredAmount) {
      requiredMatches++;
      // Bonus points for exceeding requirement
      const excess = portalAmount - requiredAmount;
      score += 10 + Math.min(excess / 5, 5);
    }
  }

  // Check required tags (at least one must match)
  if (portalType.requiredTags && portalType.requiredTags.length > 0) {
    totalRequired++;
    
    // Collect all tags from ingredients and equipment
    const allTags = new Set<string>();
    
    for (const ingredientId of portalIngredientIds) {
      const ingredient = getIngredientById(ingredientId);
      if (ingredient?.tags) {
        ingredient.tags.forEach(tag => allTags.add(tag));
      }
    }
    
    for (const equipmentId of portalEquipmentIds) {
      const equipment = getEquipmentById(equipmentId);
      if (equipment?.tags) {
        equipment.tags.forEach(tag => allTags.add(tag));
      }
    }
    
    // Check if any required tag is present
    const hasRequiredTag = portalType.requiredTags.some(reqTag => allTags.has(reqTag));
    if (hasRequiredTag) {
      requiredMatches++;
      score += 10;
    }
  }

  // Handle basic portal (no requirements)
  if (totalRequired === 0) {
    return 10; // Default score for basic portal
  }

  // Must meet all requirements to be valid
  if (requiredMatches < totalRequired) {
    return 0;
  }

  // Bonus for having optional elements
  if (portalType.optionalElements) {
    for (const element of portalType.optionalElements) {
      if (portalElements[element] && portalElements[element]! > 0) {
        score += 5;
      }
    }
  }

  return score;
}

/**
 * Match a portal to its type based on elements, ingredients, and equipment
 * Returns the best matching portal type, or null if no match
 */
export function matchPortalType(
  elements: Partial<Record<ElementType, number>>,
  ingredientIds: string[],
  equipmentIds: string[] = []
): PortalTypeDefinition | null {
  let bestMatch: PortalTypeDefinition | null = null;
  let bestScore = 0;

  // Try to match against all portal types
  for (const portalType of PORTAL_TYPES) {
    const score = scorePortalTypeMatch(elements, ingredientIds, equipmentIds, portalType);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = portalType;
    }
  }

  // Return match if score is above threshold (at least 10 points)
  return bestScore >= 10 ? bestMatch : null;
}

/**
 * Get all discovered portal types based on what recipes have been crafted
 */
export function getDiscoveredPortalTypes(
  craftedPortals: Array<{ elements: Partial<Record<ElementType, number>>; ingredients: string[]; equipment: string[] }>
): Set<string> {
  const discovered = new Set<string>();

  for (const portal of craftedPortals) {
    const match = matchPortalType(portal.elements, portal.ingredients, portal.equipment);
    if (match) {
      discovered.add(match.id);
    }
  }

  return discovered;
}

/**
 * Get portal type by ID
 */
export function getPortalTypeById(id: string): PortalTypeDefinition | undefined {
  return PORTAL_TYPES.find((pt) => pt.id === id);
}

/**
 * Get portal types by tier
 */
export function getPortalTypesByTier(
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): PortalTypeDefinition[] {
  return PORTAL_TYPES.filter((pt) => pt.tier === tier);
}

/**
 * Get all portal types
 */
export function getAllPortalTypes(): PortalTypeDefinition[] {
  return [...PORTAL_TYPES];
}
