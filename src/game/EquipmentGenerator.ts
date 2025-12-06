/**
 * Procedural Equipment Generator
 *
 * This module generates random equipment items using attribute pools.
 * Generated items have varying combinations of attributes (prefix, material,
 * gear type, suffix) that contribute to the item's total cost and level.
 *
 * Key Features:
 * - Items do NOT require one attribute from every pool
 * - Each attribute contributes to the item's cost/level/quality
 * - All attributes are stored on the item for portal crafting integration
 * - Level-appropriate attribute selection
 *
 * Generation Logic:
 * 1. Select a gear type (required)
 * 2. Optionally add a prefix based on level and chance
 * 3. Optionally add a material based on level and chance
 * 4. Optionally add a suffix based on level and chance
 * 5. Calculate total cost from all attribute contributions
 * 6. Determine rarity from total cost
 * 7. Generate unique ID and name from attributes
 */

import type {
  GeneratedEquipment,
  ElementType,
  EquipmentRarity,
  PrefixAttribute,
  MaterialAttribute,
  SuffixAttribute,
  GearTypeAttribute,
} from '../types';
import {
  PREFIX_POOL,
  MATERIAL_POOL,
  SUFFIX_POOL,
  GEAR_TYPE_POOL,
  getAttributesForLevel,
  calculateRarityFromCost,
} from '../data/attributePools';
import { generateId } from '../utils/helpers';

/**
 * Configuration options for equipment generation.
 */
export interface GeneratorOptions {
  level?: number;
  prefixChance?: number;
  materialChance?: number;
  suffixChance?: number;
  forcedGearType?: string;
  forcedPrefix?: string;
  forcedMaterial?: string;
  forcedSuffix?: string;
}

/**
 * Default generation options.
 */
const DEFAULT_OPTIONS: Required<
  Omit<GeneratorOptions, 'forcedGearType' | 'forcedPrefix' | 'forcedMaterial' | 'forcedSuffix'>
> = {
  level: 1,
  prefixChance: 0.6,
  materialChance: 0.7,
  suffixChance: 0.5,
};

/**
 * EquipmentGenerator - Procedurally generates equipment with varied attributes
 */
export class EquipmentGenerator {
  /**
   * Generate a single equipment item with random attributes.
   * Not all attribute pools are required - combinations vary based on chance.
   *
   * @param options - Configuration options for generation
   * @returns A fully generated equipment item with all attributes stored
   */
  public generate(options: GeneratorOptions = {}): GeneratedEquipment {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const level = Math.max(1, opts.level);

    // Step 1: Select gear type (always required)
    const gearType = this.selectGearType(opts.forcedGearType);

    // Step 2: Optionally select prefix based on chance
    const prefix = this.maybeSelectPrefix(level, opts.prefixChance, opts.forcedPrefix);

    // Step 3: Optionally select material based on chance
    const material = this.maybeSelectMaterial(level, opts.materialChance, opts.forcedMaterial);

    // Step 4: Optionally select suffix based on chance
    const suffix = this.maybeSelectSuffix(level, opts.suffixChance, opts.forcedSuffix);

    // Step 5: Calculate total cost from all attribute contributions
    const totalCost = this.calculateTotalCost(gearType, prefix, material, suffix);

    // Step 6: Determine rarity based on total cost
    const rarity = calculateRarityFromCost(totalCost);

    // Step 7: Calculate element bonuses from attributes
    const elementBonus = this.calculateElementBonus(prefix, material, suffix);

    // Step 8: Generate the equipment item
    const equipment = this.buildEquipment({
      gearType,
      prefix,
      material,
      suffix,
      totalCost,
      rarity,
      elementBonus,
      level,
    });

    return equipment;
  }

