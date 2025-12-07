/**
 * Portal Effect System
 *
 * This system calculates portal effects based on equipment attributes.
 * All equipment attributes used in crafting affect the portal's behavior,
 * including visuals, rewards, and special effects.
 *
 * Attribute Effects:
 * - Prefix attributes affect portal quality and intensity
 * - Material attributes determine elemental affinity bonuses
 * - Suffix attributes add special effects and reward bonuses
 * - Total cost contribution affects reward multipliers
 */

import type {
  GeneratedEquipment,
  PrefixAttribute,
  MaterialAttribute,
  SuffixAttribute,
  ElementType,
} from '../types';

/**
 * Portal effect modifiers calculated from equipment attributes.
 */
export interface PortalEffectModifiers {
  // Reward modifiers
  goldMultiplier: number; // Multiplier for gold rewards (1.0 = no change)
  manaMultiplier: number; // Multiplier for mana rewards
  ingredientChance: number; // Bonus chance for ingredient drops (0-1)
  equipmentChance: number; // Bonus chance for equipment drops (0-1)
  rarityBonus: number; // Bonus to reward rarity (0-5)

  // Visual effect modifiers
  intensityBonus: number; // Visual intensity bonus
  colorShift: number; // Color hue shift in degrees

  // Special effects from attributes
  specialEffects: string[]; // List of special effect names
  elementalAffinities: Partial<Record<ElementType, number>>; // Element bonuses from attributes

  // Recipe discovery modifiers
  recipeDiscoveryBonus: number; // Bonus to recipe discovery chance (0-1)
}

/**
 * Calculate portal effect modifiers from equipment attributes.
 */
export function calculatePortalEffects(
  generatedEquipment: GeneratedEquipment[]
): PortalEffectModifiers {
  const modifiers: PortalEffectModifiers = {
    goldMultiplier: 1.0,
    manaMultiplier: 1.0,
    ingredientChance: 0,
    equipmentChance: 0,
    rarityBonus: 0,
    intensityBonus: 0,
    colorShift: 0,
    specialEffects: [],
    elementalAffinities: {},
    recipeDiscoveryBonus: 0,
  };

  if (generatedEquipment.length === 0) {
    return modifiers;
  }

  // Aggregate effects from all equipment pieces
  for (const equipment of generatedEquipment) {
    const { prefix, material, suffix } = equipment.attributes;

    // Process prefix effects
    if (prefix) {
      applyPrefixEffects(modifiers, prefix);
    }

    // Process material effects
    if (material) {
      applyMaterialEffects(modifiers, material);
    }

    // Process suffix effects
    if (suffix) {
      applySuffixEffects(modifiers, suffix);
    }

    // Total cost affects overall reward quality
    applyTotalCostEffects(modifiers, equipment.totalCost, equipment.rarity);
  }

  return modifiers;
}

/**
 * Apply prefix attribute effects to portal modifiers.
 */
function applyPrefixEffects(modifiers: PortalEffectModifiers, prefix: PrefixAttribute): void {
  const costContribution = prefix.costContribution;

  // High quality prefixes increase rewards
  if (costContribution >= 10) {
    // Enchanted, Legendary, Ancient
    modifiers.goldMultiplier += 0.5;
    modifiers.rarityBonus += 2;
    modifiers.intensityBonus += 0.3;
    modifiers.recipeDiscoveryBonus += 0.1;
    modifiers.specialEffects.push(`${prefix.name} Quality`);
  } else if (costContribution >= 5) {
    // Tempered, Masterwork, Gleaming
    modifiers.goldMultiplier += 0.3;
    modifiers.rarityBonus += 1;
    modifiers.intensityBonus += 0.2;
    modifiers.recipeDiscoveryBonus += 0.05;
  } else if (costContribution >= 2) {
    // Sturdy, Polished, Reinforced
    modifiers.goldMultiplier += 0.15;
    modifiers.intensityBonus += 0.1;
  } else if (costContribution < 0) {
    // Rusted, Worn, Cracked (low quality reduces some rewards but increases discovery)
    modifiers.goldMultiplier -= 0.1;
    modifiers.recipeDiscoveryBonus += 0.05; // Experimental items teach more
  }

  // Specific prefix effects
  if (prefix.id === 'enchanted') {
    modifiers.specialEffects.push('Magical Resonance');
    modifiers.manaMultiplier += 0.5;
  } else if (prefix.id === 'legendary') {
    modifiers.specialEffects.push('Legendary Aura');
    modifiers.equipmentChance += 0.2;
  } else if (prefix.id === 'ancient') {
    modifiers.specialEffects.push('Ancient Power');
    modifiers.rarityBonus += 1;
  } else if (prefix.id === 'gleaming') {
    modifiers.colorShift += 30; // Lighter color
    modifiers.intensityBonus += 0.1;
  }
}

