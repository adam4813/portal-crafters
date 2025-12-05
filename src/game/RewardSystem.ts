import type { Reward } from '../types';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { EQUIPMENT, getEquipmentById } from '../data/equipment';
import { randomElement, calculateRewardChance } from '../utils/helpers';

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

    // Determine reward type
    const roll = Math.random();

    if (roll < 0.4) {
      // 40% chance for gold
      return this.generateGoldReward(portalLevel);
    } else if (roll < 0.7) {
      // 30% chance for ingredient
      return this.generateIngredientReward(portalLevel);
    } else if (roll < 0.9) {
      // 20% chance for mana
      return this.generateManaReward(portalLevel);
    } else {
      // 10% chance for equipment
      return this.generateEquipmentReward(portalLevel);
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
    }

    return 'Received a reward!';
  }
}