  /**
   * Generate multiple equipment items.
   *
   * @param count - Number of items to generate
   * @param options - Configuration options for generation
   * @returns Array of generated equipment items
   */
  public generateMultiple(count: number, options: GeneratorOptions = {}): GeneratedEquipment[] {
    const items: GeneratedEquipment[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.generate(options));
    }
    return items;
  }

  /**
   * Generate equipment appropriate for a given level range.
   * Randomly selects a level within the range for more variety.
   *
   * @param minLevel - Minimum level for generation
   * @param maxLevel - Maximum level for generation
   * @returns A generated equipment item
   */
  public generateForLevelRange(minLevel: number, maxLevel: number): GeneratedEquipment {
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    return this.generate({ level });
  }

  /**
   * Select a gear type from the pool.
   */
  private selectGearType(forcedId?: string): GearTypeAttribute {
    if (forcedId) {
      const forced = GEAR_TYPE_POOL.find((g) => g.id === forcedId);
      if (forced) return forced;
    }
    const index = Math.floor(Math.random() * GEAR_TYPE_POOL.length);
    return GEAR_TYPE_POOL[index];
  }

  /**
   * Optionally select a prefix based on chance and level.
   */
  private maybeSelectPrefix(
    level: number,
    chance: number,
    forcedId?: string
  ): PrefixAttribute | undefined {
    if (forcedId) {
      return PREFIX_POOL.find((p) => p.id === forcedId);
    }
    if (Math.random() > chance) return undefined;
    const eligible = getAttributesForLevel(PREFIX_POOL, level);
    if (eligible.length === 0) return undefined;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  /**
   * Optionally select a material based on chance and level.
   */
  private maybeSelectMaterial(
    level: number,
    chance: number,
    forcedId?: string
  ): MaterialAttribute | undefined {
    if (forcedId) {
      return MATERIAL_POOL.find((m) => m.id === forcedId);
    }
    if (Math.random() > chance) return undefined;
    const eligible = getAttributesForLevel(MATERIAL_POOL, level);
    if (eligible.length === 0) return undefined;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  /**
   * Optionally select a suffix based on chance and level.
   */
  private maybeSelectSuffix(
    level: number,
    chance: number,
    forcedId?: string
  ): SuffixAttribute | undefined {
    if (forcedId) {
      return SUFFIX_POOL.find((s) => s.id === forcedId);
    }
    if (Math.random() > chance) return undefined;
    const eligible = getAttributesForLevel(SUFFIX_POOL, level);
    if (eligible.length === 0) return undefined;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  /**
   * Calculate total cost contribution from all attributes.
   */
  private calculateTotalCost(
    gearType: GearTypeAttribute,
    prefix?: PrefixAttribute,
    material?: MaterialAttribute,
    suffix?: SuffixAttribute
  ): number {
    let total = gearType.baseCost;
    if (prefix) total += prefix.costContribution;
    if (material) total += material.costContribution;
    if (suffix) total += suffix.costContribution;
    return Math.max(1, total);
  }

  /**
   * Calculate element bonuses from attributes with elemental affinities.
   */
  private calculateElementBonus(
    prefix?: PrefixAttribute,
    material?: MaterialAttribute,
    suffix?: SuffixAttribute
  ): Partial<Record<ElementType, number>> {
    const bonus: Partial<Record<ElementType, number>> = {};

    const addBonus = (element: ElementType | undefined, value: number) => {
      if (element) {
        bonus[element] = (bonus[element] || 0) + value;
      }
    };

    // Prefixes provide small elemental bonus
    if (prefix?.elementAffinity) {
      addBonus(prefix.elementAffinity, 2);
    }

    // Materials provide medium elemental bonus
    if (material?.elementAffinity) {
      addBonus(material.elementAffinity, 3);
    }

    // Suffixes provide larger elemental bonus based on effect value
    if (suffix?.elementAffinity) {
      const value = suffix.effectValue || 3;
      addBonus(suffix.elementAffinity, Math.floor(value));
    }

    return Object.keys(bonus).length > 0 ? bonus : {};
  }

  /**
   * Build the final GeneratedEquipment object with all attributes.
   */
  private buildEquipment(params: {
    gearType: GearTypeAttribute;
    prefix?: PrefixAttribute;
    material?: MaterialAttribute;
    suffix?: SuffixAttribute;
    totalCost: number;
    rarity: EquipmentRarity;
    elementBonus: Partial<Record<ElementType, number>>;
    level: number;
  }): GeneratedEquipment {
    const { gearType, prefix, material, suffix, totalCost, rarity, elementBonus, level } = params;

    // Build the item name from attributes
    const name = this.buildName(gearType, prefix, material, suffix);

    // Build description from attributes
    const description = this.buildDescription(gearType, prefix, material, suffix);

    // Calculate portal bonus based on total cost
    const portalBonus = Math.floor(totalCost * 1.5);

    return {
      id: generateId(),
      name,
      slot: gearType.slot,
      rarity,
      icon: gearType.icon,
      description,
      portalBonus,
      elementBonus: Object.keys(elementBonus).length > 0 ? elementBonus : undefined,
      isGenerated: true,
      attributes: {
        prefix,
        material,
        gearType,
        suffix,
      },
      totalCost,
      itemLevel: level,
    };
  }

  /**
   * Build the item name from attributes.
   * Format: [Prefix] [Material] GearType [Suffix]
   */
  private buildName(
    gearType: GearTypeAttribute,
    prefix?: PrefixAttribute,
    material?: MaterialAttribute,
    suffix?: SuffixAttribute
  ): string {
    const parts: string[] = [];

    if (prefix) parts.push(prefix.name);
    if (material) parts.push(material.name);
    parts.push(gearType.name);
    if (suffix) parts.push(suffix.name);

    return parts.join(' ');
  }

  /**
   * Build a description from attribute descriptions.
   */
  private buildDescription(
    gearType: GearTypeAttribute,
    prefix?: PrefixAttribute,
    material?: MaterialAttribute,
    suffix?: SuffixAttribute
  ): string {
    const descriptions: string[] = [gearType.description];

    if (prefix?.description) descriptions.push(prefix.description);
    if (material?.description) descriptions.push(material.description);
    if (suffix?.description) descriptions.push(suffix.description);

    return descriptions.join('. ') + '.';
  }
}

// Export a singleton instance for convenience
export const equipmentGenerator = new EquipmentGenerator();