/**
 * Apply material attribute effects to portal modifiers.
 */
function applyMaterialEffects(modifiers: PortalEffectModifiers, material: MaterialAttribute): void {
  // Materials with elemental affinity boost those elements
  if (material.elementAffinity) {
    modifiers.elementalAffinities[material.elementAffinity] =
      (modifiers.elementalAffinities[material.elementAffinity] || 0) + 5;
  }

  // High quality materials increase rewards
  const costContribution = material.costContribution;
  if (costContribution >= 8) {
    // Obsidian, Adamantine, Crystal
    modifiers.goldMultiplier += 0.4;
    modifiers.equipmentChance += 0.15;
  } else if (costContribution >= 4) {
    // Silver, Mithril, Dragonscale
    modifiers.goldMultiplier += 0.25;
    modifiers.ingredientChance += 0.1;
  } else if (costContribution >= 2) {
    // Steel, Bronze, Bone
    modifiers.goldMultiplier += 0.1;
  }

  // Specific material effects
  if (material.id === 'dragonscale') {
    modifiers.specialEffects.push('Dragon Essence');
    modifiers.rarityBonus += 1;
  } else if (material.id === 'mithril') {
    modifiers.specialEffects.push('Mithril Glow');
    modifiers.intensityBonus += 0.15;
  } else if (material.id === 'obsidian') {
    modifiers.specialEffects.push('Void Touch');
    modifiers.colorShift -= 45; // Darker color
  } else if (material.id === 'crystal') {
    modifiers.specialEffects.push('Crystal Clarity');
    modifiers.recipeDiscoveryBonus += 0.15;
  } else if (material.id === 'adamantine') {
    modifiers.specialEffects.push('Unbreakable');
    modifiers.goldMultiplier += 0.2;
  }
}

/**
 * Apply suffix attribute effects to portal modifiers.
 */
function applySuffixEffects(modifiers: PortalEffectModifiers, suffix: SuffixAttribute): void {
  // Suffixes provide the most varied effects
  const effectValue = suffix.effectValue || 1;
  const costContribution = suffix.costContribution;

  // High value suffixes increase rewards significantly
  if (costContribution >= 10) {
    // Annihilation, Void, Eternity
    modifiers.goldMultiplier += 0.6;
    modifiers.rarityBonus += 2;
    modifiers.equipmentChance += 0.25;
  } else if (costContribution >= 5) {
    // Flames, Frost, Storms
    modifiers.goldMultiplier += 0.3;
    modifiers.rarityBonus += 1;
    modifiers.ingredientChance += 0.15;
  } else if (costContribution >= 3) {
    // Strength, Vigor
    modifiers.goldMultiplier += 0.15;
  }

  // Elemental suffixes boost corresponding element rewards
  if (suffix.elementAffinity) {
    modifiers.elementalAffinities[suffix.elementAffinity] =
      (modifiers.elementalAffinities[suffix.elementAffinity] || 0) + effectValue;
  }

  // Effect type determines reward bonuses
  if (suffix.effectType === 'damage') {
    modifiers.goldMultiplier += effectValue * 0.05;
  } else if (suffix.effectType === 'defense') {
    modifiers.manaMultiplier += effectValue * 0.05;
  } else if (suffix.effectType === 'elemental') {
    modifiers.ingredientChance += effectValue * 0.02;
    modifiers.intensityBonus += effectValue * 0.02;
  } else if (suffix.effectType === 'special') {
    modifiers.equipmentChance += effectValue * 0.02;
    modifiers.recipeDiscoveryBonus += effectValue * 0.01;
  }

  // Specific suffix effects
  if (suffix.id === 'flames') {
    modifiers.specialEffects.push('Burning');
    modifiers.colorShift += 15; // Warmer color
  } else if (suffix.id === 'frost') {
    modifiers.specialEffects.push('Frozen');
    modifiers.colorShift -= 60; // Cooler color
  } else if (suffix.id === 'storms') {
    modifiers.specialEffects.push('Electrified');
    modifiers.intensityBonus += 0.25;
  } else if (suffix.id === 'annihilation') {
    modifiers.specialEffects.push('Destructive Force');
    modifiers.equipmentChance += 0.3;
  } else if (suffix.id === 'void') {
    modifiers.specialEffects.push('Void Touched');
    modifiers.rarityBonus += 2;
  } else if (suffix.id === 'eternity') {
    modifiers.specialEffects.push('Timeless');
    modifiers.manaMultiplier += 0.5;
  }
}

