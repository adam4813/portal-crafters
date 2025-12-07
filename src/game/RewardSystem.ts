import type { Reward, GeneratedEquipment } from '../types';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { EQUIPMENT, getEquipmentById } from '../data/equipment';
import { randomElement, calculateRewardChance, clamp } from '../utils/helpers';
import { equipmentGenerator } from './EquipmentGenerator';
import type { PortalEffectModifiers } from './PortalEffectSystem';

/**
 * Reward probability thresholds (cumulative).
 * These define the chance of receiving each reward type, conditional on a reward being generated.
 * Note: The overall probability of receiving a specific reward type is (chance * stated_probability),
 * where `chance` is calculated by `calculateRewardChance(portalLevel, rewardChanceUpgrade)`.
 * For example, if chance = 0.5, then the overall probability for gold is 0.5 * 0.35 = 17.5%.
 * Conditional probabilities (given a reward is generated):
 *   - Gold: 35% (0 to 0.35)
 *   - Ingredient: 20% (0.35 to 0.55)
 *   - Mana: 15% (0.55 to 0.70)
 *   - Static equipment: 15% (0.70 to 0.85)
 *   - Generated equipment: 15% (0.85 to 1.0)
 */
const REWARD_PROBABILITIES = {
  GOLD_THRESHOLD: 0.35, // 35% conditional chance for gold (0 to 0.35)
  INGREDIENT_THRESHOLD: 0.55, // 20% conditional chance for ingredient (0.35 to 0.55)
  MANA_THRESHOLD: 0.7, // 15% conditional chance for mana (0.55 to 0.70)
  STATIC_EQUIPMENT_THRESHOLD: 0.85, // 15% conditional chance for static equipment (0.70 to 0.85)
  // Remaining 15% (0.85 to 1.0) is for generated equipment
};

export class RewardSystem {
  private rewardChanceUpgrade: number = 0;

  constructor() {}

  public setRewardChanceUpgrade(level: number): void {
    this.rewardChanceUpgrade = level;
  }

  /**
   * Generate a reward with optional portal effect modifiers from equipment attributes.
   * @param portalLevel - Level of the portal
   * @param effectModifiers - Optional modifiers from equipment attributes
   */
  public generateReward(
    portalLevel: number,
    effectModifiers?: PortalEffectModifiers
  ): Reward | null {
    const chance = calculateRewardChance(portalLevel, this.rewardChanceUpgrade);

    if (Math.random() > chance) {
      return null;
    }

    // Adjust thresholds based on effect modifiers
    const thresholds = this.calculateAdjustedThresholds(effectModifiers);

    // Determine reward type using adjusted probability thresholds
    const roll = Math.random();

    if (roll < thresholds.GOLD_THRESHOLD) {
      return this.generateGoldReward(portalLevel, effectModifiers);
    } else if (roll < thresholds.INGREDIENT_THRESHOLD) {
      return this.generateIngredientReward(portalLevel, effectModifiers);
    } else if (roll < thresholds.MANA_THRESHOLD) {
      return this.generateManaReward(portalLevel, effectModifiers);
    } else if (roll < thresholds.STATIC_EQUIPMENT_THRESHOLD) {
      return this.generateEquipmentReward(portalLevel, effectModifiers);
    } else {
      return this.generateGeneratedEquipmentReward(portalLevel, effectModifiers);
    }
  }

  /**
   * Calculate adjusted reward type thresholds based on effect modifiers.
   */
  private calculateAdjustedThresholds(
    effectModifiers?: PortalEffectModifiers
  ): typeof REWARD_PROBABILITIES {
    if (!effectModifiers) {
      return REWARD_PROBABILITIES;
    }

    // Calculate adjustments based on attribute effects
    const ingredientBonus = effectModifiers.ingredientChance * 0.15; // Scale to threshold space
    const equipmentBonus = effectModifiers.equipmentChance * 0.15;

    // Start with base thresholds
    let goldThreshold = REWARD_PROBABILITIES.GOLD_THRESHOLD;
    let ingredientThreshold = REWARD_PROBABILITIES.INGREDIENT_THRESHOLD;
    let manaThreshold = REWARD_PROBABILITIES.MANA_THRESHOLD;
    let staticEquipmentThreshold = REWARD_PROBABILITIES.STATIC_EQUIPMENT_THRESHOLD;

    // Reduce gold chance to make room for increased item chances
    if (ingredientBonus > 0 || equipmentBonus > 0) {
      const totalBonus = ingredientBonus + equipmentBonus;
      goldThreshold = Math.max(0.15, goldThreshold - totalBonus * 0.5);
    }

    // Increase ingredient threshold
    ingredientThreshold = clamp(ingredientThreshold + ingredientBonus, goldThreshold, 0.7);

    // Keep mana threshold relative
    manaThreshold = clamp(manaThreshold, ingredientThreshold, 0.8);

    // Increase equipment threshold
    staticEquipmentThreshold = clamp(
      staticEquipmentThreshold + equipmentBonus,
      manaThreshold,
      0.95
    );

    return {
      GOLD_THRESHOLD: goldThreshold,
      INGREDIENT_THRESHOLD: ingredientThreshold,
      MANA_THRESHOLD: manaThreshold,
      STATIC_EQUIPMENT_THRESHOLD: staticEquipmentThreshold,
    };
  }

