import type { Reward, GeneratedEquipment } from '../types';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { EQUIPMENT, getEquipmentById } from '../data/equipment';
import { randomElement, calculateRewardChance } from '../utils/helpers';
import { equipmentGenerator } from './EquipmentGenerator';

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

  public generateReward(portalLevel: number): Reward | null {
    const chance = calculateRewardChance(portalLevel, this.rewardChanceUpgrade);

    if (Math.random() > chance) {
      return null;
    }

    // Determine reward type using probability thresholds
    const roll = Math.random();

    if (roll < REWARD_PROBABILITIES.GOLD_THRESHOLD) {
      return this.generateGoldReward(portalLevel);
    } else if (roll < REWARD_PROBABILITIES.INGREDIENT_THRESHOLD) {
      return this.generateIngredientReward(portalLevel);
    } else if (roll < REWARD_PROBABILITIES.MANA_THRESHOLD) {
      return this.generateManaReward(portalLevel);
    } else if (roll < REWARD_PROBABILITIES.STATIC_EQUIPMENT_THRESHOLD) {
      return this.generateEquipmentReward(portalLevel);
    } else {
      return this.generateGeneratedEquipmentReward(portalLevel);
    }
  }

  private generateGoldReward(portalLevel: number): Reward {
    const baseAmount = 10;
    const levelBonus = portalLevel * 5;
    const variance = Math.floor(Math.random() * 10);
    const amount = baseAmount + levelBonus + variance;

    return {
      type: 'gold',
      amount,
    };
  }

  private generateManaReward(portalLevel: number): Reward {
    const baseAmount = 5;
    const levelBonus = portalLevel * 3;
    const variance = Math.floor(Math.random() * 5);
    const amount = baseAmount + levelBonus + variance;

    return {
      type: 'mana',
      amount,
    };
  }

  private generateIngredientReward(portalLevel: number): Reward {
    // Higher portal levels can drop rarer ingredients
    const maxIngredientIndex = Math.min(Math.floor(portalLevel / 2) + 3, INGREDIENTS.length - 1);

    const eligibleIngredients = INGREDIENTS.slice(0, maxIngredientIndex + 1);
    const ingredient = randomElement(eligibleIngredients);

    return {
      type: 'ingredient',
      itemId: ingredient.id,
      amount: 1,
    };
  }

  private generateEquipmentReward(portalLevel: number): Reward {
    // Higher portal levels can drop better equipment
    const rarityThreshold = Math.min(portalLevel / 5, 4);

    const eligibleEquipment = EQUIPMENT.filter((eq) => {
      const rarityScore = this.getRarityScore(eq.rarity);
      return rarityScore <= rarityThreshold;
    });

    if (eligibleEquipment.length === 0) {
      // Fallback to gold
      return this.generateGoldReward(portalLevel);
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
  private generateGeneratedEquipmentReward(portalLevel: number): Reward {
    // Use portal level to determine equipment generation level
    const generatedEquipment = equipmentGenerator.generate({
      level: portalLevel,
    });

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