/**
 * Apply overall equipment cost effects to portal modifiers.
 */
function applyTotalCostEffects(
  modifiers: PortalEffectModifiers,
  totalCost: number,
  rarity: string
): void {
  // Higher total cost increases all rewards
  const costBonus = Math.floor(totalCost / 10) * 0.05;
  modifiers.goldMultiplier += costBonus;

  // Rarity provides additional bonuses
  if (rarity === 'legendary') {
    modifiers.rarityBonus += 3;
    modifiers.equipmentChance += 0.2;
    modifiers.recipeDiscoveryBonus += 0.15;
  } else if (rarity === 'epic') {
    modifiers.rarityBonus += 2;
    modifiers.equipmentChance += 0.1;
    modifiers.recipeDiscoveryBonus += 0.1;
  } else if (rarity === 'rare') {
    modifiers.rarityBonus += 1;
    modifiers.ingredientChance += 0.05;
    modifiers.recipeDiscoveryBonus += 0.05;
  }
}

/**
 * Get a description of portal effects for display.
 */
export function getPortalEffectDescription(modifiers: PortalEffectModifiers): string[] {
  const descriptions: string[] = [];

  if (modifiers.goldMultiplier > 1.0) {
    const percent = Math.round((modifiers.goldMultiplier - 1.0) * 100);
    descriptions.push(`+${percent}% Gold Rewards`);
  } else if (modifiers.goldMultiplier < 1.0) {
    const percent = Math.round((1.0 - modifiers.goldMultiplier) * 100);
    descriptions.push(`-${percent}% Gold Rewards`);
  }

  if (modifiers.manaMultiplier > 1.0) {
    const percent = Math.round((modifiers.manaMultiplier - 1.0) * 100);
    descriptions.push(`+${percent}% Mana Rewards`);
  }

  if (modifiers.ingredientChance > 0) {
    const percent = Math.round(modifiers.ingredientChance * 100);
    descriptions.push(`+${percent}% Ingredient Drop Chance`);
  }

  if (modifiers.equipmentChance > 0) {
    const percent = Math.round(modifiers.equipmentChance * 100);
    descriptions.push(`+${percent}% Equipment Drop Chance`);
  }

  if (modifiers.rarityBonus > 0) {
    descriptions.push(`+${modifiers.rarityBonus} Reward Rarity`);
  }

  if (modifiers.recipeDiscoveryBonus > 0) {
    const percent = Math.round(modifiers.recipeDiscoveryBonus * 100);
    descriptions.push(`+${percent}% Recipe Discovery Chance`);
  }

  // Add special effects
  for (const effect of modifiers.specialEffects) {
    descriptions.push(`Special: ${effect}`);
  }

  // Add elemental affinity bonuses
  for (const [element, bonus] of Object.entries(modifiers.elementalAffinities)) {
    if (bonus > 0) {
      descriptions.push(`+${bonus} ${element} affinity`);
    }
  }

  return descriptions;
}