  private generateGoldReward(portalLevel: number, effectModifiers?: PortalEffectModifiers): Reward {
    const baseAmount = 10;
    const levelBonus = portalLevel * 5;
    const variance = Math.floor(Math.random() * 10);
    let amount = baseAmount + levelBonus + variance;

    // Apply gold multiplier from effect modifiers
    if (effectModifiers) {
      amount = Math.floor(amount * effectModifiers.goldMultiplier);
    }

    return {
      type: 'gold',
      amount,
    };
  }

  private generateManaReward(portalLevel: number, effectModifiers?: PortalEffectModifiers): Reward {
    const baseAmount = 5;
    const levelBonus = portalLevel * 3;
    const variance = Math.floor(Math.random() * 5);
    let amount = baseAmount + levelBonus + variance;

    // Apply mana multiplier from effect modifiers
    if (effectModifiers) {
      amount = Math.floor(amount * effectModifiers.manaMultiplier);
    }

    return {
      type: 'mana',
      amount,
    };
  }

  private generateIngredientReward(
    portalLevel: number,
    effectModifiers?: PortalEffectModifiers
  ): Reward {
    // Higher portal levels can drop rarer ingredients
    let maxIngredientIndex = Math.min(Math.floor(portalLevel / 2) + 3, INGREDIENTS.length - 1);

    // Apply rarity bonus from effect modifiers
    if (effectModifiers && effectModifiers.rarityBonus > 0) {
      maxIngredientIndex = Math.min(
        maxIngredientIndex + effectModifiers.rarityBonus,
        INGREDIENTS.length - 1
      );
    }

    const eligibleIngredients = INGREDIENTS.slice(0, maxIngredientIndex + 1);
    const ingredient = randomElement(eligibleIngredients);

    return {
      type: 'ingredient',
      itemId: ingredient.id,
      amount: 1,
    };
  }

  private generateEquipmentReward(
    portalLevel: number,
    effectModifiers?: PortalEffectModifiers
  ): Reward {
    // Higher portal levels can drop better equipment
    let rarityThreshold = Math.min(portalLevel / 5, 4);

    // Apply rarity bonus from effect modifiers
    if (effectModifiers && effectModifiers.rarityBonus > 0) {
      rarityThreshold = Math.min(rarityThreshold + effectModifiers.rarityBonus * 0.5, 4);
    }

    const eligibleEquipment = EQUIPMENT.filter((eq) => {
      const rarityScore = this.getRarityScore(eq.rarity);
      return rarityScore <= rarityThreshold;
    });

    if (eligibleEquipment.length === 0) {
      // Fallback to gold
      return this.generateGoldReward(portalLevel, effectModifiers);
    }

    const equipment = randomElement(eligibleEquipment);

    return {
      type: 'equipment',
      itemId: equipment.id,
      amount: 1,
    };
  }

  /**
   * Generate a procedurally created equipment item as a reward.
   * The item level is based on the portal level.
   */
  private generateGeneratedEquipmentReward(
    portalLevel: number,
    effectModifiers?: PortalEffectModifiers
  ): Reward {
    // Use portal level to determine equipment generation level
    let effectiveLevel = portalLevel;

    // Apply rarity bonus to increase generation level
    if (effectModifiers && effectModifiers.rarityBonus > 0) {
      effectiveLevel = Math.floor(portalLevel + effectModifiers.rarityBonus);
    }

    // Increase attribute chances based on effect modifiers
    const options: {
      level: number;
      prefixChance?: number;
      materialChance?: number;
      suffixChance?: number;
    } = { level: effectiveLevel };

    if (effectModifiers) {
      // Higher rarity increases chance of premium attributes
      if (effectModifiers.rarityBonus >= 2) {
        options.prefixChance = 0.9;
        options.materialChance = 0.95;
        options.suffixChance = 0.8;
      } else if (effectModifiers.rarityBonus >= 1) {
        options.prefixChance = 0.75;
        options.materialChance = 0.85;
        options.suffixChance = 0.65;
      }
    }

    const generatedEquipment = equipmentGenerator.generate(options);

    return {
      type: 'generatedEquipment',
      generatedEquipment,
    };
  }

  private getRarityScore(rarity: string): number {
    const scores: Record<string, number> = {
      common: 0,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
    };
    return scores[rarity] || 0;
  }

  public applyReward(
    reward: Reward,
    callbacks: {
      addGold: (amount: number) => void;
      addMana: (amount: number) => void;
      addIngredient: (id: string, amount: number) => void;
      addEquipment: (id: string, amount: number) => void;
      addGeneratedEquipment: (equipment: GeneratedEquipment) => void;
    }
  ): string {
    switch (reward.type) {
      case 'gold':
        callbacks.addGold(reward.amount || 0);
        return `Received ${reward.amount} gold!`;

      case 'mana':
        callbacks.addMana(reward.amount || 0);
        return `Received ${reward.amount} mana!`;

      case 'ingredient':
        if (reward.itemId) {
          callbacks.addIngredient(reward.itemId, reward.amount || 1);
          const ingredient = getIngredientById(reward.itemId);
          return `Received ${ingredient?.name || 'ingredient'}!`;
        }
        break;

      case 'equipment':
        if (reward.itemId) {
          callbacks.addEquipment(reward.itemId, reward.amount || 1);
          const equipment = getEquipmentById(reward.itemId);
          return `Received ${equipment?.name || 'equipment'}!`;
        }
        break;

      case 'generatedEquipment':
        if (reward.generatedEquipment) {
          callbacks.addGeneratedEquipment(reward.generatedEquipment);
          return `Received ${reward.generatedEquipment.name}!`;
        }
        break;
    }

    return 'Received a reward!';
  }
}
